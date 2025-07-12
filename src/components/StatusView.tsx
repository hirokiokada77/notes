import "./StatusView.css";
import { useAtom, useAtomValue } from "jotai";
import { noteAtom, rerenderAtom, savedNoteAtom, statusAtom } from "../atoms";
import { formatTimeAgo } from "../utils";

export function StatusView() {
	const [note, setNote] = useAtom(noteAtom);

	const savedNote = useAtomValue(savedNoteAtom);

	const status = useAtomValue(statusAtom);

	const shouldDisplayStatus =
		status !== "editing" && note && note.text.length > 0;

	useAtomValue(rerenderAtom);

	const restoreNoteFromBrowser = () => {
		if (savedNote) {
			setNote(savedNote);

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
						<li>{formatTimeAgo(note.lastUpdated)}</li>

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
