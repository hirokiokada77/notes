import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialLocale, type Locale } from "./utils";

const initialState = initialLocale;

const localeSlice = createSlice({
	name: "locale",
	initialState,
	reducers: {
		updateLocale: (_state, action: PayloadAction<Locale>) => action.payload,
	},
	selectors: {
		selectLocale: (state) => state,
	},
});

export const localeReducer = localeSlice.reducer;

export const { updateLocale } = localeSlice.actions;

export const { selectLocale } = localeSlice.selectors;
