import "./ButtonGroup.css";
import { useAtomValue, useSetAtom } from "jotai";
import {
	forceRerenderAtom,
	messagesAtom,
	noteAtom,
	savedNoteAtom,
	saveFeatureApplicableAtom,
	saveNoteAtom,
} from "../atoms";
import { Button } from "./Button";

export function ButtonGroup() {
	const messages = useAtomValue(messagesAtom);
	const saveFeatureApplicable = useAtomValue(saveFeatureApplicableAtom);
	const note = useAtomValue(noteAtom);
	const savedNote = useAtomValue(savedNoteAtom);

	const saveNote = useSetAtom(saveNoteAtom);
	const forceRerender = useSetAtom(forceRerenderAtom);

	const save = () => {
		if (
			savedNote === null ||
			note?.id === savedNote.id ||
			window.confirm(
				"You are about to overwrite an existing note. " +
					"Do you want to proceed?",
			)
		) {
			forceRerender();

			saveNote();

			globalThis.registerToastMessage("saveSuccess");
		}
	};

	return (
		<div className="button-group">
			<Button level="primary" onClick={save} disabled={!saveFeatureApplicable}>
				{messages.saveButton}
			</Button>
		</div>
	);
}
