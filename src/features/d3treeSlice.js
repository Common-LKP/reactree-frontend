/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  layoutWidth: 700,
  layoutHeight: 1100,
};

const d3treeSlice = createSlice({
  name: "d3tree",
  initialState,
  reducers: {
    setLayout(state, action) {
      state.layoutWidth = action.payload.clientWidth;
      state.layoutHeight = action.payload.clientHeight;
    },
  },
});

export const { setLayout } = d3treeSlice.actions;
export default d3treeSlice.reducer;
