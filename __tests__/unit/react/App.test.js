import React from "react";
import App from "../../../src/App/App";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import store from "../../../src/App/store";

jest.mock("electron");

const mockGetNodeData = jest.fn();
const mockSendFilePath = jest.fn();

const electronAPIMock = {
  getNodeData: mockGetNodeData,
  sendFilePath: mockSendFilePath,
};

describe.skip("App 컴포넌트 렌더링", () => {
  it("정상 렌더링 되는지 확인", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
  });
});
