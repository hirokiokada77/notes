import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Status } from "./utils";

interface StatusState {
	status: Status;
}

const initialState: StatusState = {
	status: "viewing",
};

const statusSlice = createSlice({
	name: "status",
	initialState,
	reducers: {
		updateStatus(state, action: PayloadAction<Status>) {
			state.status = action.payload;
		},
	},
	selectors: {
		selectStatus: (state) => state.status,
	},
});

export const statusReducer = statusSlice.reducer;

export const { updateStatus } = statusSlice.actions;

export const { selectStatus } = statusSlice.selectors;
