import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState = Date.now();

const timeSlice = createSlice({
	name: "time",
	initialState,
	reducers: {
		updateTime: {
			reducer: (_state, action: PayloadAction<number>) => action.payload,
			prepare: () => ({
				payload: Date.now(),
			}),
		},
	},
	selectors: {
		selectTime: (state) => state,
	},
});

export const timeReducer = timeSlice.reducer;

export const { updateTime } = timeSlice.actions;

export const { selectTime } = timeSlice.selectors;
