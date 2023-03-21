const { execSync } = require("child_process");
const os = require("os");
const { dialog, app } = require("electron");

const fileInfo = {
  filePath: null,
};

const checkPortNumber = () => {
  let defaultPort = 3000;

  const stdout = execSync(
    "netstat -anv | grep LISTEN | awk '{print $4}'",
  ).toString();
  const lines = stdout.split(os.EOL);

  if (lines[lines.length - 1] === "") {
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
    execSync(
      `lsof -i :${portNumber} | grep LISTEN | awk '{print $2}' | xargs kill`,
    );
    app.quit();
  } catch (error) {
    console.error("Failed to kill server process:", error);
  }
};

const handleErrorMessage = error => {
  const lines = error.split(os.EOL);
  let detail;

  if (lines[lines.length - 1] === "") {
    lines.pop();
  }

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].includes("no such file")) {
      detail = "올바르지 않은 폴더 경로입니다.";
      break;
    }

    if (lines[i].includes("Cannot find module")) {
      detail = "모듈정보를 찾을 수 없습니다.";
      break;
    }
  }

  if (detail) {
    dialog.showMessageBox({
      buttons: ["확인"],
      title: "Error!",
      message: "Error",
      detail,
    });
  }
};

module.exports = {
  fileInfo,
  portNumber,
  quitApplication,
  handleErrorMessage,
};
