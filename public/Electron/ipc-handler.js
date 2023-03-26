const { ipcMain, BrowserWindow, BrowserView, dialog } = require("electron");
const { exec } = require("child_process");
const path = require("path");
const waitOn = require("wait-on");
const os = require("os");
const fs = require("fs");

const userHomeDirectory = os.homedir();

const { fileInfo, portNumber, handleErrorMessage } = require("./utils");

const registerIpcHandlers = () => {
  ipcMain.handle("get-path", async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      if (!canceled && filePaths.length > 0) {
        [fileInfo.filePath] = filePaths;

        const reactreePath = path.join(userHomeDirectory);
        exec(
          `ln -s ${reactreePath}/Desktop/reactree-frontend/src/utils/reactree.js ${filePaths}/src/Symlink.js`,
          (error, stdout, stderr) => {
            handleErrorMessage(stderr);
          },
        );

        BrowserWindow.getFocusedWindow().webContents.send(
          "send-file-path",
          fileInfo.filePath,
        );
      }

      return fileInfo.filePath;
    } catch (error) {
      return console.error(error);
    }
  });

  ipcMain.handle("npmStartButton", async () => {
    const win = BrowserWindow.getFocusedWindow();
    const view = new BrowserView();
    win.setBrowserView(view);
    view.setBounds({
      x: 8,
      y: 164,
      width: 740,
      height: 740,
    });
    view.setAutoResize({ width: true, height: true });
    view.setBackgroundColor("white");
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
      await waitOn({ resources: [`${userHomeDirectory}/Downloads/data.json`] });
    } catch (error) {
      console.error(error);
    }

    const readfile = fs.readFileSync(
      path.join(`${userHomeDirectory}/Downloads/data.json`),
    );
    const fiberFile = JSON.parse(readfile);
    win.webContents.send("get-node-data", fiberFile);
    return fiberFile;
  });
};

module.exports = { registerIpcHandlers };
