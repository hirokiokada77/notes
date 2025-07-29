import "./InputArea.css";
import type { ClipboardEvent, MouseEvent } from "react";
import { type ChangeEvent, useEffect, useId, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import TurndownService from "turndown";
import { selectAllStringResources } from "../localeSlice";
import {
	applyNextEditHistory,
	applyPreviousEditHistory,
	selectActiveNote,
	selectActiveNoteTextSelection,
	updateActiveNoteText,
	updateActiveNoteTextSelection,
} from "../notesSlice";
import { selectStatus, updateStatus } from "../statusSlice";
import { formatNoteText, type TextSelection, updateAnchor } from "../utils";
import { NotePreview } from "./NotePreview";

const turndownService = new TurndownService();

export function InputArea() {
	const dispatch = useDispatch();
	const status = useSelector(selectStatus);
	const stringResources = useSelector(selectAllStringResources);
	const activeNote = useSelector(selectActiveNote);
	const noteInputId = useId();
	const textSelection = useSelector(selectActiveNoteTextSelection);
	const noteInputRef = useRef<HTMLTextAreaElement | null>(null);
	const noteBlank = !(activeNote && activeNote.text.trim().length > 0);

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const newNoteText = event.target.value;
		const newTextSelection = {
			start: event.target.selectionStart,
			end: event.target.selectionEnd,
		};
		dispatch(updateActiveNoteText([newNoteText, newTextSelection]));
	};

	const handleCursorChange = () => {
		if (noteInputRef.current) {
			dispatch(
				updateActiveNoteTextSelection({
					start: noteInputRef.current.selectionStart,
					end: noteInputRef.current.selectionEnd,
				}),
			);
		}
	};

	const handleFocus = () => {
		dispatch(updateStatus("editing"));
	};

	const handleBlur = async () => {
		dispatch(updateStatus("viewing"));
		if (activeNote) {
			const formattedText = await formatNoteText(activeNote.text);
			if (activeNote.text !== formattedText) {
				dispatch(updateActiveNoteText([formattedText, textSelection]));
			}
		}
		dispatch(updateActiveNoteTextSelection(null));
	};

	const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
		const clipboardData = event.clipboardData;
		if (clipboardData) {
			const htmlContent = clipboardData.getData("text/html");
			if (htmlContent) {
				try {
					event.preventDefault();
					const pastedMarkdown = turndownService.turndown(htmlContent);
					const textarea = noteInputRef.current;
					if (textarea) {
						const selectionStart = textarea.selectionStart;
						const selectionEnd = textarea.selectionEnd;
						const newNoteText =
							(activeNote?.text ?? "").substring(0, selectionStart) +
							pastedMarkdown +
							(activeNote?.text ?? "").substring(selectionEnd);
						const newTextSelection: TextSelection = {
							start: selectionStart + pastedMarkdown.length,
							end: selectionStart + pastedMarkdown.length,
						};
						dispatch(updateActiveNoteText([newNoteText, newTextSelection]));
					}
				} catch (error) {
					console.error(error);
				}
			}
		}
	};

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		const target = event.target as HTMLElement;
		if (
			(target.tagName === "A" && target.hasAttribute("href")) ||
			(target.tagName === "IMG" && target.closest("a[href]"))
		) {
			event.preventDefault();
			const href = target.getAttribute("href") ?? target.closest("a")?.href;
			if (href) {
				if (href.startsWith("#")) {
					updateAnchor(href.substring(1));
					return;
				}
				window.open(href, "_blank", "noopener,noreferrer");
			}
		}
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Undo
			if (
				(event.ctrlKey || event.metaKey) &&
				event.key === "z" &&
				!event.shiftKey
			) {
				event.preventDefault();
				dispatch(applyPreviousEditHistory());
			}

			// Redo
			if (
				(event.ctrlKey || event.metaKey) &&
				(event.key === "y" || (event.key === "z" && event.shiftKey))
			) {
				event.preventDefault();
				dispatch(applyNextEditHistory());
			}

			// Tab
			if (event.key === "Tab") {
				const textarea = noteInputRef.current;
				if (textarea && event.target === textarea) {
					event.preventDefault();
					const start = textarea.selectionStart;
					const end = textarea.selectionEnd;
					const newNoteText =
						(activeNote?.text ?? "").substring(0, start) +
						"\t" +
						(activeNote?.text ?? "").substring(end);
					const newTextSelection: TextSelection = {
						start: start + 1,
						end: start + 1,
					};
					dispatch(updateActiveNoteText([newNoteText, newTextSelection]));
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [activeNote, dispatch]);

	useEffect(() => {
		if (activeNote === null) {
			noteInputRef.current?.focus();
		}
	}, [activeNote]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: expected behavior
	useEffect(() => {
		if (noteInputRef.current && textSelection !== null) {
			noteInputRef.current.setSelectionRange(
				textSelection.start,
				textSelection.end,
			);
		}
	}, [textSelection, activeNote]);

	return (
		<div className="input-area">
			<label htmlFor={noteInputId} className="sr-only">
				{stringResources.textareaPlaceholder}
			</label>

			<div className="note-input">
				<textarea
					id={noteInputId}
					ref={noteInputRef}
					className="note-input-container"
					value={activeNote ? activeNote.text : ""}
					onChange={handleChange}
					onKeyUp={handleCursorChange}
					onMouseUp={handleCursorChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					onPaste={handlePaste}
					placeholder={stringResources.textareaPlaceholder}
					aria-label={stringResources.textareaPlaceholder}
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
