import "./InputArea.css";
import { useAtom, useAtomValue } from "jotai";
import { type ChangeEvent, useId } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { messagesAtom } from "../atoms/messagesAtom";
import { textAtom } from "../atoms/textAtom";

export function InputArea() {
	const messages = useAtomValue(messagesAtom);

	const [text, setText] = useAtom(textAtom);

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setText(event.target.value);
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
				value={text ?? ""}
				onChange={handleChange}
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
						{text}
					</ReactMarkdown>
				</div>
			</div>
		</div>
	);
}
