import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import App from "../../../src/App/App";
import store from "../../../src/App/store";

xit("renders with title", () => {
  const title = "Reactree";
  render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>,
  );
  expect(screen.getByText(title)).toBeInTheDocument();
});
