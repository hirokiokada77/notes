import "./InputArea.css";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { MouseEvent } from "react";
import { type ChangeEvent, useId } from "react";
import { messagesAtom, noteAtom, statusAtom } from "../atoms";
import { createNewNote } from "../utils";
import { NotePreview } from "./NotePreview";

const prettier = import("prettier");
const prettierPluginMarkdown = import("prettier/plugins/markdown");

export function InputArea() {
	const messages = useAtomValue(messagesAtom);

	const [note, setNote] = useAtom(noteAtom);

	const setStatus = useSetAtom(statusAtom);

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const text = event.target.value;

		if (note) {
			setNote({
				...note,
				text,
				dateLastModified: Date.now(),
			});
		} else {
			setNote({
				...createNewNote(),
				text,
			});
		}
	};

	const handleFocus = () => {
		setStatus("editing");
	};

	const handleBlur = async () => {
		setTimeout(() => {
			setStatus("viewing");
		}, 300);

		if (note) {
			const formattedText = await (await prettier).format(note.text, {
				parser: "markdown",
				plugins: [(await prettierPluginMarkdown).default],
			});

			if (note.text !== formattedText) {
				setNote({
					...note,
					text: formattedText,
					dateLastModified: Date.now(),
				});
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

			<textarea
				id={noteInputId}
				className="note-input"
				value={note ? note.text : ""}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				placeholder={messages.textarea_placeholder}
				rows={10}
				aria-label={messages.textarea_placeholder}
			/>

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
