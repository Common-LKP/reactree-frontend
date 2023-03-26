const { dialog } = require("electron");

const createErrorDialog = content => {
  const title = "에러 발생!";
  dialog.showErrorBox(title, content);
};

module.exports = { createErrorDialog };
