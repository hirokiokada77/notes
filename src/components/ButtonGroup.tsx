import "./ButtonGroup.css";
import { useAtomValue, useSetAtom } from "jotai";
import {
	forceRerenderAtom,
	messagesAtom,
	saveFeatureApplicableAtom,
	saveNoteAtom,
} from "../atoms";
import { Button } from "./Button";

export function ButtonGroup() {
	const messages = useAtomValue(messagesAtom);
	const saveFeatureApplicable = useAtomValue(saveFeatureApplicableAtom);

	const saveNote = useSetAtom(saveNoteAtom);
	const forceRerender = useSetAtom(forceRerenderAtom);

	const save = () => {
		forceRerender();

		saveNote();

		globalThis.registerToastMessage("saveSuccess");
	};

	return (
		<div className="button-group">
			<Button level="primary" onClick={save} disabled={!saveFeatureApplicable}>
				{messages.saveButton}
			</Button>
		</div>
	);
}
