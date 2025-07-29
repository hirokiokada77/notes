import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StringResourceKey } from "./utils";

interface ToastTextState {
	content: StringResourceKey | null;
	created: number;
}

const initialState: ToastTextState = {
	content: null,
	created: 0,
};

const toastTextSlice = createSlice({
	name: "toastText",
	initialState,
	reducers: {
		clearToastText(state, action: PayloadAction<number>) {
			state.content = null;
			state.created = action.payload;
		},
		updateToastText(
			state,
			action: PayloadAction<[StringResourceKey | null, number]>,
		) {
			state.content = action.payload[0];
			state.created = action.payload[1];
		},
	},
	selectors: {
		selectToastText: (state) => state,
	},
});

export const toastTextReducer = toastTextSlice.reducer;

export const { clearToastText, updateToastText } = toastTextSlice.actions;

export const { selectToastText } = toastTextSlice.selectors;
