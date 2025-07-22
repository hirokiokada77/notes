import "./ButtonGroup.css";
import { useAtomValue, useSetAtom } from "jotai";
import {
	clearFeatureApplicableAtom,
	clearNoteAtom,
	clearSavedNoteAtom,
	forceRerenderAtom,
	initializeEditHistoryAtom,
	messagesAtom,
	saveFeatureApplicableAtom,
	saveNoteAtom,
} from "../atoms";
import { Button } from "./Button";

export function ButtonGroup() {
	const messages = useAtomValue(messagesAtom);
	const saveFeatureApplicable = useAtomValue(saveFeatureApplicableAtom);
	const clearFeatureApplicable = useAtomValue(clearFeatureApplicableAtom);

	const clearNote = useSetAtom(clearNoteAtom);
	const clearSavedNote = useSetAtom(clearSavedNoteAtom);
	const saveNote = useSetAtom(saveNoteAtom);
	const forceRerender = useSetAtom(forceRerenderAtom);
	const initializeEditHistory = useSetAtom(initializeEditHistoryAtom);

	const save = () => {
		forceRerender();

		saveNote();

		globalThis.registerToastMessage("saveSuccess");
	};

	const clear = () => {
		if (window.confirm(messages.clearConfirm)) {
			forceRerender();

			clearNote();
			clearSavedNote();
			initializeEditHistory("", null);

			globalThis.registerToastMessage("clearSuccess");
		}
	};

	return (
		<div className="main-section">
			<div className="button-group">
				<Button
					level="primary"
					onClick={save}
					disabled={!saveFeatureApplicable}
				>
					{messages.saveButton}
				</Button>

				<Button
					level="secondary"
					onClick={clear}
					disabled={!clearFeatureApplicable}
				>
					{messages.clearButton}
				</Button>
			</div>
		</div>
	);
}
