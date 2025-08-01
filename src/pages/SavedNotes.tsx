import { useSelector } from "react-redux";
import { NoteList } from "../components/NoteList";
import { Tab } from "../components/Tab";
import { useTitle } from "../hooks";
import { selectAllStringResources } from "../localeSlice";

export const SavedNotes = () => {
	const stringResources = useSelector(selectAllStringResources);

	useTitle(stringResources.savedNotes);

	return (
		<div className="saved-notes">
			<Tab />

			<div className="saved-notes-section">
				<NoteList />
			</div>
		</div>
	);
};
