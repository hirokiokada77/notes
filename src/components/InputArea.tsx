import "./InputArea.css";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { format } from "prettier";
import * as prettierPluginMarkdown from "prettier/plugins/markdown";
import { type ChangeEvent, useId } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { messagesAtom } from "../atoms/messagesAtom";
import { noteAtom } from "../atoms/noteAtom";
import { statusAtom } from "../atoms/statusAtom";

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
		setNote({
			...note,
			text: await format(note.text, {
				parser: "markdown",
				plugins: [prettierPluginMarkdown],
			}),
		});

		setTimeout(() => {
			setStatus("viewing");
		}, 300);
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
