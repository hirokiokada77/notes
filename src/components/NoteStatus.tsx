import "./NoteStatus.css";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectAllSavedNotes, setActiveNote } from "../notesSlice";
import { selectStringResources } from "../stringResourcesSlice";
import { selectTime } from "../timeSlice";
import { updateToastText } from "../toastTextSlice";
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
	const stringResources = useSelector(selectStringResources);
	const savedNote =
		useAppSelector(selectAllSavedNotes).filter(
			(n) => note && n.id === note.id,
		)[0] ?? null;

	return (
		note &&
		savedNote &&
		note.id === savedNote.id &&
		note.text === savedNote.text && <li>{stringResources.savedToBrowser}</li>
	);
};

const UnsavedChangesIndicator = ({ note }: NoteStatusProps) => {
	const stringResources = useSelector(selectStringResources);
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
		note.lastUpdated >= savedNote.lastUpdated && (
			<li>{stringResources.unsavedChanges}</li>
		)
	);
};

const NewerVersionAvailableIndicator = ({ note }: NoteStatusProps) => {
	const dispatch = useAppDispatch();
	const savedNote =
		useAppSelector(selectAllSavedNotes).filter(
			(n) => note && n.id === note.id,
		)[0] ?? null;

	const restore = () => {
		dispatch(setActiveNote(savedNote));
		dispatch(updateToastText("messageLoadedFromBrowser"));
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
