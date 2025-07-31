import { NoteList } from "../components/NoteList";
import { Tab } from "../components/Tab";
import { useTitle } from "../hooks";

export const SavedNotes = () => {
	useTitle("Saved Notes");

	return (
		<div className="saved-notes">
			<Tab />

			<div className="saved-notes-section">
				<NoteList />
			</div>
		</div>
	);
};
