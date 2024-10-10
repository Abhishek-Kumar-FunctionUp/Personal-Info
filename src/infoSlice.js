import { createSlice } from "@reduxjs/toolkit";

const infoSlice = createSlice({
  name: "info",
  initialState: [],
  reducers: {
    addEntry: (state, action) => {
      state.push(action.payload);
    },
    updateEntry: (state, action) => {
      const index = state.findIndex((entry) => entry.id === action.payload.id);
      if (index !== -1) {
        state[index] = { ...state[index], ...action.payload.data };
      }
    },
    deleteEntry: (state, action) => {
      return state.filter((entry) => entry.id !== action.payload);
    },
  },
});

export const { addEntry, updateEntry, deleteEntry } = infoSlice.actions;
export default infoSlice.reducer;
