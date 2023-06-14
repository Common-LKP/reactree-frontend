/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  directoryPath: null,
};

const pathSlice = createSlice({
  name: "path",
  initialState,
  reducers: {
    setDirectoryPath(state, action) {
      state.directoryPath = action.payload.path;
    },
  },
});

export const { setDirectoryPath } = pathSlice.actions;
export default pathSlice.reducer;
