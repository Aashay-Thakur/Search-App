import { configureStore, applyMiddleware } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import inputReducer from "../features/Input/inputSlice";
import adsReducer from "../features/Ads/adsSlice";

export const store = configureStore({
	reducer: {
		input: inputReducer,
		ads: adsReducer,
	},
	initialState: {
		input: {
			value: "",
			keywords: [],
		},
		ads: {
			ads: [],
		},
	},
	applyMiddleware: applyMiddleware(thunk),
});

