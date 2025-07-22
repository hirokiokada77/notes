import "./InputArea.css";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import type { ClipboardEvent, MouseEvent } from "react";
import { type ChangeEvent, useEffect, useId, useRef } from "react";
import TurndownService from "turndown";
import {
	applyNextEditHistoryAtom,
	applyPreviousEditHistoryAtom,
	initializeEditHistoryAtom,
	messagesAtom,
	noteAtom,
	saveEditHistoryAtom,
	saveNoteAtom,
	statusAtom,
	textSelectionAtom,
	updateNoteTextAtom,
} from "../atoms";
import { formatNoteText, type TextSelection, updateAnchor } from "../utils";
import { NotePreview } from "./NotePreview";

const turndownService = new TurndownService();

export function InputArea() {
	const messages = useAtomValue(messagesAtom);

	const note = useAtomValue(noteAtom);
	const updateNoteText = useSetAtom(updateNoteTextAtom);

	const setStatus = useSetAtom(statusAtom);

	const saveEditHistory = useSetAtom(saveEditHistoryAtom);

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const newNoteText = event.target.value;

		const newTextSelection = {
			start: event.target.selectionStart,
			end: event.target.selectionEnd,
		};

		updateNoteText(newNoteText);
		setTextSelection(newTextSelection);
		saveEditHistory(newNoteText, newTextSelection);
	};

	const handleCursorChange = () => {
		if (noteInputRef.current) {
			const newTextSelection: TextSelection = {
				start: noteInputRef.current.selectionStart,
				end: noteInputRef.current.selectionEnd,
			};

			setTextSelection(newTextSelection);
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
				saveEditHistory(formattedText, textSelection);
			}
		}

		setTextSelection(null);
	};

	const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
		const clipboardData = event.clipboardData;

		if (clipboardData) {
			const htmlContent = clipboardData.getData("text/html");

			if (htmlContent) {
				try {
					const pastedMarkdown = turndownService.turndown(htmlContent);

					event.preventDefault();

					const textarea = noteInputRef.current;

					if (textarea) {
						const start = textarea.selectionStart;
						const end = textarea.selectionEnd;

						const newNoteText =
							(note?.text ?? "").substring(0, start) +
							pastedMarkdown +
							(note?.text ?? "").substring(end);

						const newTextSelection: TextSelection = {
							start: start + pastedMarkdown.length,
							end: start + pastedMarkdown.length,
						};

						updateNoteText(newNoteText);
						setTextSelection(newTextSelection);
						saveEditHistory(newNoteText, newTextSelection);
					}
				} catch {}
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
				if (href.startsWith("#")) {
					updateAnchor(href.substring(1));

					return;
				}

				window.open(href, "_blank", "noopener,noreferrer");
			}
		}
	};

	const saveNote = useSetAtom(saveNoteAtom);

	const [textSelection, setTextSelection] = useAtom(textSelectionAtom);

	const applyPreviousEditHistory = useSetAtom(applyPreviousEditHistoryAtom);

	const applyNextEditHistory = useSetAtom(applyNextEditHistoryAtom);

	useEffect(() => {
		const listener = (event: KeyboardEvent) => {
			// Ctrl/Cmd + S: Save
			if ((event.ctrlKey || event.metaKey) && event.key === "s") {
				event.preventDefault();

				saveNote();

				globalThis.registerToastMessage("saveSuccess");
			}

			// Ctrl/Cmd + Z: Undo
			if (
				(event.ctrlKey || event.metaKey) &&
				event.key === "z" &&
				!event.shiftKey
			) {
				event.preventDefault();

				applyPreviousEditHistory();
			}

			// Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z: Redo
			if (
				(event.ctrlKey || event.metaKey) &&
				(event.key === "y" || (event.key === "z" && event.shiftKey))
			) {
				event.preventDefault();

				applyNextEditHistory();
			}

			// Tab
			if (event.key === "Tab") {
				const textarea = noteInputRef.current;

				if (textarea && event.target === textarea) {
					event.preventDefault();

					const start = textarea.selectionStart;
					const end = textarea.selectionEnd;

					const newNoteText =
						(note?.text ?? "").substring(0, start) +
						"\t" +
						(note?.text ?? "").substring(end);

					const newTextSelection: TextSelection = {
						start: start + 1,
						end: start + 1,
					};

					updateNoteText(newNoteText);
					setTextSelection(newTextSelection);
					saveEditHistory(newNoteText, newTextSelection);
				}
			}
		};

		document.addEventListener("keydown", listener);

		return () => {
			document.removeEventListener("keydown", listener);
		};
	}, [
		saveNote,
		note,
		updateNoteText,
		setTextSelection,
		saveEditHistory,
		applyPreviousEditHistory,
		applyNextEditHistory,
	]);

	const initializeEditHistory = useSetAtom(initializeEditHistoryAtom);

	// biome-ignore lint/correctness/useExhaustiveDependencies: initialization
	useEffect(() => {
		initializeEditHistory(note?.text ?? "", textSelection);
	}, []);

	const noteInputRef = useRef<HTMLTextAreaElement | null>(null);

	useEffect(() => {
		if (note === null) {
			noteInputRef.current?.focus();
		}
	}, [note]);

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

	const status = useAtomValue(statusAtom);

	return (
		<div className="input-area">
			<label htmlFor={noteInputId} className="sr-only">
				{messages.textareaPlaceholder}
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
					onPaste={handlePaste}
					placeholder={messages.textareaPlaceholder}
					aria-label={messages.textareaPlaceholder}
				/>
			</div>

			{/** biome-ignore lint/a11y/useKeyWithClickEvents: expected behavior */}
			<main
				className={[
					"note-preview",
					noteBlank && status === "viewing" ? "note-preview--skeleton" : [],
				]
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
