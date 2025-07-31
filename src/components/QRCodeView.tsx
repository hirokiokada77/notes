import "./QRCodeView.css";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../hooks";
import { selectAllStringResources } from "../localeSlice";
import { selectActiveNoteUrl } from "../notesSlice";

export const QRCodeView = () => {
	const [qrCode, setQrCode] = useState<string | null>(null);
	const initialized = useRef(false);
	const [busy, setBusy] = useState(false);
	const detailsRef = useRef<HTMLDetailsElement>(null);
	const [qrCodeViewExpanded, setQrCodeViewExpanded] = useState(false);
	const url = useRef<string | null>(null);
	const activeNoteUrl = useAppSelector(selectActiveNoteUrl);
	const stringResources = useAppSelector(selectAllStringResources);

	useEffect(() => {
		const detailsElement = detailsRef.current;
		const handleToggle = (event: Event) => {
			if (event.target instanceof HTMLDetailsElement) {
				setQrCodeViewExpanded(event.target.open);
			}
		};

		detailsElement?.addEventListener("toggle", handleToggle);
		return () => {
			detailsElement?.removeEventListener("toggle", handleToggle);
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: expected behavior
	useEffect(() => {
		if (url.current !== activeNoteUrl) {
			setBusy(true);

			const debounceDuration = initialized.current
				? qrCodeViewExpanded
					? 300
					: 1000
				: 0;

			const timeoutId = setTimeout(async () => {
				initialized.current = true;
				try {
					const dataUrl = await QRCode.toDataURL(activeNoteUrl, {
						errorCorrectionLevel: "low",
					});
					setQrCode(dataUrl);
				} catch {
					setQrCode(null); // The URL is too long
				}
				setBusy(false);
				url.current = activeNoteUrl;
			}, debounceDuration);

			return () => {
				clearTimeout(timeoutId);
			};
		}
	}, [activeNoteUrl]);

	return (
		<div
			className={["qr-code-view", busy ? "qr-code-view--busy" : []]
				.flat()
				.join(" ")}
		>
			<details
				ref={detailsRef}
				open={qrCodeViewExpanded ? true : undefined}
				hidden={initialized && !qrCode}
				aria-hidden={initialized && !qrCode}
				aria-busy={busy}
			>
				<summary>{stringResources.qrCodeViewSummary}</summary>

				{qrCode && <img src={qrCode} alt={stringResources.qrCodeImgAlt} />}
			</details>
		</div>
	);
};
