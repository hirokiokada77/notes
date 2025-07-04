import { useAtom, useAtomValue } from "jotai";
import { messagesAtom } from "../atoms/messagesAtom";
import { textAtom } from "../atoms/textAtom";

export function ButtonGroup() {
	const messages = useAtomValue(messagesAtom);

	const [text, setText] = useAtom(textAtom);

	const saveTextToBrowser = () => {
		try {
			localStorage.setItem("notesAppText", text ?? "");

			if (window.registerToastMessage) {
				window.registerToastMessage("save_success");
			}
		} catch (err) {
			console.error("Error saving to local storage:", err);

			if (window.registerToastMessage) {
				window.registerToastMessage("save_fail");
			}
		}
	};

	const clearText = () => {
		if (window.confirm(messages.clear_confirm)) {
			try {
				setText("");
				localStorage.removeItem("notesAppText");

				if (window.registerToastMessage) {
					window.registerToastMessage("clear_success");
				}
			} catch {
				if (window.registerToastMessage) {
					window.registerToastMessage("clear_fail");
				}
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
