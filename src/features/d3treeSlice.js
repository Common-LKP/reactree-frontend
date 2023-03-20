/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  widthSpacing: 150,
  heightSpacing: 250,
  layoutWidth: 400,
  layoutHeight: 850,
};

const d3treeSlice = createSlice({
  name: "d3tree",
  initialState,
  reducers: {
    setLayout(state, action) {
      state.layoutWidth = action.payload.clientWidth;
      state.layoutHeight = action.payload.clientHeight;
    },
    setWidthSpacing(state, action) {
      state.widthSpacing = action.payload.width;
    },
    setHeightSpacing(state, action) {
      state.heightSpacing = action.payload.height;
    },
  },
});

export const d3treeActions = d3treeSlice.actions;
export default d3treeSlice.reducer;
