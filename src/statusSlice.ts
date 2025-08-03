import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getInitialStatus, type Status } from "./utils";

const initialState = getInitialStatus();

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
