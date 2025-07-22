import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
	documentTitleAtom,
	forceRerenderAtom,
	localeAtom,
	messagesAtom,
	noteAtom,
	restoreSavedNoteAtom,
	savedNoteAtom,
	themeAtom,
} from "./atoms";
import { ButtonGroup } from "./components/ButtonGroup";
import { InfoBox } from "./components/InfoBox";
import { InputArea } from "./components/InputArea";
import { SettingsPanel } from "./components/SettingsPanel";
import { StatusView } from "./components/StatusView";
import { Toast } from "./components/Toast";

export function App() {
	const locale = useAtomValue(localeAtom);

	const messages = useAtomValue(messagesAtom);

	const theme = useAtomValue(themeAtom);

	const note = useAtomValue(noteAtom);
	const restoreSavedNote = useSetAtom(restoreSavedNoteAtom);

	const savedNote = useAtomValue(savedNoteAtom);

	const forceRerender = useSetAtom(forceRerenderAtom);

	const documentTitle = useAtomValue(documentTitleAtom);

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
		const listener = (event: BeforeUnloadEvent) => {
			if (
				note &&
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
				forceRerender();
			}
		};

		document.addEventListener("visibilitychange", listener);

		return () => {
			document.removeEventListener("visibilitychange", listener);
		};
	}, [forceRerender]);

	useEffect(() => {
		if (note === null && savedNote) {
			restoreSavedNote();
		}
	}, [note, savedNote, restoreSavedNote]);

	return (
		<div className="main">
			<Toast />

			<InputArea />

			<ButtonGroup />

			<StatusView />

			<InfoBox />

			<SettingsPanel />
		</div>
	);
}
