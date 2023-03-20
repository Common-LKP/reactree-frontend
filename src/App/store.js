import { configureStore } from "@reduxjs/toolkit";

import d3treeReducer from "../features/d3treeSlice";
import pathReducer from "../features/pathSlice";

const store = configureStore({
  reducer: {
    d3tree: d3treeReducer,
    path: pathReducer,
  },
});

export default store;
