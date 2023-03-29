const { app, dialog } = require("electron");
const { execSync, exec } = require("child_process");
const os = require("os");

const checkPortNumber = () => {
  let defaultPort = 3000;

  const stdout = execSync(
    "netstat -anv | grep LISTEN | awk '{print $4}'",
  ).toString();
  const lines = stdout.split(os.EOL);

  if (lines.at(-1) === "") {
    lines.pop();
  }

  lines.forEach((line, index) => {
    lines[index] = line.slice(line.indexOf(".") + 1);
  });

  const portArray = lines
    .filter(port => port > 999 && port < 10000)
    .map(Number);
  portArray.sort((a, b) => a - b);
  portArray.forEach(port => {
    if (port === defaultPort) defaultPort += 1;
  });

  return defaultPort;
};

const portNumber = checkPortNumber();

const quitApplication = () => {
  try {
    exec("rm data.json", { cwd: `${os.homedir()}/Downloads` });
    execSync(
      `lsof -i :${portNumber} | grep LISTEN | awk '{print $2}' | xargs kill`,
    );

    app.quit();
  } catch (error) {
    console.error("Failed to kill server process:", error);
  }
};

const getErrorMessage = sdterr => {
  const lines = sdterr.split(os.EOL);
  let detail;

  if (lines.at(-1) === "") {
    lines.pop();
  }

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes("No such file")) {
      detail = "올바르지 않은 폴더 경로입니다.";
      break;
    }

    if (lines[i].includes("Cannot find module")) {
      detail = "모듈정보를 찾을 수 없습니다.";
      break;
    }

    if (lines[i].includes("npm ERR!")) {
      detail = "NPM Error";
    }
  }

  return detail;
};

const checkDownloadJson = async window => {
  const options = {
    type: "question",
    buttons: ["Yes", "No"],
    defaultId: 1,
    title: "Confirm",
    message:
      "트리구조를 그리기 위해서는 JSON파일을 다운로드 해야합니다. \n 다운로드 하시겠습니까?",
  };

  const result = await dialog.showMessageBox(window, options);

  return result.response === 0;
};

const createErrorDialog = content => {
  const title = "에러 발생!";
  dialog.showErrorBox(title, content);
};

module.exports = {
  getErrorMessage,
  quitApplication,
  createErrorDialog,
  portNumber,
  checkDownloadJson,
};
