import { useEffect } from "react";
import {
	type TypedUseSelectorHook,
	useDispatch,
	useSelector,
} from "react-redux";
import { selectLocale } from "./localeSlice";
import type { AppDispatch, RootState } from "./store";
import { selectStringResources } from "./stringResourcesSlice";
import { selectTheme, updateTheme } from "./themeSlice";
import { updateTime } from "./timeSlice";

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useTitle = (title: string) => {
	useEffect(() => {
		document.title = title;
	}, [title]);
};

export const useDescription = () => {
	const stringResources = useAppSelector(selectStringResources);

	useEffect(() => {
		const description = document.querySelector("meta[name=description]");
		description?.setAttribute("content", stringResources.appDescription);
	}, [stringResources.appDescription]);
};

export const useLocale = () => {
	const locale = useAppSelector(selectLocale);

	useEffect(() => {
		const html = document.querySelector("html");
		html?.setAttribute("lang", locale);
	}, [locale]);
};

export const useTheme = () => {
	const dispatch = useAppDispatch();
	const theme = useAppSelector(selectTheme);

	useEffect(() => {
		document.body.classList.remove("dark-mode", "light-mode");
		document.body.classList.add(theme === "dark" ? "dark-mode" : "light-mode");
	}, [theme]);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleThemeChange = (event: MediaQueryListEvent) => {
			dispatch(updateTheme(event.matches ? "dark" : "light"));
		};

		mediaQuery.addEventListener("change", handleThemeChange);

		return () => {
			mediaQuery.removeEventListener("change", handleThemeChange);
		};
	}, [dispatch]);
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
	useDescription();
	useLocale();
	useTheme();
	useTime();
};
