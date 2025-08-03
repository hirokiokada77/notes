import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getInitialTheme, type Theme } from "./utils";

const initialState = getInitialTheme();

const themeSlice = createSlice({
	name: "theme",
	initialState,
	reducers: {
		updateTheme: (_state, action: PayloadAction<Theme>) => action.payload,
	},
	selectors: {
		selectTheme: (state) => state,
	},
});

export const themeReducer = themeSlice.reducer;

export const { updateTheme } = themeSlice.actions;

export const { selectTheme } = themeSlice.selectors;
