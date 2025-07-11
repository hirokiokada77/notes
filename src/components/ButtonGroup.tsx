import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { messagesAtom, noteAtom, savedNoteAtom } from "../atoms";

export function ButtonGroup() {
	const messages = useAtomValue(messagesAtom);

	const [note, setNote] = useAtom(noteAtom);

	const setSavedNote = useSetAtom(savedNoteAtom);

	const saveTextToBrowser = () => {
		try {
			setSavedNote(note);

			globalThis.registerToastMessage("save_success");
		} catch (err) {
			console.error("Error saving to local storage:", err);

			globalThis.registerToastMessage("save_fail");
		}
	};

	const clearText = () => {
		if (window.confirm(messages.clear_confirm)) {
			try {
				setNote(null);
				setSavedNote(null);

				globalThis.registerToastMessage("clear_success");
			} catch {
				globalThis.registerToastMessage("clear_fail");
			}
		}
	};

	return (
		<div className="main-section">
			<div className="button-group">
				<button
					type="button"
					onClick={saveTextToBrowser}
					className="save-button"
					aria-label={messages.save_button}
				>
					{messages.save_button}
				</button>

				<button
					type="button"
					onClick={clearText}
					className="clear-button"
					aria-label={messages.clear_button}
				>
					{messages.clear_button}
				</button>
			</div>
		</div>
	);
}
