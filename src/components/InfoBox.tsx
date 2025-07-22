import "./InfoBox.css";
import { useAtomValue } from "jotai";
import { useRef } from "react";
import { messagesAtom } from "../atoms";
import { Button } from "./Button";
import { QRCodeView } from "./QRCodeView";

export function InfoBox() {
	const messages = useAtomValue(messagesAtom);

	const infoBoxUrlRef = useRef<HTMLInputElement>(null);

	const copyUrlToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);

			globalThis.registerToastMessage("copySuccess");
		} catch (err) {
			console.error("Error copying to clipboard:", err);

			globalThis.registerToastMessage("copyFail");
		}
	};

	const share = async () => {
		await navigator.share({
			title: document.title,
			url: window.location.href,
		});
	};

	const handleFocus = () => {
		if (infoBoxUrlRef.current) {
			infoBoxUrlRef.current.select();
		}
	};

	const shareFeatureUnavailable = !navigator.share;

	return (
		<div className="main-section">
			<div className="info-box">
				<div className="info-box-main">
					<input
						className="info-box-url"
						value={window.location.href}
						readOnly
						ref={infoBoxUrlRef}
						onFocus={handleFocus}
					/>

					<div className="info-box-buttons">
						<Button level="secondary" onClick={copyUrlToClipboard}>
							{messages.copyButton}
						</Button>

						<Button
							level="secondary"
							onClick={share}
							hidden={shareFeatureUnavailable}
						>
							{messages.shareButton}
						</Button>
					</div>
				</div>

				<QRCodeView />
			</div>
		</div>
	);
}
