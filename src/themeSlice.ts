import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Theme } from "./utils";

interface ThemeState {
	theme: Theme;
}

const initialState: ThemeState = {
	theme: window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light",
};

const themeSlice = createSlice({
	name: "theme",
	initialState,
	reducers: {
		updateTheme(state, action: PayloadAction<Theme>) {
			state.theme = action.payload;
		},
	},
	selectors: {
		selectTheme: (state) => state.theme,
	},
});

export const themeReducer = themeSlice.reducer;

export const { updateTheme } = themeSlice.actions;

export const { selectTheme } = themeSlice.selectors;
