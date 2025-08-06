import { createSlice } from "@reduxjs/toolkit";
import { updateLocale } from "./localeSlice";
import { getStringResources, initialStringResources } from "./utils";

const initialState = initialStringResources;

const stringResourcesSlice = createSlice({
	name: "stringResources",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(updateLocale, (_state, action) =>
			getStringResources(action.payload),
		);
	},
	selectors: {
		selectStringResources: (state) => state,
	},
});

export const stringResourcesReducer = stringResourcesSlice.reducer;

export const { selectStringResources } = stringResourcesSlice.selectors;
