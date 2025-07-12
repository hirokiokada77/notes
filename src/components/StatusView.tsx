import "./StatusView.css";
import { useAtomValue, useSetAtom } from "jotai";
import {
	noteAtom,
	noteFormattedLastUpdatedAtom,
	rerenderAtom,
	restoreSavedNoteAtom,
	savedNoteAtom,
	statusAtom,
} from "../atoms";

export function StatusView() {
	const note = useAtomValue(noteAtom);
	const noteFormattedLastUpdated = useAtomValue(noteFormattedLastUpdatedAtom);
	const restoreSavedNote = useSetAtom(restoreSavedNoteAtom);

	const savedNote = useAtomValue(savedNoteAtom);

	const status = useAtomValue(statusAtom);

	const shouldDisplayStatus =
		status !== "editing" && note && note.text.length > 0;

	useAtomValue(rerenderAtom);

	const restoreNoteFromBrowser = () => {
		if (savedNote) {
			restoreSavedNote();

			globalThis.registerToastMessage("note_loaded_from_browser");
		}
	};

	return (
		<div
			className={["status", shouldDisplayStatus ? [] : "hide"].flat().join(" ")}
		>
			<ul className="status-list">
				{note && (
					<>
						<li>{noteFormattedLastUpdated}</li>

						{savedNote && note.id === savedNote.id && (
							<>
								{note.text === savedNote.text && <li>Saved to browser</li>}

								{note.text !== savedNote.text && (
									<>
										{note.lastUpdated >= savedNote.lastUpdated && (
											<li>You have unsaved changes</li>
										)}

										{note.lastUpdated < savedNote.lastUpdated && (
											<>
												<li>A newer version of your note is in your browser</li>

												<li>
													<button
														type="button"
														className="text-button"
														onClick={restoreNoteFromBrowser}
													>
														Restore
													</button>
												</li>
											</>
										)}
									</>
								)}
							</>
						)}
					</>
				)}
			</ul>
		</div>
	);
}
