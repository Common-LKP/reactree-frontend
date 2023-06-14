const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");

const { quitApplication } = require("./utils");
const { openDialogHandler, nodeFileHandler } = require("./ipc-handler");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1700,
    height: 1100,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: false,
    },
  });
  win.setMinimumSize(1100, 850);
  win.loadURL("http://localhost:9357");
};

app.whenReady().then(() => {
  createWindow();
  ipcMain.handle("open-dialog", openDialogHandler);
  ipcMain.handle("nodeFileInfo-to-main", nodeFileHandler);

  if (process.platform === "darwin") {
    globalShortcut.register("Command+Q", quitApplication);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", quitApplication);
