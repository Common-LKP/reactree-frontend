const { ipcMain, BrowserWindow, BrowserView, dialog } = require("electron");
const { exec } = require("child_process");
const path = require("path");
const waitOn = require("wait-on");
const os = require("os");
const fs = require("fs");

const { fileInfo, portNumber, handleErrorMessage } = require("./utils");

const userHomeDir = os.homedir();

const registerIpcHandlers = () => {
  ipcMain.handle("get-path", async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      if (canceled) return new Error("open dialog failed");

      [fileInfo.filePath] = filePaths;

      const homeDirectory = path.join(userHomeDir);
      exec(
        `ln -s ${homeDirectory}/Desktop/reactree-frontend/src/utils/reactree.js ${filePaths}/src/Symlink-reactree.js`,
        (error, stdout, stderr) => {
          handleErrorMessage(stderr);
        },
      );

      const mainWindow = BrowserWindow.getFocusedWindow();
      mainWindow.webContents.send("send-file-path", fileInfo.filePath);

      const view = new BrowserView();
      mainWindow.setBrowserView(view);
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
        await waitOn({ resources: [`${userHomeDir}/Downloads/data.json`] });
      } catch (error) {
        console.error(error);
      }

      const fiberFile = fs.readFileSync(
        path.join(`${userHomeDir}/Downloads/data.json`),
      );

      mainWindow.webContents.send("get-node-data", JSON.parse(fiberFile));

      return fileInfo.filePath;
    } catch (error) {
      return console.error(error);
    }
  });
};

module.exports = { registerIpcHandlers };
