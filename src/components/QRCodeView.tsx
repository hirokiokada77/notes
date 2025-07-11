import "./QRCodeView.css";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { displayQrCodeAtom, messagesAtom, urlAtom } from "../atoms";

const QRCode = import("qrcode");

export function QRCodeView() {
	const [qrCode, setQrCode] = useState<{
		version: number;
		content: string;
	} | null>(null);

	const detailsRef = useRef<HTMLDetailsElement>(null);

	const [displayQrCode, setDisplayQrCode] = useAtom(displayQrCodeAtom);

	const messages = useAtomValue(messagesAtom);

	const url = useAtomValue(urlAtom);

	const [currentUrl, setCurrentUrl] = useState(url);

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: expected behavior
	useEffect(() => {
		const nextQrCodeVersion = qrCode ? qrCode?.version + 1 : 1;
		const initialLoad = nextQrCodeVersion === 1;

		const timeoutId = setTimeout(
			async () => {
				try {
					const dataUrl = await (await QRCode).toDataURL(url.toString(), {
						errorCorrectionLevel: "low",
					});

					setQrCode({
						version: nextQrCodeVersion,
						content: dataUrl,
					});
					setCurrentUrl(url);
				} catch {
					// The URL is too long to be represented by a single
					// QR code (see
					// https://en.wikipedia.org/wiki/QR_code#Information_capacity).

					setQrCode(null);
				}
			},
			initialLoad ? 0 : 300,
		);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [url]);

	const waitingForUpdate = url !== currentUrl;

	return (
		<div
			className={["qr-code", waitingForUpdate ? "busy" : []].flat().join(" ")}
		>
			<details
				ref={detailsRef}
				open={displayQrCode ? true : undefined}
				hidden={!qrCode}
				aria-hidden={!qrCode}
			>
				<summary>{messages.qr_code_view_summary}</summary>

				<img
					src={qrCode?.content}
					alt={messages.qr_code_img_alt}
					aria-busy={waitingForUpdate}
				/>
			</details>
		</div>
	);
}
