import "./InputArea.css";
import type { ClipboardEvent } from "react";
import { type ChangeEvent, useEffect, useId, useRef } from "react";
import TurndownService from "turndown";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectAllStringResources } from "../localeSlice";
import {
	applyNextEditHistory,
	applyPreviousEditHistory,
	formatNoteText,
	selectActiveNote,
	selectActiveNoteTextSelection,
	updateActiveNoteText,
	updateActiveNoteTextSelection,
} from "../notesSlice";
import { selectStatus, updateStatus } from "../statusSlice";
import type { TextSelection } from "../utils";
import { NotePreview } from "./NotePreview";

const turndownService = new TurndownService();

export function InputArea() {
	const dispatch = useAppDispatch();
	const status = useAppSelector(selectStatus);
	const stringResources = useAppSelector(selectAllStringResources);
	const activeNote = useAppSelector(selectActiveNote);
	const noteInputId = useId();
	const textSelection = useAppSelector(selectActiveNoteTextSelection);
	const noteInputRef = useRef<HTMLTextAreaElement | null>(null);
	const noteBlank = !(activeNote && activeNote.text.trim().length > 0);

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const newNoteText = event.target.value;
		const newTextSelection = {
			start: event.target.selectionStart,
			end: event.target.selectionEnd,
		};
		dispatch(updateActiveNoteText(newNoteText, newTextSelection));
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
			dispatch(formatNoteText());
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
						dispatch(updateActiveNoteText(newNoteText, newTextSelection));
					}
				} catch (error) {
					console.error(error);
				}
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
					dispatch(updateActiveNoteText(newNoteText, newTextSelection));
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

			<main
				className={[
					"note-preview",
					noteBlank && status === "viewing" ? "note-preview--skeleton" : [],
				]
					.flat()
					.join(" ")}
				aria-live="polite"
			>
				<div className="note-preview-container">
					<NotePreview />
				</div>
			</main>
		</div>
	);
}
