const { ipcMain, BrowserWindow, BrowserView, dialog } = require("electron");
const { exec } = require("child_process");
const path = require("path");
const waitOn = require("wait-on");
const os = require("os");
const fs = require("fs");

const userHomeDir = os.homedir();

const { fileInfo, portNumber, handleErrorMessage } = require("./utils");

const registerIpcHandlers = () => {
  ipcMain.handle("get-path", async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      if (!canceled && filePaths.length > 0) {
        [fileInfo.filePath] = filePaths;

        const reactreePath = path.join(userHomeDir);
        exec(
          `ln -s ${reactreePath}/Desktop/reactree-frontend/src/utils/reactree.js ${filePaths}/src/Symlink.js`,
          (error, stdout, stderr) => {
            handleErrorMessage(error, stdout, stderr);
          },
        );

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
    const win = BrowserWindow.getFocusedWindow();
    const view = new BrowserView();
    win.setBrowserView(view);
    view.setBounds({
      x: 20,
      y: 184,
      width: 480,
      height: 672,
    });
    view.setBackgroundColor("#ffffff");

    exec(
      `PORT=${portNumber} BROWSER=none npm start`,
      { cwd: fileInfo.filePath },
      (error, stdout, stderr) => {
        handleErrorMessage(error, stdout, stderr);
      },
    );

    try {
      await waitOn({ resources: [`http://localhost:${portNumber}`] });
      view.webContents.loadURL(`http://localhost:${portNumber}`);
      await waitOn({ resources: [`${userHomeDir}/Downloads/data.json`] });
    } catch (error) {
      console.error(error);
    }

    const readfile = fs.readFileSync(
      path.join(`${userHomeDir}/Downloads/data.json`),
    );
    const fiberFile = JSON.parse(readfile);

    win.webContents.send("get-node-data", fiberFile);
  });
};

module.exports = { registerIpcHandlers };
