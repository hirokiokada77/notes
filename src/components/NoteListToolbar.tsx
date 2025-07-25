import "./NoteListToolbar.css";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";

export interface NoteListToolbarProps {
	someSelected: boolean;
	allSelected: boolean;
	handleSelectAll: () => void;
	handleDeselectAll: () => void;
	handleDelete: () => void;
}

export function NoteListToolbar({
	someSelected,
	allSelected,
	handleSelectAll,
	handleDeselectAll,
	handleDelete,
}: NoteListToolbarProps) {
	const checkboxRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (checkboxRef.current) {
			checkboxRef.current.indeterminate = someSelected && !allSelected;
		}
	}, [someSelected, allSelected]);

	return (
		<div className="note-list-toolbar">
			<div className="note-list-toolbar-checkbox">
				<input
					type="checkbox"
					checked={allSelected}
					onChange={allSelected ? handleDeselectAll : handleSelectAll}
					title={allSelected ? "Deselect all" : "Select all"}
					ref={checkboxRef}
				/>
			</div>

			<div
				className={[
					"note-list-toolbar-actions",
					someSelected ? [] : "note-list-toolbar-actions--disabled",
				]
					.flat()
					.join(" ")}
			>
				<button
					className="note-list-toolbar-actions-button"
					type="button"
					onClick={handleDelete}
					title="Delete notes"
					disabled={!someSelected}
				>
					<FontAwesomeIcon icon={faTrash} />
				</button>
			</div>
		</div>
	);
}
