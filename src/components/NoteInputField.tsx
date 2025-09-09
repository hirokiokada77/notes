import "./NoteInputField.css";
import type { ClipboardEvent } from "react";
import { type ChangeEvent, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
	formatNoteText,
	insertHtmlContent,
	redo,
	selectActiveNoteText,
	selectActiveNoteTextSelection,
	undo,
	updateActiveNoteText,
	updateActiveNoteTextSelection,
} from "../notesSlice";
import { selectStringResources } from "../stringResourcesSlice";
import type { TextSelection } from "../utils";

export function NoteInputField() {
	const dispatch = useAppDispatch();
	const stringResources = useAppSelector(selectStringResources);
	const activeNoteText = useAppSelector(selectActiveNoteText);
	const textSelection = useAppSelector(selectActiveNoteTextSelection);
	const noteInputFieldRef = useRef<HTMLTextAreaElement | null>(null);
	const noteBlank = !(activeNoteText && activeNoteText.trim().length > 0);

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const newNoteText = event.target.value;
		const newTextSelection = {
			start: event.target.selectionStart,
			end: event.target.selectionEnd,
		};
		dispatch(updateActiveNoteText(newNoteText, newTextSelection));
	};

	const handleCursorChange = () => {
		if (noteInputFieldRef.current) {
			dispatch(
				updateActiveNoteTextSelection({
					start: noteInputFieldRef.current.selectionStart,
					end: noteInputFieldRef.current.selectionEnd,
				}),
			);
		}
	};

	const handleBlur = async () => {
		if (activeNoteText) {
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
			if (
				(event.ctrlKey || event.metaKey) &&
				event.key === "z" &&
				!event.shiftKey
			) {
				event.preventDefault();
				dispatch(undo());
			}

			if (
				(event.ctrlKey || event.metaKey) &&
				(event.key === "y" || (event.key === "z" && event.shiftKey))
			) {
				event.preventDefault();
				dispatch(redo());
			}

			if (event.key === "Tab") {
				const textarea = noteInputFieldRef.current;
				if (textarea && event.target === textarea) {
					event.preventDefault();
					const start = textarea.selectionStart;
					const end = textarea.selectionEnd;
					const newNoteText =
						(activeNoteText ?? "").substring(0, start) +
						"\t" +
						(activeNoteText ?? "").substring(end);
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
	}, [activeNoteText, dispatch]);

	useEffect(() => {
		if (noteBlank) {
			noteInputFieldRef.current?.focus();
		}
	}, [noteBlank]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: expected behavior
	useEffect(() => {
		if (noteInputFieldRef.current && textSelection !== null) {
			noteInputFieldRef.current.setSelectionRange(
				textSelection.start,
				textSelection.end,
			);
		}
	}, [textSelection, activeNoteText]);

	return (
		<textarea
			ref={noteInputFieldRef}
			className="note-input-field"
			value={activeNoteText ?? ""}
			onChange={handleChange}
			onKeyUp={handleCursorChange}
			onMouseUp={handleCursorChange}
			onBlur={handleBlur}
			onPaste={handlePaste}
			placeholder={stringResources["placeholders/noteInputField"]}
			aria-label={stringResources["placeholders/noteInputField"]}
		/>
	);
}
