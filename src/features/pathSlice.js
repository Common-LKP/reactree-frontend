/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  hasPath: false,
  directoryPath: null,
};

const pathSlice = createSlice({
  name: "path",
  initialState,
  reducers: {
    checkPath(state) {
      state.hasPath = true;
    },
    setDirectoryPath(state, action) {
      state.directoryPath = action.payload.path;
    },
  },
});

export const pathActions = pathSlice.actions;
export default pathSlice.reducer;
