const { ipcMain, BrowserWindow, BrowserView, dialog } = require("electron");
const { exec } = require("child_process");
const path = require("path");
const waitOn = require("wait-on");
const os = require("os");
const fs = require("fs");

const { fileInfo, portNumber, handleErrorMessage } = require("./utils");

const registerIpcHandlers = () => {
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

  ipcMain.handle("npmStartButton", async () => {
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
      { cwd: fileInfo.filePath },
      (error, stdout, stderr) => {
        handleErrorMessage(stderr);
      },
    );

    try {
      await waitOn({ resources: [`http://localhost:${portNumber}`] });
      view.webContents.loadURL(`http://localhost:${portNumber}`);
      await waitOn({ resources: [`${os.homedir()}/Downloads/data.json`] });
    } catch (error) {
      console.log(error);
    }

    const readfile = fs.readFileSync(
      path.join(`${os.homedir()}/Downloads/data.json`),
    );
    const fiberFile = JSON.parse(readfile);

    BrowserWindow.getFocusedWindow().webContents.send(
      "get-node-data",
      fiberFile,
    );
  });
};

module.exports = { registerIpcHandlers };
