const { _electron: electron } = require("playwright");
const { test, expect } = require("@playwright/test");

test("get Application Path", async () => {
  const electronApp = await electron.launch({
    args: ["public/Electron/main.js"],
  });

  const appPath = await electronApp.evaluate(async ({ app }) => {
    return app.getAppPath();
  });
  expect(appPath).toBe(
    "/Users/gimtaeu/Desktop/reactree-frontend/public/electron",
  );

  await electronApp.close();
});

test("get Application Title", async () => {
  const electronApp = await electron.launch({
    args: ["public/Electron/main.js"],
  });

  const window = await electronApp.firstWindow();
  const title = await window.title();
  expect(title).toBe("React Application");

  await electronApp.close();
});
