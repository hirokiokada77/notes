import "./URLBox.css";
import { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectActiveNoteUrl } from "../notesSlice";
import { selectStringResources } from "../stringResourcesSlice";
import { updateToastText } from "../toastTextSlice";
import { Button } from "./Button";

export const URLBox = () => {
	const dispatch = useAppDispatch();
	const stringResources = useAppSelector(selectStringResources);
	const infoBoxUrlRef = useRef<HTMLInputElement>(null);
	const shareFeatureUnavailable = !navigator.share;
	const activeNoteUrl = useAppSelector(selectActiveNoteUrl);

	const handleCopyButtonClick = async () => {
		try {
			await navigator.clipboard.writeText(activeNoteUrl);
			dispatch(updateToastText("toastMessages/copySuccess"));
		} catch (error) {
			console.error(error);
			dispatch(updateToastText("toastMessages/copyFail"));
		}
	};

	const handleShareButtonClick = async () => {
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
		<div className="url-box">
			<div className="url-box-container">
				<input
					className="url-box-content"
					value={activeNoteUrl}
					readOnly
					ref={infoBoxUrlRef}
					onFocus={handleFocus}
				/>

				<div className="url-box-buttons">
					<Button level="secondary" onClick={handleCopyButtonClick}>
						{stringResources["buttonLabels/copy"]}
					</Button>

					<Button
						level="secondary"
						onClick={handleShareButtonClick}
						hidden={shareFeatureUnavailable}
					>
						{stringResources["buttonLabels/share"]}
					</Button>
				</div>
			</div>
		</div>
	);
};
