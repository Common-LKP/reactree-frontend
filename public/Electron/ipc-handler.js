const { ipcMain, BrowserWindow, BrowserView, dialog } = require("electron");
const { exec, execSync } = require("child_process");
const path = require("path");
const waitOn = require("wait-on");
const os = require("os");
const { readFileSync } = require("fs");
const { appendFile, readFile, writeFile } = require("fs/promises");

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
        `ln -s ${homeDirectory}/Desktop/reactree-frontend/src/utils/reactree.js ${filePaths}/src/reactree-symlink.js`,
        (error, stdout, stderr) => {
          handleErrorMessage(stderr);
        },
      );

      const originalUserIndexJScodes = await readFile(
        `${filePaths}/src/index.js`,
        {
          encoding: "utf8",
        },
      );

      const JScodes = `
        // eslint-disable-next-line import/first
        import reactree from "./reactree-symlink";

        setTimeout(() => {
          reactree(root._internalRoot);
        }, 0);
      `;

      await appendFile(`${filePaths}/src/index.js`, JScodes);

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

      const previousPortNumber = 3000;
      execSync(
        `lsof -i :${previousPortNumber} | grep LISTEN | awk '{print $2}' | xargs kill`,
      );
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

      const fiberFile = readFileSync(
        path.join(`${userHomeDir}/Downloads/data.json`),
      );

      mainWindow.webContents.send("get-node-data", JSON.parse(fiberFile));

      exec("rm data.json", { cwd: `${os.homedir()}/Downloads` });

      await writeFile(`${filePaths}/src/index.js`, originalUserIndexJScodes, {
        encoding: "utf8",
        flag: "w",
      });

      exec(`rm ${filePaths}/src/reactree-symlink.js`);

      return fileInfo.filePath;
    } catch (error) {
      return console.error(error);
    }
  });
};

module.exports = { registerIpcHandlers };
