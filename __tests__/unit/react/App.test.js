import React from "react";
import App from "../../../src/App/App";
import { Provider } from "react-redux";
import store from "../../../src/App/store";
import pathSlice from "../../../src/features/pathSlice";
import d3treeSlice from "../../../src/features/d3treeSlice";

import { render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";

const electronAPIMock = {
  getNodeData: jest.fn(),
  sendFilePath: jest.fn(),
};

beforeAll(() => {
  window.electronAPI = electronAPIMock;
});

describe("App 컴포넌트 렌더링", () => {
  it("정상적으로 렌더링 되는지 확인합니다.", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    const titleElement = screen.getByText(/Reactree/i);
    expect(titleElement).toBeInTheDocument();
  });

  it("버튼 컴포넌트가 정상적으로 렌더링 되는지 확인합니다.", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    const directoryButtonElement = document.querySelector("#directoryButton");
    const npmstartButtonElement = document.querySelector("#npmStartButton");
    expect(directoryButtonElement).toBeInTheDocument();
    expect(npmstartButtonElement).toBeInTheDocument();
  });

  it("redux store에 filePath가 존재하면 directory 경로가 렌더링 됩니다.", () => {
    const initialState = {
      path: {
        hasPath: true,
        directoryPath: "user/desktop/reactree/",
      },
    };

    const store = configureStore({
      reducer: {
        path: pathSlice,
        d3tree: d3treeSlice,
      },
      preloadedState: initialState,
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    const directoryPath = initialState.path.directoryPath;
    const expectedPathEllips =
      directoryPath.length > 29
        ? `...${directoryPath.slice(-29)}`
        : directoryPath;

    const buttonElement = document.querySelector("#directoryButton");
    expect(buttonElement).toHaveTextContent(expectedPathEllips);
  });

  it("filePath가 없으면 npm start는 비활성화 상태입니다.", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    const npmStartButton = screen.getByText(/npm start/i);
    expect(npmStartButton).toBeDisabled();
  });

  it("Width 와 Height를 조절할 수 있는 slide sidebar 렌더링 됩니다.", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    const widthSlider = screen.getByRole("slider", { name: /width/i });
    const heightSlider = screen.getByRole("slider", { name: /height/i });

    expect(widthSlider).toBeInTheDocument();
    expect(heightSlider).toBeInTheDocument();
  });
});
