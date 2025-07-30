import "./App.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toast } from "./components/Toast";
import { homePath, savedNotesPath } from "./constants";
import { selectAllStringResources, selectLocale } from "./localeSlice";
import { Home } from "./pages/Home";
import { SavedNotes } from "./pages/SavedNotes";
import { selectTheme, updateTheme } from "./themeSlice";
import { updateTime } from "./timeSlice";

export function App() {
	const dispatch = useDispatch();
	const locale = useSelector(selectLocale);
	const stringResources = useSelector(selectAllStringResources);
	const theme = useSelector(selectTheme);

	useEffect(() => {
		const description = document.querySelector("meta[name=description]");
		description?.setAttribute("content", stringResources.appDescription);
	}, [stringResources.appDescription]);

	useEffect(() => {
		const html = document.querySelector("html");
		html?.setAttribute("lang", locale);
	}, [locale]);

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

	useEffect(() => {
		const intervalId = setInterval(() => {
			dispatch(updateTime());
		}, 1000);

		return () => {
			clearInterval(intervalId);
		};
	}, [dispatch]);

	return (
		<BrowserRouter>
			<Routes>
				<Route path={homePath} element={<Home />} />
				<Route path={savedNotesPath} element={<SavedNotes />} />
			</Routes>

			<Toast />
		</BrowserRouter>
	);
}
