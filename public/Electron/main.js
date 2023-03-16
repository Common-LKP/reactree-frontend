/* eslint-disable no-unused-vars */
const {
  app,
  BrowserWindow,
  ipcMain,
  BrowserView,
  dialog,
} = require("electron");
const { exec } = require("child_process");
const path = require("path");
const waitOn = require("wait-on");

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

  const view = new BrowserView();

  win.setBrowserView(view);
  view.setBounds({
    x: 50,
    y: 220,
    width: 700,
    height: 600,
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
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const projectPath = result.filePaths[0];
    exec("BROWSER=none npm run start", {
      cwd: projectPath,
    });

    await waitOn({ resources: ["http://localhost:3000"] });

    return "http://localhost:3000";
  }
  return null;
});

ipcMain.on("load-url", (event, url) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    const view = win.getBrowserView();
    if (view) {
      view.webContents.loadURL(url);
    }
  }
});
