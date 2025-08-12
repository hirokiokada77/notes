import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import TurndownService from "turndown";
import { homePath } from "./constants";
import {
	createNewNote,
	type EditHistory,
	getNoteThumbnail,
	getNoteTitle,
	type Note,
	type TextSelection,
} from "./utils";
import { createAppAsyncThunk, createAppSelector } from "./withTypes";

interface NotesState {
	activeNote: Note | null;
	activeNoteEditHistory: EditHistory;
	activeNoteEditHistoryPointer: number;
	activeNoteTextSelection: TextSelection | null;
	savedNotes: Note[];
}

const initialState: NotesState = {
	activeNote: null,
	activeNoteEditHistory: [],
	activeNoteEditHistoryPointer: -1,
	activeNoteTextSelection: null,
	savedNotes: [],
};

export const notesSlice = createSlice({
	name: "notes",
	initialState,
	reducers: {
		clearActiveNote(state) {
			state.activeNote = null;
			state.activeNoteEditHistory = [];
			state.activeNoteEditHistoryPointer = -1;
		},
		deleteSavedNoteById(state, action: PayloadAction<string>) {
			state.savedNotes = state.savedNotes.filter(
				(note) => note.id !== action.payload,
			);
		},
		initializeActiveNote: {
			reducer: (state, action: PayloadAction<number>) => {
				state.activeNote = createNewNote(action.payload);
				state.activeNoteEditHistory = [
					{
						text: state.activeNote.text,
						textSelectionBefore: null,
						textSelectionAfter: null,
						createdAt: action.payload,
					},
				];
				state.activeNoteEditHistoryPointer = 0;
			},
			prepare: () => ({
				payload: Date.now(),
			}),
		},
		insertHtmlContent: {
			reducer: (
				state,
				action: PayloadAction<{ htmlContent: string; timestamp: number }>,
			) => {
				if (state.activeNote && state.activeNoteTextSelection) {
					const turndownService = new TurndownService();
					const pastedMarkdown = turndownService.turndown(
						action.payload.htmlContent,
					);
					const text =
						state.activeNote.text.substring(
							0,
							state.activeNoteTextSelection.start,
						) +
						pastedMarkdown +
						state.activeNote.text.substring(state.activeNoteTextSelection.end);
					const textSelection = {
						start: state.activeNoteTextSelection.start + pastedMarkdown.length,
						end: state.activeNoteTextSelection.start + pastedMarkdown.length,
					};

					state.activeNote.text = text;
					state.activeNote.lastUpdatedAt = action.payload.timestamp;
					state.activeNoteEditHistory = state.activeNoteEditHistory.slice(
						0,
						state.activeNoteEditHistoryPointer + 1,
					);
					state.activeNoteEditHistory.push({
						text,
						textSelectionBefore: state.activeNoteTextSelection,
						textSelectionAfter: textSelection,
						createdAt: action.payload.timestamp,
					});
					state.activeNoteEditHistoryPointer++;
					state.activeNoteTextSelection = textSelection;
				} else {
					throw new Error();
				}
			},
			prepare: (htmlContent: string) => ({
				payload: {
					htmlContent,
					timestamp: Date.now(),
				},
			}),
		},
		redo(state) {
			if (state.activeNote) {
				if (
					state.activeNoteEditHistory.length -
						state.activeNoteEditHistoryPointer >=
					2
				) {
					const { text, textSelectionAfter: textSelection } =
						state.activeNoteEditHistory[state.activeNoteEditHistoryPointer + 1];
					state.activeNote.text = text;
					state.activeNoteEditHistoryPointer++;
					state.activeNoteTextSelection = textSelection;
				}
			} else {
				throw new Error();
			}
		},
		saveActiveNote: {
			reducer: (state, action: PayloadAction<number>) => {
				if (state.activeNote) {
					state.savedNotes = state.savedNotes.filter(
						(note) => note.id !== state.activeNote!.id,
					);
					state.activeNote.lastUpdatedAt = action.payload;
					state.savedNotes.push(state.activeNote);
				} else {
					throw new Error();
				}
			},
			prepare: () => ({
				payload: Date.now(),
			}),
		},
		setActiveNote: {
			reducer: (
				state,
				action: PayloadAction<{ note: Note; timestamp: number }>,
			) => {
				state.activeNote = action.payload.note;
				state.activeNoteEditHistory = [
					{
						text: state.activeNote.text,
						textSelectionBefore: null,
						textSelectionAfter: null,
						createdAt: action.payload.timestamp,
					},
				];
				state.activeNoteEditHistoryPointer = 0;
			},
			prepare: (note: Note) => ({
				payload: {
					note,
					timestamp: Date.now(),
				},
			}),
		},
		undo(state) {
			if (state.activeNote) {
				if (state.activeNoteEditHistoryPointer >= 1) {
					const text =
						state.activeNoteEditHistory[state.activeNoteEditHistoryPointer - 1]
							.text;
					const textSelection =
						state.activeNoteEditHistory[state.activeNoteEditHistoryPointer]
							.textSelectionBefore;
					state.activeNote.text = text;
					state.activeNoteEditHistoryPointer--;
					state.activeNoteTextSelection = textSelection;
				}
			} else {
				throw new Error();
			}
		},
		updateActiveNoteText: {
			reducer: (
				state,
				action: PayloadAction<{
					text: string;
					textSelection: TextSelection | null;
					timestamp: number;
				}>,
			) => {
				if (state.activeNote) {
					state.activeNote.text = action.payload.text;
					state.activeNote.lastUpdatedAt = action.payload.timestamp;
					state.activeNoteEditHistory = state.activeNoteEditHistory.slice(
						0,
						state.activeNoteEditHistoryPointer + 1,
					);
					state.activeNoteEditHistory.push({
						text: action.payload.text,
						textSelectionBefore: state.activeNoteTextSelection,
						textSelectionAfter: action.payload.textSelection,
						createdAt: action.payload.timestamp,
					});
					state.activeNoteEditHistoryPointer++;
					state.activeNoteTextSelection = action.payload.textSelection;
				} else {
					throw new Error();
				}
			},
			prepare: (text: string, textSelection: TextSelection | null) => ({
				payload: { text, textSelection, timestamp: Date.now() },
			}),
		},
		updateActiveNoteTextSelection(
			state,
			action: PayloadAction<TextSelection | null>,
		) {
			state.activeNoteTextSelection = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(formatNoteText.fulfilled, (state, action) => {
			if (state.activeNote && state.activeNote.text !== action.payload.text) {
				notesSlice.caseReducers.updateActiveNoteText(state, action);
			}
		});
	},
	selectors: {
		hasUnsavedChanges: (state) => {
			const savedNote = state.savedNotes.find(
				(savedNote) => state.activeNote && savedNote.id === state.activeNote.id,
			);
			return (
				!(!state.activeNote && !savedNote) &&
				!(
					state.activeNote &&
					savedNote &&
					state.activeNote.id === savedNote.id &&
					state.activeNote.text === savedNote.text
				)
			);
		},
		selectActiveNote: (state) => state.activeNote,
		selectActiveNoteId: (state) => state.activeNote?.id ?? null,
		selectActiveNoteText: (state) => state.activeNote?.text ?? null,
		selectActiveNoteThumbnail: (state) =>
			state.activeNote ? getNoteThumbnail(state.activeNote.text) : null,
		selectActiveNoteTitle: (state) =>
			state.activeNote ? getNoteTitle(state.activeNote.text) : null,
		selectActiveNoteUrl: (state) => {
			const activeNote = state.activeNote;
			if (activeNote && activeNote.text.trim().length > 0) {
				const id = activeNote.id;
				const text = activeNote.text;
				const createdAt =
					activeNote.createdAt !== null ? activeNote.createdAt.toString() : "";
				const lastUpdatedAt =
					activeNote.lastUpdatedAt !== null
						? activeNote.lastUpdatedAt.toString()
						: "";
				const hash = new URLSearchParams({
					id,
					text,
					createdAt,
					lastUpdatedAt,
				}).toString();
				return `${location.protocol}//${location.host}${homePath}#${hash}`;
			}
			return `${location.protocol}//${location.host}${homePath}`;
		},
		selectActiveNoteTextSelection: (state) => state.activeNoteTextSelection,
		shouldWarnBeforeLeaving: (state) => {
			const savedNote = state.savedNotes.find(
				(savedNote) => state.activeNote && savedNote.id === state.activeNote.id,
			);
			return (
				((!savedNote && (state.activeNote?.text ?? "").trim().length > 0) ||
					(state.activeNote &&
						savedNote &&
						state.activeNote.text !== savedNote.text)) ??
				false
			);
		},
	},
});

export const formatNoteText = createAppAsyncThunk(
	"notes/formatNoteText",
	async (_arg, { getState }) => {
		const state = getState();
		const { activeNote, activeNoteTextSelection } = state.notes;
		const { format, formatWithCursor } = await import("prettier");
		const prettierOptions = {
			parser: "markdown",
			plugins: [(await import("prettier/plugins/markdown")).default],
		};

		if (activeNote) {
			if (activeNoteTextSelection) {
				const { formatted, cursorOffset: newStart } = await formatWithCursor(
					activeNote.text,
					{
						...prettierOptions,
						cursorOffset: activeNoteTextSelection.start,
					},
				);

				if (activeNoteTextSelection.start !== activeNoteTextSelection.end) {
					const { cursorOffset: newEnd } = await formatWithCursor(
						activeNote.text,
						{
							...prettierOptions,
							cursorOffset: activeNoteTextSelection.end,
						},
					);

					return {
						text: formatted,
						textSelection: {
							start: newStart,
							end: newEnd,
						},
						timestamp: Date.now(),
					};
				} else {
					return {
						text: formatted,
						textSelection: {
							start: newStart,
							end: newStart,
						},
						timestamp: Date.now(),
					};
				}
			} else {
				const formatted = await format(activeNote.text, prettierOptions);

				return {
					text: formatted,
					textSelection: null,
					timestamp: Date.now(),
				};
			}
		} else {
			throw new Error();
		}
	},
);

export const notesReducer = notesSlice.reducer;

export const {
	clearActiveNote,
	deleteSavedNoteById,
	initializeActiveNote,
	insertHtmlContent,
	redo,
	saveActiveNote,
	setActiveNote,
	undo,
	updateActiveNoteText,
	updateActiveNoteTextSelection,
} = notesSlice.actions;

export const {
	hasUnsavedChanges,
	selectActiveNote,
	selectActiveNoteId,
	selectActiveNoteText,
	selectActiveNoteThumbnail,
	selectActiveNoteTitle,
	selectActiveNoteUrl,
	selectActiveNoteTextSelection,
	shouldWarnBeforeLeaving,
} = notesSlice.selectors;

export const selectAllSavedNotes = createAppSelector(
	[(state) => state.notes.savedNotes],
	(savedNotes) =>
		[...savedNotes].sort(
			(a, b) => (b.lastUpdatedAt ?? 0) - (a.lastUpdatedAt ?? 0),
		),
);
