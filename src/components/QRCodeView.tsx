import "./QRCodeView.css";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef, useState, useTransition } from "react";
import { displayQrCodeAtom, messagesAtom, urlAtom } from "../atoms";

const QRCode = import("qrcode");

export function QRCodeView() {
	const [qrCode, setQrCode] = useState<string | null>(null);

	const [initialized, setInitialized] = useState(false);

	const [isPending, startTransition] = useTransition();

	const detailsRef = useRef<HTMLDetailsElement>(null);

	const [displayQrCode, setDisplayQrCode] = useAtom(displayQrCodeAtom);

	const messages = useAtomValue(messagesAtom);

	const url = useAtomValue(urlAtom);

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
		startTransition(async () => {
			setInitialized(true);

			try {
				const dataUrl = await (await QRCode).toDataURL(url.toString(), {
					errorCorrectionLevel: "low",
				});

				setQrCode(dataUrl);
			} catch {
				setQrCode(null); // The URL is too long
			}
		});
	}, [url]);

	return (
		<div className={["qr-code", isPending ? "busy" : []].flat().join(" ")}>
			<details
				ref={detailsRef}
				open={displayQrCode ? true : undefined}
				hidden={initialized && !qrCode}
				aria-hidden={initialized && !qrCode}
				aria-busy={isPending}
			>
				<summary>{messages.qr_code_view_summary}</summary>

				{qrCode && <img src={qrCode} alt={messages.qr_code_img_alt} />}
			</details>
		</div>
	);
}
