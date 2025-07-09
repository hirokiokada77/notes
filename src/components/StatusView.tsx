import "./StatusView.css";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { noteAtom, savedNoteAtom, statusAtom } from "../atoms";
import { formatTimeAgo } from "../utils";

export function StatusView() {
	const note = useAtomValue(noteAtom);

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

	return (
		shouldDisplayStatus && (
			<div className="status">
				<ul className="status-list">
					<li>{formatTimeAgo(note.dateLastModified)}</li>

					{savedNote && note.id === savedNote.id && (
						<>
							{note.text !== savedNote.text && (
								<li>You have unsaved changes</li>
							)}

							{note.text === savedNote.text && <li>Saved to browser</li>}
						</>
					)}
				</ul>
			</div>
		)
	);
}
