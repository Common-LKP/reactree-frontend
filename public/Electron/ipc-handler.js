const { BrowserWindow, BrowserView, dialog } = require("electron");
const { exec, execSync } = require("child_process");
const path = require("path");
const os = require("os");
const { readFileSync, writeFileSync, appendFileSync } = require("fs");
const waitOn = require("wait-on");

const {
  getErrorMessage,
  checkDownloadJson,
  portNumber,
  createErrorDialog,
} = require("./utils");

const userHomePath = os.homedir();

const handleError = (view, message) => {
  view.webContents.loadFile(path.join(__dirname, "../views/errorPage.html"));
  view.setBackgroundColor("white");
  createErrorDialog(message);
};

const openDialogHandler = async () => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  const view = new BrowserView();
  mainWindow.setBrowserView(view);
  view.setBounds({
    x: 8,
    y: 164,
    width: 740,
    height: 740,
  });
  view.setAutoResize({ width: true, height: true });

  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (canceled)
    return handleError(
      view,
      "서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.",
    );

  const filePath = filePaths[0];

  const checkUserConfirm = await checkDownloadJson(mainWindow);

  if (!checkUserConfirm) return undefined;

  exec(
    `ln -s ${userHomePath}/Desktop/reactree-frontend/src/utils/reactree.js ${filePath}/src/reactree-symlink.js`,
    (error, stdout, stderr) => {
      const pathError = getErrorMessage(stderr);

      if (pathError) handleError(view, pathError);
    },
  );

  const originUsersJS = readFileSync(`${filePath}/src/index.js`, {
    encoding: "utf8",
  });
  const JScodes = `
    // eslint-disable-next-line import/first
    import reactree from "./reactree-symlink";

    setTimeout(() => {
      reactree(root._internalRoot);
    }, 0);
  `;

  if (!originUsersJS.includes("import reactree from")) {
    appendFileSync(`${filePath}/src/index.js`, JScodes);
  }

  mainWindow.webContents.send("path-to-react", filePath);
  view.webContents.loadFile(path.join(__dirname, "../views/loading.html"));
  view.setBackgroundColor("white");

  execSync(
    `lsof -i :${portNumber} | grep LISTEN | awk '{print $2}' | xargs kill`,
  );

  exec(
    `PORT=${portNumber} BROWSER=none npm start`,
    { cwd: filePath },
    (error, stdout, stderr) => {
      const startError = getErrorMessage(stderr);

      if (startError) handleError(view, startError);
    },
  );

  await waitOn({ resources: [`http://localhost:${portNumber}`] });
  view.webContents.loadURL(`http://localhost:${portNumber}`);

  await waitOn({ resources: [`${userHomePath}/Downloads/data.json`] });
  const fiberFile = readFileSync(
    path.join(`${userHomePath}/Downloads/data.json`),
  );

  mainWindow.webContents.send("node-to-react", JSON.parse(fiberFile));
  writeFileSync(`${filePath}/src/index.js`, originUsersJS, {
    encoding: "utf8",
  });
  exec(`rm ${filePath}/src/reactree-symlink.js`);
  exec("rm data.json", { cwd: `${userHomePath}/Downloads` });

  return undefined;
};

const nodeFileHandler = (event, value) => {
  const nodeFilePath = value?.fileName;
  const code = readFileSync(nodeFilePath, { encoding: "utf8" });

  const mainWindow = BrowserWindow.getFocusedWindow();
  mainWindow.webContents.send("nodeFileInfo-to-react", code);
};

exports.openDialogHandler = openDialogHandler;
exports.nodeFileHandler = nodeFileHandler;
