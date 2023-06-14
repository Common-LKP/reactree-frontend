import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import React from "react";
import store from "./App/store";
import App from "./App/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
