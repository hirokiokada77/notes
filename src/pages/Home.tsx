import "./Home.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InfoBox } from "../components/InfoBox";
import { InputArea } from "../components/InputArea";
import { Tab } from "../components/Tab";
import { selectAllStringResources } from "../localeSlice";
import {
	initializeActiveNote,
	selectActiveNote,
	selectActiveNoteTitle,
	setActiveNote,
} from "../notesSlice";
import type { Note } from "../utils";

export function Home() {
	const dispatch = useDispatch();
	const activeNote = useSelector(selectActiveNote);
	const activeNoteTitle = useSelector(selectActiveNoteTitle);
	const resourceStrings = useSelector(selectAllStringResources);

	useEffect(() => {
		if (activeNoteTitle) {
			document.title = `${resourceStrings.appName} – ${activeNoteTitle}`;
		} else {
			document.title = resourceStrings.appName;
		}
	}, [activeNoteTitle, resourceStrings]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: initialization
	useEffect(() => {
		const handleHashChange = () => {
			const params = new URLSearchParams(location.hash.substring(1));
			const id = params.get("id");
			const text = params.get("text");
			const created = params.get("created");
			const lastUpdated = params.get("lastUpdated");

			if (id !== null && text !== null) {
				const note: Note = {
					id,
					text,
					created: created !== null ? Number(created) : null,
					lastUpdated: lastUpdated !== null ? Number(lastUpdated) : null,
				};
				dispatch(setActiveNote([note, Date.now()]));
				location.hash = "";
			}
		};

		handleHashChange();

		window.addEventListener("hashchange", handleHashChange);
		return () => {
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: initialization
	useEffect(() => {
		if (!activeNote) {
			dispatch(initializeActiveNote(Date.now()));
		}
	}, []);

	return (
		<div className="home">
			<Tab />

			<InputArea />

			<div className="home-misc">
				<div className="home-section">
					<InfoBox />
				</div>
			</div>
		</div>
	);
}
