import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialLocale, type Locale } from "./utils";

interface LocaleState {
	locale: Locale;
}

const initialState: LocaleState = {
	locale: initialLocale,
};

const localeSlice = createSlice({
	name: "locale",
	initialState,
	reducers: {
		updateLocale: (state, action: PayloadAction<Locale>) => {
			state.locale = action.payload;
		},
	},
	selectors: {
		selectLocale: (state) => state.locale,
	},
});

export const localeReducer = localeSlice.reducer;

export const { updateLocale } = localeSlice.actions;

export const { selectLocale } = localeSlice.selectors;
