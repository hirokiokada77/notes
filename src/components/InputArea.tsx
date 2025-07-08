import "./InputArea.css";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type ChangeEvent, useId } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { messagesAtom } from "../atoms/messagesAtom";
import { noteAtom } from "../atoms/noteAtom";
import { statusAtom } from "../atoms/statusAtom";

const prettier = import("prettier");
const prettierPluginMarkdown = import("prettier/plugins/markdown");

export function InputArea() {
	const messages = useAtomValue(messagesAtom);

	const [note, setNote] = useAtom(noteAtom);

	const setStatus = useSetAtom(statusAtom);

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setNote({
			...note,
			text: event.target.value,
			dateLastModified: Date.now(),
		});
	};

	const handleFocus = () => {
		setStatus("editing");
	};

	const handleBlur = async () => {
		setTimeout(() => {
			setStatus("viewing");
		}, 300);

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
	};

	const noteInputId = useId();

	return (
		<div className="input-area">
			<label htmlFor={noteInputId} className="sr-only">
				{messages.textarea_placeholder}
			</label>

			<textarea
				id={noteInputId}
				className="note-input"
				value={note.text ?? ""}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				placeholder={messages.textarea_placeholder}
				rows={10}
				aria-label={messages.textarea_placeholder}
			/>

			<div className="note-preview" aria-live="polite">
				<div className="note-preview-container">
					<ReactMarkdown
						disallowedElements={["img"]}
						remarkPlugins={[remarkGfm]}
					>
						{note.text}
					</ReactMarkdown>
				</div>
			</div>
		</div>
	);
}
