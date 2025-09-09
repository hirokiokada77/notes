import "./NoteEditField.css";
import { NoteInputField } from "./NoteInputField";
import { NotePreviewField } from "./NotePreviewField";

export const NoteEditField = () => {
	return (
		<div className="note-edit-field">
			<div className="note-edit-field-start">
				<NoteInputField />
			</div>

			<main className="note-edit-field-end">
				<NotePreviewField />
			</main>
		</div>
	);
};
