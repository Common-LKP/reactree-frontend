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

        // NOTE: 추후 electron directory 절대경로 변경.
        exec(
          `ln -s /Users/gimtaeu/Desktop/reactree-frontend/src/utils/reactree.js ${filePaths}/src/Symlink.js`,
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
      console.error(error);
    }

    const readfile = fs.readFileSync(
      path.join(`${os.homedir()}/Downloads/data.json`),
    );
    const fiberFile = JSON.parse(readfile);

    win.webContents.send("get-node-data", fiberFile);
  });
};

module.exports = { registerIpcHandlers };
