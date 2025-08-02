import { createSlice } from "@reduxjs/toolkit";
import { updateLocale } from "./localeSlice";
import {
	getInitialLocale,
	type StringResources,
	stringResourcesByLocale,
} from "./utils";

interface StringResourcesState {
	stringResources: StringResources;
}

const initialState: StringResourcesState = {
	stringResources: stringResourcesByLocale[getInitialLocale()],
};

const stringResourcesSlice = createSlice({
	name: "stringResources",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(updateLocale, (state, action) => {
			state.stringResources = stringResourcesByLocale[action.payload];
		});
	},
	selectors: {
		selectStringResources: (state) => state.stringResources,
	},
});

export const stringResourcesReducer = stringResourcesSlice.reducer;

export const { selectStringResources } = stringResourcesSlice.selectors;
