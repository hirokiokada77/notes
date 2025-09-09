import "./NoteStatus.css";
import { createContext, useContext } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectAllSavedNotes, setActiveNote } from "../notesSlice";
import { selectStringResources } from "../stringResourcesSlice";
import { selectTime } from "../timeSlice";
import { updateToastText } from "../toastTextSlice";
import { formatTimeAgo, type Note } from "../utils";
import { Button } from "./Button";

const NoteStatusContext = createContext<Note | null>(null);

export interface NoteStatusProps {
	note: Note;
}

export const NoteStatus = ({ note }: NoteStatusProps) => {
	return (
		<NoteStatusContext.Provider value={note}>
			<div className="note-status">
				<ul className="note-status-list">
					<LastUpdatedIndicator />
					<SavedChangesIndicator />
					<UnsavedChangesIndicator />
					<NewerVersionAvailableIndicator />
				</ul>
			</div>
		</NoteStatusContext.Provider>
	);
};

const LastUpdatedIndicator = () => {
	const note = useContext(NoteStatusContext);
	const currentTime = useAppSelector(selectTime);

	return (
		note?.lastUpdatedAt && (
			<li>{formatTimeAgo(note.lastUpdatedAt, currentTime)}</li>
		)
	);
};

const SavedChangesIndicator = () => {
	const note = useContext(NoteStatusContext);
	const stringResources = useSelector(selectStringResources);
	const savedNote = useAppSelector(selectAllSavedNotes).find(
		(n) => note && n.id === note.id,
	);

	return (
		note &&
		savedNote &&
		note.id === savedNote.id &&
		note.text === savedNote.text && (
			<li>{stringResources["statusMessages/savedToBrowser"]}</li>
		)
	);
};

const UnsavedChangesIndicator = () => {
	const note = useContext(NoteStatusContext);
	const stringResources = useSelector(selectStringResources);
	const savedNote = useAppSelector(selectAllSavedNotes).find(
		(n) => note && n.id === note.id,
	);

	return (
		note &&
		savedNote &&
		note.id === savedNote.id &&
		note.text !== savedNote.text &&
		note.lastUpdatedAt &&
		savedNote.lastUpdatedAt &&
		note.lastUpdatedAt >= savedNote.lastUpdatedAt && (
			<li>{stringResources["statusMessages/unsavedChanges"]}</li>
		)
	);
};

const NewerVersionAvailableIndicator = () => {
	const note = useContext(NoteStatusContext);
	const dispatch = useAppDispatch();
	const savedNote = useAppSelector(selectAllSavedNotes).find(
		(n) => note && n.id === note.id,
	);

	const handleRestoreButtonClick = () => {
		dispatch(setActiveNote(savedNote!));
		dispatch(updateToastText("toastMessages/loadedFromBrowser"));
	};

	return (
		note &&
		savedNote &&
		note.id === savedNote.id &&
		note.text !== savedNote.text &&
		note.lastUpdatedAt &&
		savedNote.lastUpdatedAt &&
		note.lastUpdatedAt < savedNote.lastUpdatedAt && (
			<>
				<li>Newer version in browser</li>

				<li>
					<Button level="in-text" onClick={handleRestoreButtonClick}>
						Restore
					</Button>
				</li>
			</>
		)
	);
};
