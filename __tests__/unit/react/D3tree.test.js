import { Provider } from "react-redux";
import D3Tree from "../../../src/components/D3tree";
import store from "../../../src/App/store";
import React from "react";

import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, screen } from "@testing-library/react";

const mockGetNodeData = jest.fn();

const electronAPIMock = {
  getNodeData: mockGetNodeData,
};

beforeAll(() => {
  window.electronAPI = electronAPIMock;
});

describe("D3Tree component", () => {
  it("정상적으로 렌더링되는지 확인합니다.", () => {
    render(
      <Provider store={store}>
        <D3Tree />
      </Provider>,
    );
  });

  it("component가 마운트 되면 getTreeData가 호출되는지 확인합니다.", () => {
    render(
      <Provider store={store}>
        <D3Tree />
      </Provider>,
    );

    expect(mockGetNodeData.mock.calls.length).toBe(2);
  });

  it("각 element를 나타내는 circle이 렌더링되는지 확인합니다.", () => {
    render(
      <Provider store={store}>
        <D3Tree />
      </Provider>,
    );

    const svgElement = document.querySelector(".svg");
    expect(svgElement).toBeInTheDocument();

    const nodes = document.querySelectorAll(".svg > svg > g > a > circle");
    expect(nodes.length).toBeGreaterThan(0);
  });

  it("각 node에 마우스를 hover하면 모달창이 나타납니다.", () => {
    render(
      <Provider store={store}>
        <D3Tree />
      </Provider>,
    );

    const node = document.querySelector(".svg > svg > g > a > circle");
    fireEvent.mouseOver(node);

    const { name, props, state } = node.__data__.data;
    const modalName = screen.getByText(/name:/);
    const modalProps = screen.getByText(/props:/);
    const modalState = screen.getByText(/state:/);

    expect(modalName).toHaveTextContent(`name: ${name}`);
    expect(modalProps).toHaveTextContent(`props: ${props.join(", ")}`);
    expect(modalState).toHaveTextContent(`state: ${state.join(", ")}`);
  });

  it("마우스가 hover되지 않을 시, 모달창이 숨겨지는지 확인합니다.", () => {
    render(
      <Provider store={store}>
        <D3Tree />
      </Provider>,
    );

    const node = document.querySelector(".svg > svg > g > a > circle");
    fireEvent.mouseOver(node);
    fireEvent.mouseOut(node);

    const { name, props, state } = node.__data__.data;
    const modal = document.querySelector(".modal");

    expect(modal.textContent).not.toMatch(`name: ${name}`);
    expect(modal.textContent).not.toMatch(`props: ${props.join(", ")}`);
    expect(modal.textContent).not.toMatch(`state: ${state.join(", ")}`);
  });

  it("마우스가 hover될 때, 모달창은 마우스 커서에서 조금 떨어저서 보입니다.", () => {
    render(
      <Provider store={store}>
        <D3Tree />
      </Provider>,
    );

    const node = document.querySelector(".svg > svg > g > a > circle");
    const mouseEvent = { clientX: 0, clientY: 0 };
    fireEvent.mouseOver(node, mouseEvent);
    const modal = document.querySelector(".modal");

    setTimeout(() => {
      expect(modal.style.left).toBe(`${mouseEvent.clientX + 10}`);
      expect(modal.style.top).toBe(
        `${mouseEvent.clientY - modal.clientHeight - 10}`,
      );
    }, 0);
  });
});
