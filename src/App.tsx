import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
	localeAtom,
	messagesAtom,
	noteAtom,
	rerenderAtom,
	savedNoteAtom,
	themeAtom,
	urlAtom,
} from "./atoms";
import { ButtonGroup } from "./components/ButtonGroup";
import { Header } from "./components/Header";
import { InfoBox } from "./components/InfoBox";
import { InputArea } from "./components/InputArea";
import { SettingsPanel } from "./components/SettingsPanel";
import { StatusView } from "./components/StatusView";
import { Toast } from "./components/Toast";
import { createNewNote } from "./utils";

export function App() {
	const locale = useAtomValue(localeAtom);

	const messages = useAtomValue(messagesAtom);

	const theme = useAtomValue(themeAtom);

	const setUrl = useSetAtom(urlAtom);

	const [note, setNote] = useAtom(noteAtom);

	const savedNote = useAtomValue(savedNoteAtom);

	const setRerender = useSetAtom(rerenderAtom);

	useEffect(() => {
		const firstLine = (note.text ?? "").split("\n")[0].trim();
		const maxTitleLength = 140;
		let newTitle = messages.app_name;

		if (firstLine) {
			const truncatedTitle =
				firstLine.length > maxTitleLength
					? `${firstLine.substring(0, maxTitleLength)}...`
					: firstLine;
			newTitle = `${messages.app_name} – ${truncatedTitle}`;
		}
		document.title = newTitle;
	}, [note, messages.app_name]);

	useEffect(() => {
		const description = document.querySelector("meta[name=description]");

		description?.setAttribute("content", messages.app_description);
	}, [messages.app_description]);

	useEffect(() => {
		const html = document.querySelector("html");

		html?.setAttribute("lang", locale);
	}, [locale]);

	useEffect(() => {
		document.body.classList.remove("dark-mode", "light-mode");
		document.body.classList.add(theme === "dark" ? "dark-mode" : "light-mode");
	}, [theme]);

	useEffect(() => {
		const listener = () => {
			setUrl(new URL(location.href));
		};

		window.addEventListener("hashchange", listener);

		return () => window.removeEventListener("hashchange", listener);
	}, [setUrl]);

	useEffect(() => {
		const updateTextFromHashChange = () => {
			const fragment = window.location.hash.substring(1);
			try {
				setNote(JSON.parse(decodeURIComponent(fragment)));
			} catch (error) {
				console.error("Error decoding URL fragment on hashchange:", error);
				setNote(createNewNote());
			}
		};

		window.addEventListener("hashchange", updateTextFromHashChange);
		return () =>
			window.removeEventListener("hashchange", updateTextFromHashChange);
	}, [setNote]);

	useEffect(() => {
		const encodedNote = encodeURIComponent(JSON.stringify(note));
		const newHash = encodedNote ? `#${encodedNote}` : "";
		if (window.location.hash !== newHash) {
			window.location.hash = newHash;
		}
	}, [note]);

	useEffect(() => {
		const listener = (event: BeforeUnloadEvent) => {
			if (
				savedNote &&
				note.id === savedNote.id &&
				note.text !== savedNote.text
			) {
				event.preventDefault(); // Warn about unsaved changes
			}
		};

		window.addEventListener("beforeunload", listener);

		return () => {
			window.removeEventListener("beforeunload", listener);
		};
	}, [note, savedNote]);

	useEffect(() => {
		const listener = () => {
			if (document.visibilityState === "visible") {
				setRerender(Date.now());
			}
		};

		document.addEventListener("visibilitychange", listener);

		return () => {
			document.removeEventListener("visibilitychange", listener);
		};
	}, [setRerender]);

	useEffect(() => {
		const intervalId = setInterval(() => {
			setRerender(Date.now());
		}, 60000);

		return () => clearInterval(intervalId);
	}, [setRerender]);

	return (
		<div className="main">
			<Toast />

			<Header />

			<InputArea />

			<StatusView />

			<ButtonGroup />

			<InfoBox />

			<SettingsPanel />
		</div>
	);
}
