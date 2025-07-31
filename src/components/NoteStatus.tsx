import "./NoteStatus.css";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectAllSavedNotes, setActiveNote } from "../notesSlice";
import { selectTime } from "../timeSlice";
import { formatTimeAgo, type Note } from "../utils";
import { Button } from "./Button";

export interface NoteStatusProps {
	note: Note;
}

export const NoteStatus = (props: NoteStatusProps) => {
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
};

const LastUpdatedIndicator = ({ note }: NoteStatusProps) => {
	const currentTime = useAppSelector(selectTime);

	return (
		note.lastUpdated && <li>{formatTimeAgo(note.lastUpdated, currentTime)}</li>
	);
};

const SavedChangesIndicator = ({ note }: NoteStatusProps) => {
	const savedNote =
		useAppSelector(selectAllSavedNotes).filter(
			(n) => note && n.id === note.id,
		)[0] ?? null;

	return (
		note &&
		savedNote &&
		note.id === savedNote.id &&
		note.text === savedNote.text && <li>Saved to browser</li>
	);
};

const UnsavedChangesIndicator = ({ note }: NoteStatusProps) => {
	const savedNote =
		useAppSelector(selectAllSavedNotes).filter(
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
};

const NewerVersionAvailableIndicator = ({ note }: NoteStatusProps) => {
	const dispatch = useAppDispatch();
	const savedNote =
		useAppSelector(selectAllSavedNotes).filter(
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
};
