/**
 * @jest-environment jsdom
 */
import React from "react";
const { render } = require("@testing-library/react");
const { getElementByIdAsync } = require("../../../public/Electron/renderer");

describe("getElementByIdAsync", () => {
  it("폴더 선택 버튼을 올바르게 가져옵니다.", async () => {
    setTimeout(() => {
      render(<div id="directoryButton"></div>);
    }, 1000);
    const result = await getElementByIdAsync("directoryButton");
    expect(result.getAttribute("id")).toBe("directoryButton");
  });

  it("실행 버튼을 올바르게 가져옵니다.", async () => {
    setTimeout(() => {
      render(<div id="npmStartButton"></div>);
    }, 1500);
    const result = await getElementByIdAsync("npmStartButton");
    expect(result.getAttribute("id")).toBe("npmStartButton");
  });
});
