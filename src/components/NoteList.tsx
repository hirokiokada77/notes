import "./NoteList.css";
import { useAtomValue, useSetAtom } from "jotai";
import { type MouseEvent, useEffect, useState } from "react";
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
	const [selected, setSelected] = useState<string[]>([]);
	const deleteSavedNoteById = useSetAtom(deleteSavedNoteByIdAtom);
	const navigate = useNavigate();
	const someSelected = selected.length > 0;
	const allSelected = notes.length === selected.length;
	const handleSelectAll = () => {
		setSelected(notes.map((note) => note.id));
	};
	const handleDeselectAll = () => {
		setSelected([]);
	};
	const handleDelete = () => {
		if (
			window.confirm(
				selected.length > 1
					? `Delete selected ${selected.length} notes?`
					: "Delete selected note?",
			)
		) {
			selected.forEach((id) => {
				deleteSavedNoteById(id);
			});

			handleDeselectAll();
		}
	};
	const HandleCreateNote = () => {
		navigate(homePath);
	};

	useEffect(() => {
		const listener = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "a") {
				event.preventDefault();
				setSelected(notes.map((n) => n.id));
			}

			if (event.key === "Escape" || event.key === "Esc") {
				event.preventDefault();
				setSelected([]);
			}
		};

		document.addEventListener("keydown", listener);

		return () => {
			document.removeEventListener("keydown", listener);
		};
	}, [notes]);

	return notes.length > 0 ? (
		<div className="note-list">
			<h1 className="sr-only">Saved Notes</h1>

			<NoteListToolbar
				someSelected={someSelected}
				allSelected={allSelected}
				handleSelectAll={handleSelectAll}
				handleDeselectAll={handleDeselectAll}
				handleDelete={handleDelete}
			/>

			<ul>
				{notes.map((note) => {
					const noteSelected =
						selected.filter((id) => id === note.id).length > 0;
					const handleSelect = () => {
						setSelected([...selected, note.id]);
					};
					const handleDeselect = () => {
						setSelected(selected.filter((id) => id !== note.id));
					};
					const handleClick = (event: MouseEvent) => {
						if (event.ctrlKey || event.metaKey) {
							if (noteSelected) {
								handleDeselect();
							} else {
								handleSelect();
							}

							return false;
						}

						return true;
					};

					return (
						<NoteListItem
							key={note.id}
							note={note}
							selected={noteSelected}
							onSelect={handleSelect}
							onDeselect={handleDeselect}
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
