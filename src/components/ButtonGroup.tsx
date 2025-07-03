import { useLocale } from "../contexts/LocaleContext";
import { useText } from "../hooks/useText";

export function ButtonGroup() {
	const { messages } = useLocale();

	const { saveTextToBrowser, clearText } = useText();

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
