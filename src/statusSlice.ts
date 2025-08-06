import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialStatus, type Status } from "./utils";

const initialState = initialStatus;

const statusSlice = createSlice({
	name: "status",
	initialState,
	reducers: {
		updateStatus: (_state, action: PayloadAction<Status>) => action.payload,
	},
	selectors: {
		selectStatus: (state) => state,
	},
});

export const statusReducer = statusSlice.reducer;

export const { updateStatus } = statusSlice.actions;

export const { selectStatus } = statusSlice.selectors;
