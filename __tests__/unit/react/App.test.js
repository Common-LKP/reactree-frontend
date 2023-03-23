import React, { useEffect, useRef, useLayoutEffect } from "react";
import { useSelector, useDispatch, Provider } from "react-redux";
import App from "../../../src/App/App";
import { render, screen } from "@testing-library/react";

test("renders the landing page", () => {
  render(
    <Provider>
      <App />;
    </Provider>,
  );
});
