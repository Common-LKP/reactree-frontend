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

    if (!canceled && filePaths.length > 0) {
      const projectPath = filePaths[0];
      exec("BROWSER=none npm run start", {
        cwd: projectPath,
      });

      await waitOn({ resources: ["http://localhost:3000"] });

      const win = BrowserWindow.getFocusedWindow();
      const view = new BrowserView();

      win.setBrowserView(view);
      view.setBounds({
        x: 50,
        y: 220,
        width: 700,
        height: 600,
      });

      view.webContents.loadURL("http://localhost:3000");

      const JScodes = `
        const data = document.querySelector("#root").getAttribute("key");
        JSON.parse(data);
      `;
      const data = await view.webContents.executeJavaScript(JScodes, true);

      return data;
    }

    return null;
  } catch (error) {
    return console.error(error);
  }
});
