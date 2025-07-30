import "./Home.css";
import { useEffect, useRef } from "react";
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
	const initialized = useRef(false);

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
				dispatch(setActiveNote(note));
			}
		};

		handleHashChange();

		window.addEventListener("hashchange", handleHashChange);
		return () => {
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, []);

	useEffect(() => {
		const timeoutId = setTimeout(
			() => {
				if (activeNote) {
					const params = new URLSearchParams(
						activeNote.created !== null && activeNote.lastUpdated !== null
							? {
									id: activeNote.id,
									text: activeNote.text,
									created: activeNote.created.toString(),
									lastUpdated: activeNote.lastUpdated.toString(),
								}
							: {
									id: activeNote.id,
									text: activeNote.text,
								},
					);
					history.replaceState(
						null,
						"",
						`${location.href.split("#")[0]}#${params}`,
					);
				} else {
					dispatch(initializeActiveNote());
				}

				initialized.current = true;
			},
			initialized.current ? 300 : 0,
		);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [activeNote, dispatch]);

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
