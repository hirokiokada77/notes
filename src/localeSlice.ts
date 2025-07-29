import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
	getInitialLocale,
	type Locale,
	type StringResources,
	stringResourcesByLocale,
} from "./utils";

export interface LocaleState {
	locale: Locale;
	stringResources: StringResources;
}

const initialState: LocaleState = {
	locale: getInitialLocale(),
	stringResources: stringResourcesByLocale[getInitialLocale()],
};

const localeSlice = createSlice({
	name: "locale",
	initialState,
	reducers: {
		updateLocale(state, action: PayloadAction<Locale>) {
			state.locale = action.payload;
		},
	},
	selectors: {
		selectAllStringResources: (state) => stringResourcesByLocale[state.locale],
		selectLocale: (state) => state.locale,
	},
});

export const localeReducer = localeSlice.reducer;

export const { updateLocale } = localeSlice.actions;

export const { selectAllStringResources, selectLocale } = localeSlice.selectors;
