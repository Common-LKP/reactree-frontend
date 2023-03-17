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

let defaultPort = 3000;

const checkPortNumber = () => {
  const stdout = execSync(
    "netstat -anv | grep LISTEN | awk '{print $4}'",
  ).toString();
  const lines = stdout.split(os.EOL);

  if (lines[lines.length - 1] === "") {
    lines.pop();
  }

  for (let i = 0; i < lines.length; i += 1) {
    lines[i] = lines[i].slice(lines[i].indexOf(".") + 1);
  }

  const portArray = lines
    .filter(port => port > 999 && port < 10000)
    .map(Number);
  portArray.sort((a, b) => a - b);
  portArray.forEach(port => {
    if (port === defaultPort) defaultPort += 1;
  });

  return defaultPort;
};

const quitApplication = () => {
  try {
    execSync(
      `lsof -i :${defaultPort} | grep LISTEN | awk '{print $2}' | xargs kill`,
    );
    app.quit();
  } catch (error) {
    // console.error("Failed to kill server process:", error);
  }
};

const handleErrorMessage = error => {
  const lines = error.split(os.EOL);
  let detail;

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
    resizable: false,
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

    const portNumber = checkPortNumber();

    if (!canceled && filePaths.length > 0) {
      const projectPath = filePaths[0];

      exec(
        `PORT=${portNumber} BROWSER=none npm run start`,
        {
          cwd: projectPath,
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
    }

    return null;
  } catch (error) {
    return console.error(error);
  }
});
