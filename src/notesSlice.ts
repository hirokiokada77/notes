import {
	createAsyncThunk,
	createSlice,
	type PayloadAction,
} from "@reduxjs/toolkit";
import TurndownService from "turndown";
import { homePath } from "./constants";
import type { RootState } from "./store";
import {
	createNewNote,
	type EditHistory,
	getNoteThumbnail,
	getNoteTitle,
	type Note,
	type TextSelection,
} from "./utils";

interface NotesState {
	activeNote: Note | null;
	activeNoteEditHistory: EditHistory[];
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
		applyNextEditHistory(state) {
			if (state.activeNote) {
				if (
					state.activeNoteEditHistory.length -
						state.activeNoteEditHistoryPointer >=
					2
				) {
					const { text, textSelection } =
						state.activeNoteEditHistory[state.activeNoteEditHistoryPointer + 1];
					state.activeNote.text = text;
					state.activeNoteTextSelection = textSelection;

					state.activeNoteEditHistoryPointer++;
				}
			} else {
				throw new Error();
			}
		},
		applyPreviousEditHistory(state) {
			if (state.activeNote) {
				if (state.activeNoteEditHistoryPointer >= 1) {
					const { text, textSelection } =
						state.activeNoteEditHistory[state.activeNoteEditHistoryPointer - 1];
					state.activeNote.text = text;
					state.activeNoteTextSelection = textSelection;

					state.activeNoteEditHistoryPointer--;
				}
			} else {
				throw new Error();
			}
		},
		clearActiveNote(state) {
			state.activeNote = null;
			state.activeNoteEditHistory = [];
			state.activeNoteEditHistoryPointer = -1;
		},
		deleteAllSavedNotes(state) {
			state.savedNotes = [];
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
						textSelection: null,
						created: action.payload,
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
				action: PayloadAction<{ htmlContent: string; time: number }>,
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
					state.activeNote.lastUpdated = action.payload.time;
					state.activeNoteTextSelection = textSelection;
					state.activeNoteEditHistory = state.activeNoteEditHistory.slice(
						0,
						state.activeNoteEditHistoryPointer + 1,
					);
					state.activeNoteEditHistory.push({
						text,
						textSelection,
						created: action.payload.time,
					});
					state.activeNoteEditHistoryPointer++;
				} else {
					throw new Error();
				}
			},
			prepare: (htmlContent: string) => ({
				payload: {
					htmlContent,
					time: Date.now(),
				},
			}),
		},
		saveActiveNote: {
			reducer: (state, action: PayloadAction<number>) => {
				if (state.activeNote) {
					state.savedNotes = state.savedNotes.filter(
						// biome-ignore lint/style/noNonNullAssertion: false positive
						(note) => note.id !== state.activeNote!.id,
					);
					state.activeNote.lastUpdated = action.payload;
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
			reducer: (state, action: PayloadAction<{ note: Note; time: number }>) => {
				state.activeNote = action.payload.note;
				state.activeNoteEditHistory = [
					{
						text: state.activeNote.text,
						textSelection: null,
						created: action.payload.time,
					},
				];
				state.activeNoteEditHistoryPointer = 0;
			},
			prepare: (note: Note) => ({
				payload: {
					note,
					time: Date.now(),
				},
			}),
		},
		updateActiveNoteText: {
			reducer: (
				state,
				action: PayloadAction<{
					text: string;
					textSelection: TextSelection | null;
					time: number;
				}>,
			) => {
				if (state.activeNote) {
					state.activeNote.text = action.payload.text;
					state.activeNote.lastUpdated = action.payload.time;
					state.activeNoteTextSelection = action.payload.textSelection;

					state.activeNoteEditHistory = state.activeNoteEditHistory.slice(
						0,
						state.activeNoteEditHistoryPointer + 1,
					);
					state.activeNoteEditHistory.push({
						text: action.payload.text,
						textSelection: action.payload.textSelection,
						created: action.payload.time,
					});

					state.activeNoteEditHistoryPointer++;
				} else {
					throw new Error();
				}
			},
			prepare: (text: string, textSelection: TextSelection | null) => ({
				payload: { text, textSelection, time: Date.now() },
			}),
		},
		updateActiveNoteTextSelection(
			state,
			action: PayloadAction<TextSelection | null>,
		) {
			state.activeNoteTextSelection = action.payload;
			state.activeNoteEditHistory[
				state.activeNoteEditHistoryPointer
			].textSelection = action.payload;
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
			const savedNote =
				state.savedNotes.filter(
					(savedNote) =>
						state.activeNote && savedNote.id === state.activeNote.id,
				)[0] ?? null;
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
		selectActiveNoteThumbnail: (state) =>
			state.activeNote ? getNoteThumbnail(state.activeNote.text) : null,
		selectActiveNoteTitle: (state) =>
			state.activeNote ? getNoteTitle(state.activeNote.text) : null,
		selectActiveNoteUrl: (state) => {
			const activeNote = state.activeNote;
			if (activeNote && activeNote.text.trim().length > 0) {
				const id = activeNote.id;
				const text = activeNote.text;
				const created =
					activeNote.created !== null ? activeNote.created.toString() : "";
				const lastUpdated =
					activeNote.lastUpdated !== null
						? activeNote.lastUpdated.toString()
						: "";
				const hash = new URLSearchParams({
					id,
					text,
					created,
					lastUpdated,
				}).toString();
				return `${location.protocol}//${location.host}${homePath}#${hash}`;
			}
			return `${location.protocol}//${location.host}${homePath}`;
		},
		selectActiveNoteTextSelection: (state) => state.activeNoteTextSelection,
		selectAllSavedNotes: (state) => state.savedNotes,
		shouldWarnBeforeLeaving: (state) => {
			const savedNote =
				state.savedNotes.filter(
					(savedNote) =>
						state.activeNote && savedNote.id === state.activeNote.id,
				)[0] ?? null;
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

export const formatNoteText = createAsyncThunk<
	{ text: string; textSelection: TextSelection | null; time: number },
	void,
	{
		state: RootState;
	}
>("notes/formatNoteText", async (_arg, { getState }) => {
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
					time: Date.now(),
				};
			} else {
				return {
					text: formatted,
					textSelection: {
						start: newStart,
						end: newStart,
					},
					time: Date.now(),
				};
			}
		} else {
			const formatted = await format(activeNote.text, prettierOptions);

			return {
				text: formatted,
				textSelection: null,
				time: Date.now(),
			};
		}
	} else {
		throw new Error();
	}
});

export const notesReducer = notesSlice.reducer;

export const {
	applyNextEditHistory,
	applyPreviousEditHistory,
	clearActiveNote,
	deleteAllSavedNotes,
	deleteSavedNoteById,
	initializeActiveNote,
	insertHtmlContent,
	saveActiveNote,
	setActiveNote,
	updateActiveNoteText,
	updateActiveNoteTextSelection,
} = notesSlice.actions;

export const {
	hasUnsavedChanges,
	selectActiveNote,
	selectActiveNoteThumbnail,
	selectActiveNoteTitle,
	selectActiveNoteUrl,
	selectActiveNoteTextSelection,
	selectAllSavedNotes,
	shouldWarnBeforeLeaving,
} = notesSlice.selectors;
