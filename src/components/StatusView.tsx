import "./StatusView.css";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
	forceRerenderAtom,
	noteAtom,
	noteFormattedLastUpdatedAtom,
	restoreSavedNoteAtom,
	savedNoteAtom,
	statusAtom,
} from "../atoms";
import { Button } from "./Button";

export function StatusView() {
	const note = useAtomValue(noteAtom);

	const status = useAtomValue(statusAtom);

	const forceRerender = useSetAtom(forceRerenderAtom);

	const shouldDisplayStatus =
		status !== "editing" && note && note.text.length > 0;

	// biome-ignore lint/correctness/useExhaustiveDependencies: expected behavior
	useEffect(() => {
		forceRerender();
	}, [forceRerender, shouldDisplayStatus]);

	return (
		shouldDisplayStatus && (
			<div className="main-section status">
				<ul className="status-list">
					<LastUpdatedIndicator />

					<SavedChangesIndicator />

					<UnsavedChangesIndicator />

					<NewNoteVersionAvailableIndicator />
				</ul>
			</div>
		)
	);
}

function LastUpdatedIndicator() {
	const noteFormattedLastUpdated = useAtomValue(noteFormattedLastUpdatedAtom);

	return noteFormattedLastUpdated && <li>{noteFormattedLastUpdated}</li>;
}

function SavedChangesIndicator() {
	const note = useAtomValue(noteAtom);

	const savedNote = useAtomValue(savedNoteAtom);

	return (
		note &&
		savedNote &&
		note.id === savedNote.id &&
		note.text === savedNote.text && <li>Saved to browser</li>
	);
}

function UnsavedChangesIndicator() {
	const note = useAtomValue(noteAtom);

	const savedNote = useAtomValue(savedNoteAtom);

	return (
		note &&
		savedNote &&
		note.id === savedNote.id &&
		note.text !== savedNote.text &&
		note.lastUpdated &&
		savedNote.lastUpdated &&
		note.lastUpdated >= savedNote.lastUpdated && (
			<li>You have unsaved changes</li>
		)
	);
}

function NewNoteVersionAvailableIndicator() {
	const note = useAtomValue(noteAtom);

	const savedNote = useAtomValue(savedNoteAtom);
	const restoreSavedNote = useSetAtom(restoreSavedNoteAtom);

	const restore = () => {
		if (savedNote) {
			restoreSavedNote();
		}
	};

	return (
		note &&
		savedNote &&
		note.id === savedNote.id &&
		note.text !== savedNote.text &&
		note.lastUpdated &&
		savedNote.lastUpdated &&
		note.lastUpdated < savedNote.lastUpdated && (
			<>
				<li>A newer version of your note is in your browser</li>

				<li>
					<Button level="in-text" onClick={restore}>
						Restore
					</Button>
				</li>
			</>
		)
	);
}
