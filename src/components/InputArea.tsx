import "./InputArea.css";
import type { ClipboardEvent } from "react";
import { type ChangeEvent, useEffect, useId, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectAllStringResources } from "../localeSlice";
import {
	formatNoteText,
	insertHtmlContent,
	redo,
	selectActiveNote,
	selectActiveNoteTextSelection,
	undo,
	updateActiveNoteText,
	updateActiveNoteTextSelection,
} from "../notesSlice";
import { selectStatus, updateStatus } from "../statusSlice";
import type { TextSelection } from "../utils";
import { NotePreview } from "./NotePreview";

export const InputArea = () => {
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
				event.preventDefault();
				dispatch(insertHtmlContent(htmlContent));
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
				dispatch(undo());
			}

			// Redo
			if (
				(event.ctrlKey || event.metaKey) &&
				(event.key === "y" || (event.key === "z" && event.shiftKey))
			) {
				event.preventDefault();
				dispatch(redo());
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
		if (activeNote === null || activeNote.text.trim().length === 0) {
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
				{stringResources.textFieldPlaceholder}
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
					placeholder={stringResources.textFieldPlaceholder}
					aria-label={stringResources.textFieldPlaceholder}
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
};
