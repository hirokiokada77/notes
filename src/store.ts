import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
	FLUSH,
	PAUSE,
	PERSIST,
	PURGE,
	persistReducer,
	persistStore,
	REGISTER,
	REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { localeReducer } from "./localeSlice";
import { notesReducer } from "./notesSlice";
import { stringResourcesReducer } from "./stringResourcesSlice";
import { timeReducer } from "./timeSlice";
import { toastTextReducer } from "./toastTextSlice";

const persistConfig = {
	key: "root",
	storage,
	whitelist: ["notes"],
};

const rootReducer = combineReducers({
	locale: localeReducer,
	notes: notesReducer,
	stringResources: stringResourcesReducer,
	time: timeReducer,
	toastText: toastTextReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
