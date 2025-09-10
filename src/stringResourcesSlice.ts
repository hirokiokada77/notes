import { createSlice } from "@reduxjs/toolkit";
import { updateLocale } from "./localeSlice";
import {
	getStringResources,
	initialStringResources,
	type StringResources,
} from "./utils";

interface StringResourcesState {
	stringResources: StringResources;
}

const initialState: StringResourcesState = {
	stringResources: initialStringResources,
};

const stringResourcesSlice = createSlice({
	name: "stringResources",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(updateLocale, (state, action) => {
			state.stringResources = getStringResources(action.payload);
		});
	},
	selectors: {
		selectStringResources: (state) => state.stringResources,
	},
});

export const stringResourcesReducer = stringResourcesSlice.reducer;

export const { selectStringResources } = stringResourcesSlice.selectors;
