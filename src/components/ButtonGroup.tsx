import { useAtomValue, useSetAtom } from "jotai";
import {
	clearNoteAtom,
	clearSavedNoteAtom,
	forceRerenderAtom,
	messagesAtom,
	noteAtom,
	savedNoteAtom,
	syncSavedNoteAtom,
} from "../atoms";
import { Button } from "./Button";

export function ButtonGroup() {
	const note = useAtomValue(noteAtom);
	const savedNote = useAtomValue(savedNoteAtom);
	const messages = useAtomValue(messagesAtom);

	const clearNote = useSetAtom(clearNoteAtom);
	const clearSavedNote = useSetAtom(clearSavedNoteAtom);
	const syncSavedNote = useSetAtom(syncSavedNoteAtom);
	const forceRerender = useSetAtom(forceRerenderAtom);

	const saveTextToBrowser = () => {
		forceRerender();

		syncSavedNote();

		globalThis.registerToastMessage("save_success");
	};

	const clearText = () => {
		if (window.confirm(messages.clear_confirm)) {
			forceRerender();

			clearNote();
			clearSavedNote();

			globalThis.registerToastMessage("clear_success");
		}
	};

	return (
		<div className="main-section">
			<div className="button-group">
				<Button
					level="primary"
					onClick={saveTextToBrowser}
					disabled={note && savedNote && note.text === savedNote.text}
				>
					{messages.save_button}
				</Button>

				<Button
					level="secondary"
					onClick={clearText}
					disabled={!note || (!savedNote && note.text.length === 0)}
				>
					{messages.clear_button}
				</Button>
			</div>
		</div>
	);
}
