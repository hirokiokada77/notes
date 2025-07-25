import "./App.css";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
	documentTitleAtom,
	localeAtom,
	messagesAtom,
	shouldWarnBeforeLeavingAtom,
	themeAtom,
	updateTimeAtom,
} from "./atoms";
import { Toast } from "./components/Toast";
import { homePath, savedNotesPath } from "./constants";
import { Home } from "./pages/Home";
import { SavedNotes } from "./pages/SavedNotes";

export function App() {
	const locale = useAtomValue(localeAtom);
	const messages = useAtomValue(messagesAtom);
	const [theme, setTheme] = useAtom(themeAtom);
	const documentTitle = useAtomValue(documentTitleAtom);
	const shouldWarnBeforeLeaving = useAtomValue(shouldWarnBeforeLeavingAtom);
	const updateTime = useSetAtom(updateTimeAtom);

	useEffect(() => {
		document.title = documentTitle;
	}, [documentTitle]);

	useEffect(() => {
		const description = document.querySelector("meta[name=description]");

		description?.setAttribute("content", messages.appDescription);
	}, [messages.appDescription]);

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
			setTheme(event.matches ? "dark" : "light");
		};

		mediaQuery.addEventListener("change", handleThemeChange);

		return () => {
			mediaQuery.removeEventListener("change", handleThemeChange);
		};
	}, [setTheme]);

	useEffect(() => {
		const listener = (event: BeforeUnloadEvent) => {
			if (shouldWarnBeforeLeaving) {
				event.preventDefault();
			}
		};

		window.addEventListener("beforeunload", listener);

		return () => {
			window.removeEventListener("beforeunload", listener);
		};
	}, [shouldWarnBeforeLeaving]);

	useEffect(() => {
		const intervalId = setInterval(() => {
			updateTime();
		}, 1000);

		return () => {
			clearInterval(intervalId);
		};
	}, [updateTime]);

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
