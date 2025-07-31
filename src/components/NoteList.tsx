import "./NoteList.css";
import { produce } from "immer";
import { type MouseEvent, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { homePath } from "../constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
	clearActiveNote,
	deleteAllSavedNotes,
	deleteSavedNoteById,
	selectActiveNote,
	selectAllSavedNotes,
	setActiveNote,
} from "../notesSlice";
import { getNoteTitle, type Note } from "../utils";
import { Button } from "./Button";
import { NoteListToolbar } from "./NoteListToolbar";
import { NoteStatus } from "./NoteStatus";

export const NoteList = () => {
	const appDispatch = useAppDispatch();
	const activeNote = useAppSelector(selectActiveNote);
	const savedNotes = [...useAppSelector(selectAllSavedNotes)].sort(
		(a, b) => (b.lastUpdated ?? 0) - (a.lastUpdated ?? 0),
	);
	const [{ selected }, dispatch] = useReducer(noteListReducer, initialState);
	const navigate = useNavigate();

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "a") {
				event.preventDefault();
				dispatch({ type: "selectAll", payload: savedNotes });
			}

			if ((event.ctrlKey || event.metaKey) && event.key === "d") {
				if (selected.size > 0 && confirmDelete(selected)) {
					event.preventDefault();
					appDispatch(deleteAllSavedNotes());
					if (activeNote && selected.has(activeNote.id)) {
						appDispatch(clearActiveNote());
					}
					dispatch({ type: "deselectAll" });
				}
			}

			if (event.key === "Escape" || event.key === "Esc") {
				event.preventDefault();
				dispatch({ type: "deselectAll" });
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [savedNotes, selected, appDispatch, activeNote]);

	return savedNotes.length > 0 ? (
		<div className="note-list">
			<h1 className="sr-only">Saved Notes</h1>

			<NoteListToolbar
				someSelected={selected.size > 0}
				allSelected={savedNotes.length === selected.size}
				handleSelectAll={() =>
					dispatch({ type: "selectAll", payload: savedNotes })
				}
				handleDeselectAll={() => dispatch({ type: "deselectAll" })}
				handleDelete={() => {
					if (confirmDelete(selected)) {
						selected.forEach((id) => {
							appDispatch(deleteSavedNoteById(id));
							if (activeNote && id === activeNote.id) {
								appDispatch(clearActiveNote());
							}
						});
						dispatch({ type: "deselectAll" });
					}
				}}
			/>

			<ul>
				{savedNotes.map((note) => {
					const handleClick = (event: MouseEvent) => {
						if (event.ctrlKey || event.metaKey) {
							if (selected.has(note.id)) {
								dispatch({ type: "deselect", payload: note });
							} else {
								dispatch({ type: "select", payload: note });
							}
							return false;
						}
						return true;
					};

					return (
						<NoteListItem
							key={note.id}
							note={note}
							selected={selected.has(note.id)}
							onSelect={() => dispatch({ type: "select", payload: note })}
							onDeselect={() => dispatch({ type: "deselect", payload: note })}
							onClick={handleClick}
						/>
					);
				})}
			</ul>
		</div>
	) : (
		<p className="note-list-no-saved-notes-indicator">
			No saved notes.{" "}
			<Button
				level="in-text"
				onClick={() => {
					navigate(homePath);
				}}
				accessibilityLabel="Create new note"
			>
				Create new
			</Button>
		</p>
	);
};

interface NoteListItemProps {
	note: Note;
	selected: boolean;
	onSelect: () => void;
	onDeselect: () => void;
	onClick: (event: MouseEvent<HTMLButtonElement>) => boolean;
}

const NoteListItem = ({
	note,
	selected,
	onSelect,
	onDeselect,
	onClick,
}: NoteListItemProps) => {
	const dispatch = useAppDispatch();
	const title = getNoteTitle(note.text) ?? "Untitled";
	const navigate = useNavigate();
	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		if (onClick(event)) {
			navigate(homePath);
			dispatch(setActiveNote(note));
		}
	};

	return (
		<li key={note.id}>
			<div
				className={[
					"note-list-item",
					selected ? "note-list-item--selected" : [],
				]
					.flat()
					.join(" ")}
			>
				<div className="note-list-item-checkbox">
					<input
						type="checkbox"
						value={note.id}
						checked={selected}
						onChange={selected ? onDeselect : onSelect}
					/>
				</div>

				<button
					className="note-list-item-content"
					type="button"
					onClick={handleClick}
				>
					<div className="note-list-item-title">{title}</div>
					<NoteStatus note={note} />
				</button>
			</div>
		</li>
	);
};

const confirmDelete = (selected: Set<string>) => {
	return window.confirm(
		selected.size > 1
			? `Delete ${selected.size} notes?`
			: "Delete selected note?",
	);
};

interface NoteListState {
	selected: Set<string>;
}

const initialState: NoteListState = {
	selected: new Set(),
};

type NoteListAction =
	| { type: "select"; payload: Note }
	| { type: "deselect"; payload: Note }
	| { type: "selectAll"; payload: Note[] }
	| { type: "deselectAll" };

const noteListReducer = produce(
	(draft: NoteListState, action: NoteListAction) => {
		switch (action.type) {
			case "select":
				draft.selected.add(action.payload.id);
				break;

			case "deselect":
				draft.selected.delete(action.payload.id);
				break;

			case "selectAll":
				action.payload.forEach((note) => {
					draft.selected.add(note.id);
				});
				break;

			case "deselectAll":
				draft.selected.clear();
				break;

			default:
				throw new Error();
		}
	},
);
