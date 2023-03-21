const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");

const { quitApplication } = require("./utils");
const { registerIpcHandlers } = require("./ipc-handler");
const { SIZE } = require("../../src/assets/constants");

const createWindow = () => {
  const win = new BrowserWindow({
    width: SIZE.WINDOW_WIDTH,
    height: SIZE.WINDOW_HEIGHT,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("http://localhost:3002");
};

app.whenReady().then(() => {
  createWindow();
  registerIpcHandlers();

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
