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

			globalThis.registerToastMessage("copy_success");
		} catch (err) {
			console.error("Error copying to clipboard:", err);

			globalThis.registerToastMessage("copy_fail");
		}
	};

	const share = async () => {
		if (navigator.share) {
			await navigator.share({
				title: document.title,
				url: window.location.href,
			});
		}
	};

	const handleFocus = () => {
		if (infoBoxUrlRef.current) {
			infoBoxUrlRef.current.select();
		}
	};

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

					<Button level="secondary" onClick={copyUrlToClipboard}>
						{messages.copy_button}
					</Button>

					<Button level="secondary" onClick={share}>
						{messages.share_button}
					</Button>
				</div>

				<QRCodeView />
			</div>
		</div>
	);
}
