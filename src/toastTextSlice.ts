import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StringResourceKey } from "./utils";

interface ToastTextState {
	resourceStringKey: StringResourceKey | null;
	created: number;
}

const initialState: ToastTextState = {
	resourceStringKey: null,
	created: 0,
};

const toastTextSlice = createSlice({
	name: "toastText",
	initialState,
	reducers: {
		clearToastText: {
			reducer: (state, action: PayloadAction<number>) => {
				state.resourceStringKey = null;
				state.created = action.payload;
			},
			prepare: () => ({
				payload: Date.now(),
			}),
		},
		updateToastText: {
			reducer: (
				state,
				action: PayloadAction<{
					stringResourceKey: StringResourceKey | null;
					time: number;
				}>,
			) => {
				state.resourceStringKey = action.payload.stringResourceKey;
				state.created = action.payload.time;
			},
			prepare: (stringResourceKey: StringResourceKey) => {
				return {
					payload: { stringResourceKey, time: Date.now() },
				};
			},
		},
	},
	selectors: {
		selectToastText: (state) => state,
	},
});

export const toastTextReducer = toastTextSlice.reducer;

export const { clearToastText, updateToastText } = toastTextSlice.actions;

export const { selectToastText } = toastTextSlice.selectors;
