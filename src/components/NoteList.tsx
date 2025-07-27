import "./NoteList.css";
import { produce } from "immer";
import { useAtomValue, useSetAtom } from "jotai";
import { type MouseEvent, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import {
	deleteSavedNoteByIdAtom,
	restoreSavedNoteAtom,
	savedNotesAtom,
} from "../atoms";
import { homePath } from "../constants";
import { getFirstHeadingOrParagraphText, type Note } from "../utils";
import { Button } from "./Button";
import { NoteListToolbar } from "./NoteListToolbar";
import { NoteStatus } from "./NoteStatus";

export function NoteList() {
	const notes = useAtomValue(savedNotesAtom);
	const [{ selected }, dispatch] = useReducer(noteListReducer, initialState);
	const deleteSavedNoteById = useSetAtom(deleteSavedNoteByIdAtom);
	const navigate = useNavigate();
	const someSelected = selected.size > 0;
	const allSelected = notes.length === selected.size;
	const handleDelete = () => {
		if (confirmDelete(selected)) {
			selected.forEach((id) => {
				deleteSavedNoteById(id);
			});
			dispatch({ type: "DESELECT_ALL" });
		}
	};
	const HandleCreateNote = () => {
		navigate(homePath);
	};

	useEffect(() => {
		const listener = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "a") {
				event.preventDefault();
				dispatch({ type: "SELECT_ALL", payload: notes });
			}

			if ((event.ctrlKey || event.metaKey) && event.key === "d") {
				if (selected.size > 0 && confirmDelete(selected)) {
					event.preventDefault();
					selected.forEach((id) => {
						deleteSavedNoteById(id);
					});
					dispatch({ type: "DESELECT_ALL" });
				}
			}

			if (event.key === "Escape" || event.key === "Esc") {
				event.preventDefault();
				dispatch({ type: "DESELECT_ALL" });
			}
		};

		document.addEventListener("keydown", listener);

		return () => {
			document.removeEventListener("keydown", listener);
		};
	}, [notes, selected, deleteSavedNoteById]);

	return notes.length > 0 ? (
		<div className="note-list">
			<h1 className="sr-only">Saved Notes</h1>

			<NoteListToolbar
				someSelected={someSelected}
				allSelected={allSelected}
				handleSelectAll={() => dispatch({ type: "SELECT_ALL", payload: notes })}
				handleDeselectAll={() => dispatch({ type: "DESELECT_ALL" })}
				handleDelete={handleDelete}
			/>

			<ul>
				{notes.map((note) => {
					const handleClick = (event: MouseEvent) => {
						if (event.ctrlKey || event.metaKey) {
							if (selected.has(note.id)) {
								dispatch({ type: "DESELECT", payload: note });
							} else {
								dispatch({ type: "SELECT", payload: note });
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
							onSelect={() => dispatch({ type: "SELECT", payload: note })}
							onDeselect={() => dispatch({ type: "DESELECT", payload: note })}
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
				onClick={HandleCreateNote}
				accessibilityLabel="Create new note"
			>
				Create new
			</Button>
		</p>
	);
}

interface NoteListItemProps {
	note: Note;
	selected: boolean;
	onSelect: () => void;
	onDeselect: () => void;
	onClick: (event: MouseEvent<HTMLButtonElement>) => boolean;
}

export function NoteListItem({
	note,
	selected,
	onSelect,
	onDeselect,
	onClick,
}: NoteListItemProps) {
	const title = getFirstHeadingOrParagraphText(note.text) ?? "Untitled";
	const restoreSavedNote = useSetAtom(restoreSavedNoteAtom);
	const navigate = useNavigate();
	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		if (onClick(event)) {
			navigate(homePath);
			restoreSavedNote(note.id);
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
}

function confirmDelete(selected: Set<string>) {
	return window.confirm(
		selected.size > 1
			? `Delete ${selected.size} notes?`
			: "Delete selected note?",
	);
}

interface NoteListState {
	selected: Set<string>;
}

const initialState: NoteListState = {
	selected: new Set(),
};

type NoteListAction =
	| { type: "SELECT"; payload: Note }
	| { type: "DESELECT"; payload: Note }
	| { type: "SELECT_ALL"; payload: Note[] }
	| { type: "DESELECT_ALL" };

const noteListReducer = produce(
	(draft: NoteListState, action: NoteListAction) => {
		switch (action.type) {
			case "SELECT":
				draft.selected.add(action.payload.id);
				break;

			case "DESELECT":
				draft.selected.delete(action.payload.id);
				break;

			case "SELECT_ALL":
				action.payload.forEach((note) => {
					draft.selected.add(note.id);
				});
				break;

			case "DESELECT_ALL":
				draft.selected.clear();
				break;

			default:
				throw new Error();
		}
	},
);
