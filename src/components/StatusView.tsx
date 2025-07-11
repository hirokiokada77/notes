import "./StatusView.css";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { noteAtom, savedNoteAtom, statusAtom } from "../atoms";
import { formatTimeAgo } from "../utils";

export function StatusView() {
	const [note, setNote] = useAtom(noteAtom);

	const savedNote = useAtomValue(savedNoteAtom);

	const [_, setLastRenderTime] = useState(Date.now());

	const status = useAtomValue(statusAtom);

	const shouldDisplayStatus = status !== "editing" && note.text.length > 0;

	useEffect(() => {
		const intervalId = setInterval(() => {
			setLastRenderTime(Date.now()); // Force rerender
		}, 60000);

		return () => clearInterval(intervalId);
	}, []);

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
				<li>{formatTimeAgo(note.dateLastModified)}</li>

				{savedNote && note.id === savedNote.id && (
					<>
						{note.text === savedNote.text && <li>Saved to browser</li>}

						{note.text !== savedNote.text && (
							<>
								{note.dateLastModified >= savedNote.dateLastModified && (
									<li>You have unsaved changes</li>
								)}

								{note.dateLastModified < savedNote.dateLastModified && (
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
			</ul>
		</div>
	);
}
