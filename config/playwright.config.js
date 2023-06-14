const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  timeout: 12000,
  testDir: "../__tests__/E2E",
  testIgnore: "**/unit/**",
});
