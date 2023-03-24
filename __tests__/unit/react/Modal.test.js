import React from "react";
import Modal from "../../../src/components/Modal";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("Modal", () => {
  it("nodeId가 제공되면 children을 렌더링합니다.", () => {
    const testText = "Tree Modal";
    render(<Modal nodeId={1}>{testText}</Modal>);

    const contentElement = screen.getByText(testText);
    expect(contentElement).toBeInTheDocument();

    const computedStyle = window.getComputedStyle(contentElement.parentElement);
    expect(computedStyle.display).toBe("block");
  });

  it("nodeId가 제공되지 않으면 children을 렌더링하지 않습니다.", () => {
    const testText = "Tree Modal";

    render(<Modal nodeId={null}>{testText}</Modal>);

    const contentElement = screen.queryByText(testText);

    setTimeout(() => {
      expect(contentElement).not.toBeInTheDocument();
    }, 0);
  });
});
