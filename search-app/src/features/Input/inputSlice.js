import { createSlice } from "@reduxjs/toolkit";

export const inputSlice = createSlice({
	name: "input",
	initialState: {
		value: "",
		keywords: [],
	},
	reducers: {
		updateInput: (state = "", action) => {
			state.value = action.payload;
			state.keywords = String(action.payload.value).split(" ");
		},
	},
});

export const { updateInput } = inputSlice.actions;

export default inputSlice.reducer;
