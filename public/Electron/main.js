/* eslint-disable no-unused-vars */
const {
  app,
  BrowserWindow,
  ipcMain,
  BrowserView,
  dialog,
  globalShortcut,
} = require("electron");
const { exec, execSync } = require("child_process");
const path = require("path");
const os = require("os");
const waitOn = require("wait-on");

const fileInfo = {
  filePath: null,
};

const checkPortNumber = () => {
  let defaultPort = 3000;

  const stdout = execSync(
    "netstat -anv | grep LISTEN | awk '{print $4}'",
  ).toString();
  const lines = stdout.split(os.EOL);

  if (lines[lines.length - 1] === "") {
    lines.pop();
  }

  lines.forEach((line, index) => {
    lines[index] = line.slice(line.indexOf(".") + 1);
  });

  const portArray = lines
    .filter(port => port > 999 && port < 10000)
    .map(Number);
  portArray.sort((a, b) => a - b);
  portArray.forEach(port => {
    if (port === defaultPort) defaultPort += 1;
  });

  return defaultPort;
};

const portNumber = checkPortNumber();

const quitApplication = () => {
  try {
    execSync(
      `lsof -i :${portNumber} | grep LISTEN | awk '{print $2}' | xargs kill`,
    );
    app.quit();
  } catch (error) {
    console.error("Failed to kill server process:", error);
  }
};

const handleErrorMessage = error => {
  const lines = error.split(os.EOL);
  let detail;
  console.log(lines[0]);

  if (lines[lines.length - 1] === "") {
    lines.pop();
  }

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes("no such file")) {
      detail = "올바르지 않은 폴더 경로입니다.";
      break;
    }

    if (lines[i].includes("Cannot find module")) {
      detail = "모듈정보를 찾을 수 없습니다.";
      break;
    }
  }

  if (detail) {
    dialog.showMessageBox({
      buttons: ["확인"],
      title: "Error!",
      message: "Error",
      detail,
    });
  }
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1040,
    height: 900,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL("http://localhost:3002");
};

app.whenReady().then(() => {
  createWindow();

  if (process.platform === "darwin") {
    globalShortcut.register("Command+Q", () => {
      quitApplication();
    });
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle("get-path", async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    if (!canceled && filePaths.length > 0) {
      [fileInfo.filePath] = filePaths;

      BrowserWindow.getFocusedWindow().webContents.send(
        "send-file-path",
        fileInfo.filePath,
      );
    }

    return null;
  } catch (error) {
    return console.error(error);
  }
});

ipcMain.handle("npmStartButton", async (event, result) => {
  const view = new BrowserView();
  BrowserWindow.getFocusedWindow().setBrowserView(view);
  view.setBounds({
    x: 20,
    y: 184,
    width: 480,
    height: 672,
  });
  view.setBackgroundColor("#ffffff");

  view.webContents.loadFile(path.join(__dirname, "../views/loading.html"));

  exec(
    `PORT=${portNumber} BROWSER=none npm start`,
    {
      cwd: fileInfo.filePath,
    },
    (error, stdout, stderr) => {
      handleErrorMessage(stderr);
    },
  );

  await waitOn({ resources: [`http://localhost:${portNumber}`] });
  view.webContents.loadURL(`http://localhost:${portNumber}`);

  const JScodes = `
    const data = document.querySelector("#root").getAttribute("key");
    JSON.parse(data);
  `;
  const data = await view.webContents.executeJavaScript(JScodes, true);

  BrowserWindow.getFocusedWindow().webContents.send("send-fiberData", data);
});
