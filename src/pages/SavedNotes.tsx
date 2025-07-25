import { NoteList } from "../components/NoteList";
import { Tab } from "../components/Tab";

export function SavedNotes() {
	return (
		<div className="saved-notes">
			<Tab />

			<div className="saved-notes-section">
				<NoteList />
			</div>
		</div>
	);
}
