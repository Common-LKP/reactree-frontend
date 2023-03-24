import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import D3Tree from "../../../src/components/D3tree";
import store from "../../../src/App/store";
import React from "react";
import "@testing-library/jest-dom/extend-expect";

jest.mock("electron");

const mockGetNodeData = jest.fn();

const electronAPIMock = {
  getNodeData: mockGetNodeData,
};

beforeAll(() => {
  window.electronAPI = electronAPIMock;
});

describe("D3Tree component", () => {
  it("renders without crashing", () => {
    render(
      <Provider store={store}>
        <D3Tree />
      </Provider>,
    );
  });

  describe("Tree data fetching", () => {
    it("getTreeData is called on component mount", () => {
      render(
        <Provider store={store}>
          <D3Tree />
        </Provider>,
      );

      expect(mockGetNodeData.mock.calls.length).toBe(2);
    });
  });

  describe("Tree rendering", () => {
    it("renders circles representing nodes after selecting a folder", async () => {
      const { container } = render(
        <Provider store={store}>
          <D3Tree />
        </Provider>,
      );

      await waitFor(() => {
        const svgElement = container.querySelector(".svg");
        expect(svgElement).toBeInTheDocument();
      });

      await waitFor(() => {
        const nodes = container.querySelectorAll(".svg > svg > g > a > circle");
        expect(nodes.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Modal and node interaction", () => {
    it("modal displays correct data on node hover", async () => {
      render(
        <Provider store={store}>
          <D3Tree />
        </Provider>,
      );

      const node = document.querySelector(".svg > svg > g > a > circle");
      fireEvent.mouseOver(node);
      const { name, props, state } = node.__data__.data;

      const modalName = screen.getByText(/name:/i);
      const modalProps = screen.getByText(/props:/i);
      const modalState = screen.getByText(/state:/i);
      expect(modalName).toHaveTextContent(`name: ${name}`);
      expect(modalProps).toHaveTextContent(`props: ${props.join(", ")}`);
      expect(modalState).toHaveTextContent(`state: ${state.join(", ")}`);
    });

    it("modal is hidden on mouse leave", () => {
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
  });
});
