/* eslint-disable no-underscore-dangle */
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App/App";
import deepCopy from "./utils/deepCopy";
import createNode from "./utils/reactFiberTree";
import Node from "./utils/Node";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// 현재 작성중인 로직 확인용(정상배포 전 삭제 필요)
const fiberRootNode = deepCopy(root._internalRoot);
const fiberTree = new Node();

setTimeout(() => {
  createNode(fiberRootNode.current.alternate, fiberTree);
  // 트리구조 확인용 콘솔
  console.log(fiberTree);
  console.log(JSON.stringify(fiberTree, null, 2));
}, 0);
