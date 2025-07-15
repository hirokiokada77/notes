import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
	documentTitleAtom,
	forceRerenderAtom,
	localeAtom,
	messagesAtom,
	noteAtom,
	restoreNoteFromHashAtom,
	savedNoteAtom,
	themeAtom,
	updateUrlAtom,
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

	const updateUrl = useSetAtom(updateUrlAtom);

	const note = useAtomValue(noteAtom);
	const restoreNoteFromHash = useSetAtom(restoreNoteFromHashAtom);

	const savedNote = useAtomValue(savedNoteAtom);

	const forceRerender = useSetAtom(forceRerenderAtom);

	const documentTitle = useAtomValue(documentTitleAtom);

	useEffect(() => {
		document.title = documentTitle;
	}, [documentTitle]);

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
			updateUrl(location.href);
		};

		window.addEventListener("hashchange", listener);

		return () => window.removeEventListener("hashchange", listener);
	}, [updateUrl]);

	useEffect(() => {
		const updateTextFromHashChange = () => {
			restoreNoteFromHash(location.hash);
		};

		window.addEventListener("hashchange", updateTextFromHashChange);

		return () =>
			window.removeEventListener("hashchange", updateTextFromHashChange);
	}, [restoreNoteFromHash]);

	useEffect(() => {
		if (note) {
			const encodedNote = encodeURIComponent(JSON.stringify(note));
			const newHash = encodedNote ? `#${encodedNote}` : "";
			if (window.location.hash !== newHash) {
				window.location.hash = newHash;
			}
		} else {
			window.location.hash = "";
		}
	}, [note]);

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
