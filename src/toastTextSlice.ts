import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StringResourceKey } from "./utils";

interface ToastTextState {
	resourceStringKey: StringResourceKey | null;
	createdAt: number;
}

const initialState: ToastTextState = {
	resourceStringKey: null,
	createdAt: 0,
};

const toastTextSlice = createSlice({
	name: "toastText",
	initialState,
	reducers: {
		clearToastText: {
			reducer: (state, action: PayloadAction<number>) => {
				state.resourceStringKey = null;
				state.createdAt = action.payload;
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
					timestamp: number;
				}>,
			) => {
				state.resourceStringKey = action.payload.stringResourceKey;
				state.createdAt = action.payload.timestamp;
			},
			prepare: (stringResourceKey: StringResourceKey) => {
				return {
					payload: { stringResourceKey, timestamp: Date.now() },
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
