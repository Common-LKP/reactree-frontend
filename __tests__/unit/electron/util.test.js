const { exec } = require("child_process");
const waitOn = require("wait-on");
const {
  checkPortNumber,
  handleErrorMessage,
} = require("../../../public/Electron/utils");
const { dialog } = require("electron");

describe("checkPortNumber", () => {
  afterEach(() => {
    exec(`lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill`);
  });

  it("기본 포트번호는 3000입니다.", () => {
    const result = checkPortNumber();
    expect(result).toBe(3000);
  });

  it("3000번이 실행중이라면 기본 포트번호는 3001로 바뀝니다.", async () => {
    exec("BROWSER=none npm start");
    await waitOn({ resources: [`http://localhost:3000`] });

    const result = checkPortNumber();

    expect(result).toBe(3001);
  });
});

describe("handleErrorMessage", () => {
  jest.mock("electron");

  it("올바르지 않은 폴더 경로", () => {
    const errorMessage = "No such file";
    const detail = "올바르지 않은 폴더 경로입니다.";
    dialog.showMessageBox.mockReturnValue({
      buttons: ["확인"],
      title: "Error!",
      message: "Error",
      detail,
    });

    handleErrorMessage(errorMessage);

    expect(dialog.detail).toBe(errorMessage);
  });
});
