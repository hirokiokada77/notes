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

	const shouldDisplayLastUpdated =
		status !== "editing" && note && note.text.length > 0;

	// biome-ignore lint/correctness/useExhaustiveDependencies: expected behavior
	useEffect(() => {
		forceRerender();
	}, [forceRerender, shouldDisplayLastUpdated]);

	return (
		<div className="status-view">
			<ul className="status-view-list">
				{shouldDisplayLastUpdated && <LastUpdatedIndicator />}

				<SavedChangesIndicator />

				<UnsavedChangesIndicator />

				<NewNoteVersionAvailableIndicator />
			</ul>
		</div>
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
		note.lastUpdated >= savedNote.lastUpdated && <li>Unsaved changes</li>
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
				<li>Newer version in browser</li>

				<li>
					<Button level="in-text" onClick={restore}>
						Restore
					</Button>
				</li>
			</>
		)
	);
}
