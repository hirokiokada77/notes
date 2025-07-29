import { useEffect } from "react";
import { NoteList } from "../components/NoteList";
import { Tab } from "../components/Tab";

export function SavedNotes() {
	useEffect(() => {
		document.title = "Saved Notes";
	}, []);

	return (
		<div className="saved-notes">
			<Tab />

			<div className="saved-notes-section">
				<NoteList />
			</div>
		</div>
	);
}
