import "./QRCodeView.css";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef, useState, useTransition } from "react";
import { displayQrCodeAtom, messagesAtom, rerenderAtom } from "../atoms";

const QRCode = import("qrcode");

export function QRCodeView() {
	const rerender = useAtomValue(rerenderAtom);

	const [qrCode, setQrCode] = useState<string | null>(null);

	const [initialized, setInitialized] = useState(false);

	const [isPending, startTransition] = useTransition();

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: required for forced re-rendering
	useEffect(() => {
		startTransition(async () => {
			setInitialized(true);

			try {
				const dataUrl = await (await QRCode).toDataURL(window.location.href, {
					errorCorrectionLevel: "low",
				});

				setQrCode(dataUrl);
			} catch {
				setQrCode(null); // The URL is too long
			}
		});
	}, [rerender]);

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
