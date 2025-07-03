import { useId } from "react";
import { useLocale } from "../contexts/LocaleContext";
import { useUrl } from "../hooks/useUrl";

export function InfoBox() {
	const { messages } = useLocale();

	const { url, copyUrlToClipboard } = useUrl();

	const infoBoxLabelId = useId();

	return (
		<div className="main-section">
			<div className="info-box">
				<p id={infoBoxLabelId} className="info-box-label">
					{messages.current_url_label}
				</p>

				<div className="info-box-main">
					<input
						className="info-box-url"
						aria-labelledby={infoBoxLabelId}
						value={url}
						readOnly
					/>

					<button
						type="button"
						onClick={copyUrlToClipboard}
						className="copy-button"
						aria-label={messages.copy_button}
					>
						{messages.copy_button}
					</button>
				</div>

				<p className="share-instruction">{messages.share_instruction}</p>
			</div>
		</div>
	);
}
