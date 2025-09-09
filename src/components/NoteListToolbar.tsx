import "./NoteListToolbar.css";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectStringResources } from "../stringResourcesSlice";

export interface NoteListToolbarProps {
	someSelected: boolean;
	allSelected: boolean;
	handleSelectAll: () => void;
	handleDeselectAll: () => void;
	handleDelete: () => void;
}

export const NoteListToolbar = ({
	someSelected,
	allSelected,
	handleSelectAll,
	handleDeselectAll,
	handleDelete,
}: NoteListToolbarProps) => {
	const stringResources = useSelector(selectStringResources);
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
					title={
						allSelected
							? stringResources["buttonLabels/deselectAll"]
							: stringResources["buttonLabels/selectAll"]
					}
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
					title={stringResources["buttonLabels/delete"]}
					disabled={!someSelected}
				>
					<FontAwesomeIcon icon={faTrash} />
				</button>
			</div>
		</div>
	);
};
