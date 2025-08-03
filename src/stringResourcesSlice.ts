import { createSlice } from "@reduxjs/toolkit";
import { updateLocale } from "./localeSlice";
import { getInitialStringResources, getStringResources } from "./utils";

const initialState = getInitialStringResources();

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
