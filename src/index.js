/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import ReactDOM from "react-dom/client";

import App from "./App/App";
import deepCopy from "./utils/deepCopy";
import createNode from "./utils/reactFiberTree";
import Node from "./utils/Node";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// NOTE: 현재 작성중인 로직 확인용(정상배포 전 삭제 필요)
const fiberRootNode = deepCopy(root._internalRoot);
const fiberTree = new Node();

const getCircularReplacer = () => {
  const seen = new WeakSet();

  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return;

      seen.add(value);
    }

    return value;
  };
};

setTimeout(() => {
  createNode(fiberRootNode.current.alternate, fiberTree);
  window.electronAPI.sendNodeData(
    JSON.stringify(fiberTree, getCircularReplacer(), 2),
  );
}, 0);
