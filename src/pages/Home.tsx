import { useEffect, useRef } from "react";
import { NoteEditField } from "../components/NoteEditField";
import { Tab } from "../components/Tab";
import { URLBox } from "../components/URLBox";
import { useAppDispatch, useAppSelector, useTitle } from "../hooks";
import {
	initializeActiveNote,
	selectActiveNote,
	selectActiveNoteTitle,
	setActiveNote,
} from "../notesSlice";
import { selectStringResources } from "../stringResourcesSlice";
import type { Note } from "../utils";

export const Home = () => {
	const dispatch = useAppDispatch();
	const activeNote = useAppSelector(selectActiveNote);
	const activeNoteTitle = useAppSelector(selectActiveNoteTitle);
	const resourceStrings = useAppSelector(selectStringResources);
	const initialized = useRef(false);
	useTitle(
		activeNoteTitle
			? `${resourceStrings["common/appName"]} – ${activeNoteTitle}`
			: resourceStrings["common/appName"],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: initialization
	useEffect(() => {
		const handleHashChange = () => {
			const params = new URLSearchParams(location.hash.substring(1));
			const id = params.get("id");
			const text = params.get("text");
			const createdAt = params.get("createdAt");
			const lastUpdatedAt = params.get("lastUpdatedAt");

			if (id !== null && text !== null) {
				const note: Note = {
					id,
					text,
					createdAt: createdAt !== null ? Number(createdAt) : null,
					lastUpdatedAt: lastUpdatedAt !== null ? Number(lastUpdatedAt) : null,
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
					if (activeNote.text.trim().length > 0) {
						const params = new URLSearchParams(
							activeNote.createdAt !== null && activeNote.lastUpdatedAt !== null
								? {
										id: activeNote.id,
										text: activeNote.text,
										createdAt: activeNote.createdAt.toString(),
										lastUpdatedAt: activeNote.lastUpdatedAt.toString(),
									}
								: activeNote.lastUpdatedAt !== null
									? {
											id: activeNote.id,
											text: activeNote.text,
											lastUpdated: activeNote.lastUpdatedAt.toString(),
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
						history.replaceState(null, "", `${location.href.split("#")[0]}`);
					}
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

			<NoteEditField />

			<div className="home-section">
				<URLBox />
			</div>
		</div>
	);
};
