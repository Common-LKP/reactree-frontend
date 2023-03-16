/* eslint-disable no-unused-vars */
const {
  app,
  BrowserWindow,
  ipcMain,
  BrowserView,
  dialog,
} = require("electron");
const { exec, spawnSync, execSync } = require("child_process");
const path = require("path");
const os = require("os");
const waitOn = require("wait-on");

const checkPortNumber = async () => {
  let defaultPort = 3000;
  const stdout = execSync(
    "netstat -anv | grep LISTEN | awk '{print $4}'",
  ).toString();

  console.log(stdout);
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
  console.log(`http://localhost:${defaultPort}`);
  return defaultPort;
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 2000,
    height: 1500,
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

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  exec(
    "lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill",
    (error, stdout, stderr) => {
      if (error) {
        console.error("Failed to kill server process:", error);
      }
      app.quit();
    },
  );
});

ipcMain.handle("get-path", async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    const view = new BrowserView();

    BrowserWindow.getFocusedWindow().setBrowserView(view);
    view.setBounds({
      x: 50,
      y: 220,
      width: 700,
      height: 600,
    });
    view.setBackgroundColor("#ffffff");
    view.webContents.loadFile(path.join(__dirname, "../views/loading.html"));
    const portNumber = await checkPortNumber();

    if (!canceled && filePaths.length > 0) {
      const projectPath = filePaths[0];

      BrowserWindow.getFocusedWindow().setBrowserView(view);
      view.setBounds({
        x: 50,
        y: 220,
        width: 700,
        height: 600,
      });
      view.setBackgroundColor("#ffffff");
      view.webContents.loadFile(path.join(__dirname, "../views/loading.html"));
      console.log("a", portNumber);

      exec(`PORT=${portNumber} BROWSER=none npm run start`, {
        cwd: projectPath,
      });
      console.log("b", portNumber);

      await waitOn({ resources: [`http://localhost:${portNumber}`] });
      console.log("c", portNumber);
      view.webContents.loadURL(`http://localhost:${portNumber}`);
    }
    return null;
  } catch (error) {
    console.log(error.message);
    throw new Error("유효하지않은 url입니다.");
  }
});

// ipcMain.on("load-url", (event, url) => {
//   console.log("url : ", url);
//   const win = BrowserWindow.getFocusedWindow();
//   const view = new BrowserView();

//   win.setBrowserView(view);
//   view.setBounds({
//     x: 50,
//     y: 220,
//     width: 700,
//     height: 600,
//   });
//   view.setBackgroundColor("#ffffff");

//   view.webContents.loadURL(url);
// });
