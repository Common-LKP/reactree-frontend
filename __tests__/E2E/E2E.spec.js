const { _electron: electron } = require("playwright");
const { test, expect } = require("@playwright/test");
const eph = require("electron-playwright-helpers");
const os = require("os");

let electronApp;

test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: ["../public/Electron/main.js"],
  });
});

test.describe("E2E Test", () => {
  let window;

  test("프로젝트의 경로를 확인합니다.", async () => {
    const appPath = await electronApp.evaluate(async ({ app }) => {
      return app.getAppPath();
    });

    expect(appPath).toBe(
      `${os.homedir()}/Desktop/reactree-frontend/public/Electron`,
    );
  });

  test("프로젝트의 이름은 Reactree입니다.", async () => {
    window = await electronApp.firstWindow();
    const title = await window.title();

    expect(title).toBe("React App");

    await window.waitForSelector("h1");
    const header = await window.$eval("h1", element => element.textContent);

    expect(header).toBe("Reactree");
  });

  test("폴더 선택 버튼을 누르면 실행할 경로를 선정할 수 있습니다.", async () => {
    await eph.stubDialog(electronApp, "showOpenDialog", {
      filePaths: [`${os.homedir()}/Desktop/${process.env.DIRECTORY_PATH}`],
      canceled: false,
    });

    await window.getByTestId("path").click();
    const result = await eph.ipcMainInvokeHandler(electronApp, "get-path");

    expect(result).toBe(`${os.homedir()}/Desktop/${process.env.DIRECTORY_PATH}`);
  });

  test("시작 버튼을 누르면 화면에 사용자의 리액트 구조를 추출합니다.", async () => {
    await window.getByTestId("start").click();
    const result = await eph.ipcMainInvokeHandler(
      electronApp,
      "npmStartButton",
    );

    expect(result).toBeDefined();
  });

  test("추출한 데이터를 트리객체로 구조화합니다.", async () => {
    const root = await window.$eval("svg", element => element.textContent);

    expect(root).toContain("root");
    expect(root).toContain("App");
    expect(root).toContain("button");
    expect(root).not.toContain("something");
  });
});
