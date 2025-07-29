import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface TimeState {
	time: number;
}

const initialState: TimeState = {
	time: Date.now(),
};

const timeSlice = createSlice({
	name: "time",
	initialState,
	reducers: {
		updateTime(state, action: PayloadAction<number>) {
			state.time = action.payload;
		},
	},
	selectors: {
		selectTime: (state) => state.time,
	},
});

export const timeReducer = timeSlice.reducer;

export const { updateTime } = timeSlice.actions;

export const { selectTime } = timeSlice.selectors;
