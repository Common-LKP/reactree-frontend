const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");

const { quitApplication } = require("./utils");
const { openDialogHandler } = require("./ipc-handler");
const { SIZE } = require("../../src/assets/constants");

const createWindow = () => {
  const win = new BrowserWindow({
    width: SIZE.WINDOW_WIDTH,
    height: SIZE.WINDOW_HEIGHT,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.setMinimumSize(1100, 850);
  win.loadURL("http://localhost:3002");
};

app.whenReady().then(() => {
  createWindow();
  ipcMain.handle("open-dialog", openDialogHandler);

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
