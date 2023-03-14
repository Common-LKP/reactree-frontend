const { app, BrowserWindow } = require("electron");
const remote = require("@electron/remote/main");

remote.initialize();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    heigth: 1000,
    webPreferences: {
      enableRemoteModul: true,
    },
  });

  win.loadURL("http://localhost:3000");

  remote.enable(win.webContents);
};

app.whenReady().then(() => {
  createWindow();

  app.on("active", () => {
    if (BrowserWindow.getAllWindows.length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
