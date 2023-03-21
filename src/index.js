import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import store from "./App/store";
import App from "./App/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
