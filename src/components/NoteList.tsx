import "./NoteList.css";
import { type MouseEvent, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import { homePath } from "../constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
	clearActiveNote,
	deleteSavedNoteById,
	selectActiveNoteId,
	selectAllSavedNotes,
	setActiveNote,
} from "../notesSlice";
import { selectStringResources } from "../stringResourcesSlice";
import { updateToastText } from "../toastTextSlice";
import { getNoteTitle, type Note } from "../utils";
import { NoteListToolbar } from "./NoteListToolbar";
import { NoteStatus } from "./NoteStatus";

export const NoteList = () => {
	const appDispatch = useAppDispatch();
	const stringResources = useSelector(selectStringResources);
	const activeNoteId = useAppSelector(selectActiveNoteId);
	const savedNotes = useAppSelector(selectAllSavedNotes);
	const [{ selected }, dispatch] = useImmerReducer(
		noteListReducer,
		initialState,
	);
	const navigate = useNavigate();

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "a") {
				event.preventDefault();
				dispatch(selectAll(savedNotes));
			}

			if ((event.ctrlKey || event.metaKey) && event.key === "d") {
				if (selected.size > 0) {
					event.preventDefault();
					if (confirmDelete(selected)) {
						selected.forEach((id) => {
							appDispatch(deleteSavedNoteById(id));
							if (id === activeNoteId) {
								appDispatch(clearActiveNote());
							}
						});
						dispatch(deselectAll());
						appDispatch(updateToastText("toastMessages/deleteSuccess"));
					}
				}
			}

			if (event.key === "Escape" || event.key === "Esc") {
				event.preventDefault();
				if (selected.size > 0) {
					dispatch(deselectAll());
				} else {
					navigate(homePath);
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [savedNotes, selected, appDispatch, activeNoteId, navigate, dispatch]);

	return savedNotes.length > 0 ? (
		<div className="note-list">
			<h1 className="sr-only">{stringResources["pageTitles/savedNotes"]}</h1>

			<NoteListToolbar
				someSelected={selected.size > 0}
				allSelected={savedNotes.length === selected.size}
				handleSelectAll={() => dispatch(selectAll(savedNotes))}
				handleDeselectAll={() => dispatch(deselectAll())}
				handleDelete={() => {
					if (confirmDelete(selected)) {
						selected.forEach((id) => {
							appDispatch(deleteSavedNoteById(id));
							if (id === activeNoteId) {
								appDispatch(clearActiveNote());
							}
						});
						dispatch(deselectAll());
						appDispatch(updateToastText("toastMessages/deleteSuccess"));
					}
				}}
			/>

			<ul>
				{savedNotes.map((note) => {
					const handleClick = (event: MouseEvent) => {
						if (event.ctrlKey || event.metaKey) {
							if (selected.has(note.id)) {
								dispatch(deselect(note));
							} else {
								dispatch(select(note));
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
							onSelect={() => dispatch(select(note))}
							onDeselect={() => dispatch(deselect(note))}
							onClick={handleClick}
						/>
					);
				})}
			</ul>
		</div>
	) : (
		<p className="note-list-no-saved-notes-indicator">
			{stringResources["toastMessages/noSavedNotes"]}
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
	const stringResources = useSelector(selectStringResources);
	const title = getNoteTitle(note.text);
	const navigate = useNavigate();

	const toggleSelection = () => {
		(selected ? onDeselect : onSelect)();
	};

	const handleItemContextMenu = (event: MouseEvent) => {
		event.preventDefault();
		toggleSelection();
	};

	const handleItemCheckboxChange = () => {
		toggleSelection();
	};

	const handleItemContentClick = (event: MouseEvent<HTMLButtonElement>) => {
		if (onClick(event)) {
			navigate(homePath);
			dispatch(setActiveNote(note));
		}
	};

	return (
		<li>
			<div
				className={[
					"note-list-item",
					selected ? "note-list-item--selected" : [],
				]
					.flat()
					.join(" ")}
				onContextMenu={handleItemContextMenu}
			>
				<div className="note-list-item-checkbox">
					<input
						type="checkbox"
						checked={selected}
						onChange={handleItemCheckboxChange}
					/>
				</div>

				<button
					className="note-list-item-content"
					type="button"
					onClick={handleItemContentClick}
				>
					<div className="note-list-item-title">
						{title ? title : stringResources["statusMessages/untitled"]}
					</div>

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

const noteListReducer = (draft: NoteListState, action: NoteListAction) => {
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
};

const select = (note: Note): NoteListAction => ({
	type: "select",
	payload: note,
});

const deselect = (note: Note): NoteListAction => ({
	type: "deselect",
	payload: note,
});

const selectAll = (notes: Note[]): NoteListAction => ({
	type: "selectAll",
	payload: notes,
});

const deselectAll = (): NoteListAction => ({
	type: "deselectAll",
});
