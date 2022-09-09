import { createSlice } from "@reduxjs/toolkit";

export const adsSlice = createSlice({
	name: "ads",
	initialState: {
		ads: [],
	},
	reducers: {
		updateAds: (state = [], action) => {
			state.ads = action.payload.ads;
		},
	},
});

export const { updateAds } = adsSlice.actions;

export default adsSlice.reducer;
