import "./QRCodeView.css";
import { useAtom, useAtomValue } from "jotai";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { displayQrCodeAtom, messagesAtom, noteUrlAtom } from "../atoms";

export function QRCodeView() {
	const [qrCode, setQrCode] = useState<string | null>(null);
	const initialized = useRef(false);
	const [busy, setBusy] = useState(false);
	const detailsRef = useRef<HTMLDetailsElement>(null);
	const [displayQrCode, setDisplayQrCode] = useAtom(displayQrCodeAtom);
	const messages = useAtomValue(messagesAtom);
	const url = useRef<string | null>(null);
	const noteUrl = useAtomValue(noteUrlAtom);

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

	useEffect(() => {
		if (url.current !== noteUrl) {
			setBusy(true);

			const timeoutId = setTimeout(
				async () => {
					initialized.current = true;

					try {
						const dataUrl = await QRCode.toDataURL(noteUrl, {
							errorCorrectionLevel: "low",
						});

						setQrCode(dataUrl);
					} catch {
						setQrCode(null); // The URL is too long
					}

					setBusy(false);

					url.current = noteUrl;
				},
				initialized.current ? 300 : 0,
			);

			return () => {
				clearTimeout(timeoutId);
			};
		}
	}, [noteUrl]);

	return (
		<div
			className={["qr-code-view", busy ? "qr-code-view--busy" : []]
				.flat()
				.join(" ")}
		>
			<details
				ref={detailsRef}
				open={displayQrCode ? true : undefined}
				hidden={initialized && !qrCode}
				aria-hidden={initialized && !qrCode}
				aria-busy={busy}
			>
				<summary>{messages.qrCodeViewSummary}</summary>

				{qrCode && <img src={qrCode} alt={messages.qrCodeImgAlt} />}
			</details>
		</div>
	);
}
