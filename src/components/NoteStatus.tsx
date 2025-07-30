import "./NoteStatus.css";
import { useDispatch, useSelector } from "react-redux";
import { selectAllSavedNotes, setActiveNote } from "../notesSlice";
import { selectTime } from "../timeSlice";
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
	const currentTime = useSelector(selectTime);

	return (
		note.lastUpdated && <li>{formatTimeAgo(note.lastUpdated, currentTime)}</li>
	);
}

function SavedChangesIndicator({ note }: NoteStatusProps) {
	const savedNote =
		useSelector(selectAllSavedNotes).filter(
			(n) => note && n.id === note.id,
		)[0] ?? null;

	return (
		note &&
		savedNote &&
		note.id === savedNote.id &&
		note.text === savedNote.text && <li>Saved to browser</li>
	);
}

function UnsavedChangesIndicator({ note }: NoteStatusProps) {
	const savedNote =
		useSelector(selectAllSavedNotes).filter(
			(n) => note && n.id === note.id,
		)[0] ?? null;

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
	const dispatch = useDispatch();
	const savedNote =
		useSelector(selectAllSavedNotes).filter(
			(n) => note && n.id === note.id,
		)[0] ?? null;

	const restore = () => {
		if (savedNote) {
			dispatch(setActiveNote(note));
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
