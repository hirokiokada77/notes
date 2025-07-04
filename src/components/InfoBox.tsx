import { useAtomValue } from "jotai";
import { useId, useRef } from "react";
import { messagesAtom } from "../atoms/messagesAtom";
import { urlAtom } from "../atoms/urlAtom";
import { QRCodeView } from "./QRCodeView";

export function InfoBox() {
	const messages = useAtomValue(messagesAtom);

	const url = useAtomValue(urlAtom);

	const infoBoxUrlRef = useRef<HTMLInputElement>(null);

	const copyUrlToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(url.toString());

			if (window.registerToastMessage) {
				window.registerToastMessage("copy_success");
			}
		} catch (err) {
			console.error("Error copying to clipboard:", err);

			if (window.registerToastMessage) {
				window.registerToastMessage("copy_fail");
			}
		}
	};

	const handleFocus = () => {
		if (infoBoxUrlRef.current) {
			infoBoxUrlRef.current.select();
		}
	};

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
						value={url.toString()}
						readOnly
						ref={infoBoxUrlRef}
						onFocus={handleFocus}
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

				<QRCodeView />

				<p className="share-instruction">{messages.share_instruction}</p>
			</div>
		</div>
	);
}
