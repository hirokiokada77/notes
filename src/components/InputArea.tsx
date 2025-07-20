import "./InputArea.css";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { MouseEvent } from "react";
import { type ChangeEvent, useEffect, useId, useRef } from "react";
import {
	messagesAtom,
	noteAtom,
	saveNoteAtom,
	statusAtom,
	textSelectionAtom,
	updateNoteTextAtom,
} from "../atoms";
import { formatNoteText } from "../utils";
import { NotePreview } from "./NotePreview";

export function InputArea() {
	const messages = useAtomValue(messagesAtom);

	const note = useAtomValue(noteAtom);
	const updateNoteText = useSetAtom(updateNoteTextAtom);

	const setStatus = useSetAtom(statusAtom);

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const text = event.target.value;
		const textSelectionStart = event.target.selectionStart;
		const textSelectionEnd = event.target.selectionEnd;

		updateNoteText(text);
		setTextSelection({
			start: textSelectionStart,
			end: textSelectionEnd,
		});
	};

	const handleCursorChange = () => {
		if (noteInputRef.current) {
			const textSelectionStart = noteInputRef.current.selectionStart;
			const textSelectionEnd = noteInputRef.current.selectionEnd;

			setTextSelection({
				start: textSelectionStart,
				end: textSelectionEnd,
			});
		}
	};

	const handleFocus = () => {
		setStatus("editing");
	};

	const handleBlur = async () => {
		setStatus("viewing");

		if (note) {
			const formattedText = await formatNoteText(note.text);

			if (note.text !== formattedText) {
				updateNoteText(formattedText);
			}
		}

		setTextSelection(null);
	};

	const noteInputId = useId();

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		const target = event.target as HTMLElement;

		if (target.tagName === "A" && target.hasAttribute("href")) {
			event.preventDefault();

			const href = target.getAttribute("href");

			if (href) {
				if (href.startsWith("#")) {
					// Temporarily disable anchor links until we have a fix
					return;
				}

				window.open(href, "_blank", "noopener,noreferrer");
			}
		}
	};

	const savedNote = useSetAtom(saveNoteAtom);

	useEffect(() => {
		const listener = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "s") {
				event.preventDefault();

				savedNote();

				globalThis.registerToastMessage("save_success");
			}
		};

		document.addEventListener("keydown", listener);

		return () => {
			document.removeEventListener("keydown", listener);
		};
	}, [savedNote]);

	const noteInputRef = useRef<HTMLTextAreaElement | null>(null);

	useEffect(() => {
		if (note === null) {
			noteInputRef.current?.focus();
		}
	}, [note]);

	const [textSelection, setTextSelection] = useAtom(textSelectionAtom);

	// biome-ignore lint/correctness/useExhaustiveDependencies: expected behavior
	useEffect(() => {
		if (noteInputRef.current && textSelection !== null) {
			noteInputRef.current.setSelectionRange(
				textSelection.start,
				textSelection.end,
			);
		}
	}, [textSelection, note]);

	const noteBlank = !(note && note.text.trim().length > 0);

	return (
		<div className="input-area">
			<label htmlFor={noteInputId} className="sr-only">
				{messages.textarea_placeholder}
			</label>

			<div className="note-input">
				<textarea
					id={noteInputId}
					ref={noteInputRef}
					className="note-input-container"
					value={note ? note.text : ""}
					onChange={handleChange}
					onKeyUp={handleCursorChange}
					onMouseUp={handleCursorChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					placeholder={messages.textarea_placeholder}
					aria-label={messages.textarea_placeholder}
				/>
			</div>

			{/** biome-ignore lint/a11y/useKeyWithClickEvents: expected behavior */}
			<main
				className={["note-preview", noteBlank ? "note-preview--blank" : []]
					.flat()
					.join(" ")}
				onClick={handleClick}
				aria-live="polite"
			>
				<div className="note-preview-container">
					<NotePreview />
				</div>
			</main>
		</div>
	);
}
