import { useSelector } from "react-redux";
import { NoteList } from "../components/NoteList";
import { Tab } from "../components/Tab";
import { useTitle } from "../hooks";
import { selectStringResources } from "../stringResourcesSlice";

export const SavedNotes = () => {
	const stringResources = useSelector(selectStringResources);

	useTitle(stringResources["pageTitles/savedNotes"]);

	return (
		<div className="saved-notes">
			<Tab />

			<div className="saved-notes-section">
				<NoteList />
			</div>
		</div>
	);
};
