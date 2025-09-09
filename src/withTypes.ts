import { createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "./store";

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
	state: RootState;
	dispatch: AppDispatch;
}>();

export const createAppSelector = createSelector.withTypes<RootState>();
