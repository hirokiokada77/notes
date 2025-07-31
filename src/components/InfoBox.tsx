import "./InfoBox.css";
import { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectAllStringResources } from "../localeSlice";
import { selectActiveNoteUrl } from "../notesSlice";
import { updateToastText } from "../toastTextSlice";
import { Button } from "./Button";
import { QRCodeView } from "./QRCodeView";

export const InfoBox = () => {
	const dispatch = useAppDispatch();
	const stringResources = useAppSelector(selectAllStringResources);
	const infoBoxUrlRef = useRef<HTMLInputElement>(null);
	const shareFeatureUnavailable = !navigator.share;
	const activeNoteUrl = useAppSelector(selectActiveNoteUrl);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(activeNoteUrl);
			dispatch(updateToastText("copySuccess"));
		} catch (err) {
			console.error("Error copying to clipboard:", err);
			dispatch(updateToastText("copyFail"));
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

	return (
		<div className="info-box">
			<div className="info-box-main">
				<input
					className="info-box-url"
					value={activeNoteUrl}
					readOnly
					ref={infoBoxUrlRef}
					onFocus={handleFocus}
					aria-label={stringResources.shareInstruction}
				/>

				<div className="info-box-buttons">
					<Button level="secondary" onClick={copy}>
						{stringResources.copyButton}
					</Button>

					<Button
						level="secondary"
						onClick={share}
						hidden={shareFeatureUnavailable}
					>
						{stringResources.shareButton}
					</Button>
				</div>
			</div>

			<QRCodeView />
		</div>
	);
};
