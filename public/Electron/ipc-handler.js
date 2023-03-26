const { ipcMain, BrowserWindow, BrowserView, dialog } = require("electron");
const { exec } = require("child_process");
const path = require("path");
const waitOn = require("wait-on");
const os = require("os");
const fs = require("fs");

const { fileInfo, portNumber, handleErrorMessage } = require("./utils");
const { createErrorDialog } = require("./dialog");

const userHomeDir = os.homedir();
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
            const pathError = handleErrorMessage(stderr);
            if (pathError) createErrorDialog(pathError);
          },
        );

        BrowserWindow.getFocusedWindow().webContents.send(
          "send-file-path",
          fileInfo.filePath,
        );
      }

      return fileInfo.filePath;
    } catch (error) {
      return createErrorDialog(error);
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
        const portError = handleErrorMessage(stderr);
        if (portError) {
          view.webContents.loadFile(
            path.join(__dirname, "../views/errorPage.html"),
          );
          createErrorDialog(portError);
        }
      },
    );

    try {
      await waitOn({ resources: [`http://localhost:${portNumber}`] });
      view.webContents.loadURL(`http://localhost:${portNumber}`);
      await waitOn({ resources: [`${userHomeDir}/Downloads/data.json`] });
    } catch (error) {
      view.webContents.loadFile(
        path.join(__dirname, "../views/errorPage.html"),
      );
      createErrorDialog(
        "서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.",
      );
    }

    const readfile = fs.readFileSync(
      path.join(`${userHomeDir}/Downloads/data.json`),
    );
    const fiberFile = JSON.parse(readfile);

    win.webContents.send("get-node-data", fiberFile);
  });
};

module.exports = { registerIpcHandlers };
