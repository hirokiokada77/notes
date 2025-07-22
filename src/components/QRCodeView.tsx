import "./QRCodeView.css";
import { useAtom, useAtomValue } from "jotai";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { displayQrCodeAtom, messagesAtom, rerenderAtom } from "../atoms";

export function QRCodeView() {
	const rerender = useAtomValue(rerenderAtom);

	const [qrCode, setQrCode] = useState<string | null>(null);

	const [initialized, setInitialized] = useState(false);

	const [busy, setBusy] = useState(false);

	const detailsRef = useRef<HTMLDetailsElement>(null);

	const [displayQrCode, setDisplayQrCode] = useAtom(displayQrCodeAtom);

	const messages = useAtomValue(messagesAtom);

	const url = useRef<string | null>(null);

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
		setInitialized(true);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: forced re-rendering
	useEffect(() => {
		if (url.current !== window.location.href) {
			setBusy(true);

			const timeoutId = setTimeout(
				async () => {
					try {
						const dataUrl = await QRCode.toDataURL(window.location.href, {
							errorCorrectionLevel: "low",
						});

						setQrCode(dataUrl);
					} catch {
						setQrCode(null); // The URL is too long
					}

					setBusy(false);

					url.current = window.location.href;
				},
				initialized ? 300 : 0,
			);

			return () => {
				clearTimeout(timeoutId);
			};
		}
	}, [rerender]);

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
