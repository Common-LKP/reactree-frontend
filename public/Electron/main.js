const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
const { quitApplication } = require("./utils");
const { registerIpcHandlers } = require("./ipc-handler");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1040,
    height: 900,
    resizable: true,
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
