import "./StatusView.css";
import { useAtomValue, useSetAtom } from "jotai";
import {
	noteAtom,
	noteFormattedLastUpdatedAtom,
	restoreSavedNoteAtom,
	savedNoteAtom,
	statusAtom,
} from "../atoms";

export function StatusView() {
	const note = useAtomValue(noteAtom);

	const status = useAtomValue(statusAtom);

	const shouldDisplayStatus =
		status !== "editing" && note && note.text.length > 0;

	return (
		shouldDisplayStatus && (
			<div className="status">
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

	return <li>{noteFormattedLastUpdated}</li>;
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
		note.lastUpdated >= savedNote.lastUpdated && (
			<li>You have unsaved changes</li>
		)
	);
}

function NewNoteVersionAvailableIndicator() {
	const note = useAtomValue(noteAtom);

	const savedNote = useAtomValue(savedNoteAtom);
	const restoreSavedNote = useSetAtom(restoreSavedNoteAtom);

	const restoreNoteFromBrowser = () => {
		if (savedNote) {
			restoreSavedNote();

			globalThis.registerToastMessage("note_loaded_from_browser");
		}
	};

	return (
		note &&
		savedNote &&
		note.id === savedNote.id &&
		note.text !== savedNote.text &&
		note.lastUpdated < savedNote.lastUpdated && (
			<>
				<li>A newer version of your note is in your browser</li>

				<li>
					<button
						type="button"
						className="text-button"
						onClick={restoreNoteFromBrowser}
					>
						Restore
					</button>
				</li>
			</>
		)
	);
}
