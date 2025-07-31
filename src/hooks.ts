import { useEffect } from "react";
import {
	type TypedUseSelectorHook,
	useDispatch,
	useSelector,
} from "react-redux";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useTitle = (title: string) => {
	useEffect(() => {
		document.title = title;
	}, [title]);
};
