import "./QRCodeView.css";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { displayQrCodeAtom } from "../atoms/displayQrCodeAtom";
import { messagesAtom } from "../atoms/messagesAtom";
import { qrCodeAtom } from "../atoms/qrCodeAtom";

export function QRCodeView() {
	const qrCode = useAtomValue(qrCodeAtom);

	const detailsRef = useRef<HTMLDetailsElement>(null);

	const [displayQrCode, setDisplayQrCode] = useAtom(displayQrCodeAtom);

	const messages = useAtomValue(messagesAtom);

	useEffect(() => {
		const detailsElement = detailsRef.current;

		const handleToggle = (event: Event) => {
			if (event.target instanceof HTMLDetailsElement) {
				setDisplayQrCode(event.target.open);
			}
		};

		detailsElement?.addEventListener("toggle", handleToggle);

		return () => {
			detailsElement?.removeEventListener("toggle", handleToggle);
		};
	}, [setDisplayQrCode]);

	return (
		<div className="qr-code">
			{qrCode && (
				<details ref={detailsRef} open={displayQrCode ? true : undefined}>
					<summary>{messages.qr_code_view_summary}</summary>
					<img src={qrCode} alt={messages.qr_code_img_alt} />
				</details>
			)}
		</div>
	);
}
