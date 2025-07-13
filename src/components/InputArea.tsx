import "./InputArea.css";
import { useAtomValue, useSetAtom } from "jotai";
import type { MouseEvent } from "react";
import { type ChangeEvent, useId } from "react";
import {
	messagesAtom,
	noteAtom,
	statusAtom,
	updateNoteTextAtom,
} from "../atoms";
import { NotePreview } from "./NotePreview";

const prettier = import("prettier");
const prettierPluginMarkdown = import("prettier/plugins/markdown");

export function InputArea() {
	const messages = useAtomValue(messagesAtom);

	const note = useAtomValue(noteAtom);
	const updateNoteText = useSetAtom(updateNoteTextAtom);

	const setStatus = useSetAtom(statusAtom);

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const newText = event.target.value;

		updateNoteText(newText);
	};

	const handleFocus = () => {
		setStatus("editing");
	};

	const handleBlur = async () => {
		setStatus("viewing");

		if (note) {
			const formattedText = await (await prettier).format(note.text, {
				parser: "markdown",
				plugins: [(await prettierPluginMarkdown).default],
			});

			if (note.text !== formattedText) {
				updateNoteText(formattedText);
			}
		}
	};

	const noteInputId = useId();

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		const target = event.target as HTMLElement;

		if (target.tagName === "A" && target.hasAttribute("href")) {
			event.preventDefault();

			const href = target.getAttribute("href");

			if (href) {
				window.open(href, "_blank", "noopener,noreferrer");
			}
		}
	};

	return (
		<div className="input-area">
			<label htmlFor={noteInputId} className="sr-only">
				{messages.textarea_placeholder}
			</label>

			<div className="note-input">
				<textarea
					id={noteInputId}
					className="note-input-container"
					value={note ? note.text : ""}
					onChange={handleChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					placeholder={messages.textarea_placeholder}
					aria-label={messages.textarea_placeholder}
				/>
			</div>

			{/** biome-ignore lint/a11y/noStaticElementInteractions: expected behavior */}
			{/** biome-ignore lint/a11y/useKeyWithClickEvents: expected behavior */}
			<div className="note-preview" onClick={handleClick} aria-live="polite">
				<div className="note-preview-container">
					<NotePreview />
				</div>
			</div>
		</div>
	);
}
