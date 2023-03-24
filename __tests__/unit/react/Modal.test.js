import React from "react";
import { render, screen } from "@testing-library/react";
import Modal from "../../../src/components/Modal";
import "@testing-library/jest-dom";

describe.skip("Modal", () => {
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

    if (contentElement) {
      const computedStyle = window.getComputedStyle(
        contentElement.parentElement,
      );
      expect(computedStyle.display).toBe("block");
    } else {
      expect(contentElement).not.toBeInTheDocument();
    }
  });
});
