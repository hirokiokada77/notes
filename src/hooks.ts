import { useEffect } from "react";
import {
	type TypedUseSelectorHook,
	useDispatch,
	useSelector,
} from "react-redux";
import { selectLocale } from "./localeSlice";
import type { AppDispatch, RootState } from "./store";
import { updateTime } from "./timeSlice";

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useTitle = (title: string) => {
	useEffect(() => {
		document.title = title;
	}, [title]);
};

export const useLocale = () => {
	const locale = useAppSelector(selectLocale);

	useEffect(() => {
		const html = document.querySelector("html");
		html?.setAttribute("lang", locale);
	}, [locale]);
};

export const useTheme = () => {
	useEffect(() => {
		const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const applyTheme = () => {
			const isDarkMode = darkModeQuery.matches;

			document.body.classList.remove("dark", "light");

			if (isDarkMode) {
				document.body.classList.add("dark");
			} else {
				document.body.classList.add("light");
			}
		};

		applyTheme();

		darkModeQuery.addEventListener("change", applyTheme);

		return () => {
			darkModeQuery.removeEventListener("change", applyTheme);
		};
	}, []);
};

export const useTime = () => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		const intervalId = setInterval(() => {
			dispatch(updateTime());
		}, 1000);

		return () => {
			clearInterval(intervalId);
		};
	}, [dispatch]);
};

export const useInit = () => {
	useLocale();
	useTheme();
	useTime();
};
