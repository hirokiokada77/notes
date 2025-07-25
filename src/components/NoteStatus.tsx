import "./NoteStatus.css";
import { useAtomValue, useSetAtom } from "jotai";
import { restoreSavedNoteAtom, savedNotesAtom, timeAtom } from "../atoms";
import { formatTimeAgo, type Note } from "../utils";
import { Button } from "./Button";

export interface NoteStatusProps {
	note: Note;
}

export function NoteStatus(props: NoteStatusProps) {
	return (
		<div className="note-status">
			<ul className="note-status-list">
				<LastUpdatedIndicator {...props} />

				<SavedChangesIndicator {...props} />

				<UnsavedChangesIndicator {...props} />

				<NewerVersionAvailableIndicator {...props} />
			</ul>
		</div>
	);
}

function LastUpdatedIndicator({ note }: NoteStatusProps) {
	const currentTime = useAtomValue(timeAtom);

	return (
		note.lastUpdated && <li>{formatTimeAgo(note.lastUpdated, currentTime)}</li>
	);
}

function SavedChangesIndicator({ note }: NoteStatusProps) {
	const savedNote =
		useAtomValue(savedNotesAtom).filter((n) => note && n.id === note.id)[0] ??
		null;

	return (
		note &&
		savedNote &&
		note.id === savedNote.id &&
		note.text === savedNote.text && <li>Saved to browser</li>
	);
}

function UnsavedChangesIndicator({ note }: NoteStatusProps) {
	const savedNote =
		useAtomValue(savedNotesAtom).filter((n) => note && n.id === note.id)[0] ??
		null;

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

function NewerVersionAvailableIndicator({ note }: NoteStatusProps) {
	const savedNote =
		useAtomValue(savedNotesAtom).filter((n) => note && n.id === note.id)[0] ??
		null;
	const restoreSavedNote = useSetAtom(restoreSavedNoteAtom);

	const restore = () => {
		if (savedNote) {
			restoreSavedNote(note.id);
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
