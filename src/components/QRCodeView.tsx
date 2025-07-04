import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import "./QRCodeView.css";
import { useAtom } from "jotai";
import { displayQrCodeAtom } from "../atoms";

export function QRCodeView() {
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>("");

	const detailsRef = useRef<HTMLDetailsElement>(null);

	const [displayQrCode, setDisplayQrCode] = useAtom(displayQrCodeAtom);

	const generateQrCode = async (url: string) => {
		try {
			const dataUrl = await QRCode.toDataURL(url, {
				errorCorrectionLevel: "low",
			});

			setQrCodeUrl(dataUrl);
		} catch {
			// The URL is too long to be represented by a single QR code
			// (see
			// https://en.wikipedia.org/wiki/QR_code#Information_capacity).

			setQrCodeUrl(null);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: false positive
	useEffect(() => {
		generateQrCode(window.location.href);

		const handleHashChange = () => {
			const newUrl = window.location.href;

			generateQrCode(newUrl);
		};

		window.addEventListener("hashchange", handleHashChange);

		return () => {
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: false positive
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
	}, []);

	return (
		<div className="qr-code">
			<details ref={detailsRef} open={displayQrCode ? true : undefined}>
				{qrCodeUrl && (
					<>
						<summary>See QR code for this URL</summary> {/* TODO: i18n */}
						<img src={qrCodeUrl} alt="QR code" />
					</>
				)}
			</details>
		</div>
	);
}
