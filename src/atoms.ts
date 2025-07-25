import { atom, createStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
	homePath,
	notesAppDisplayQrCode,
	notesAppLocale,
	notesAppSavedNotes,
	notesAppTheme,
} from "./constants";
import {
	createNewNote,
	type EditHistoryEntry,
	formatNoteText,
	formatNoteTextWithCursorResult,
	getFirstHeadingOrParagraphText,
	getFirstImage,
	getInitialLocale,
	type Locale,
	messagesByLocale,
	type Note,
	type Status,
	type TextSelection,
} from "./utils";

export const store = createStore();

export const displayQrCodeAtom = atomWithStorage(notesAppDisplayQrCode, false);

export const localeAtom = atomWithStorage<Locale>(
	notesAppLocale,
	getInitialLocale(),
);

export const messagesAtom = atom((get) => {
	const locale = get(localeAtom);

	return messagesByLocale[locale];
});

export const noteAtom = atom<Note | null>(null);

export const noteUrlAtom = atom((get) => {
	const note = get(noteAtom);

	if (note) {
		const hash = new URLSearchParams({
			id: note.id,
			text: note.text,
			created: note.created !== null ? note.created.toString() : "",
			lastUpdated: note.lastUpdated !== null ? note.lastUpdated.toString() : "",
		}).toString();

		return `${location.protocol}//${location.host}${homePath}#${hash}`;
	}

	return `${location.protocol}//${location.host}${homePath}`;
});

export const initializeNoteAtom = atom(null, (_get, set) => {
	set(noteAtom, createNewNote());
	set(initializeEditHistoryAtom, "", null);
});

export const updateNoteTextAtom = atom(null, (get, set, newText: string) => {
	const currentNote = get(noteAtom);

	if (currentNote) {
		set(noteAtom, {
			...currentNote,
			text: newText,
			lastUpdated: Date.now(),
		});
	} else {
		set(noteAtom, {
			...createNewNote(),
			text: newText,
		});
	}
});

export const restoreSavedNoteAtom = atom(null, (get, set, id) => {
	const savedNote = get(savedNotesAtom).filter((n) => n.id === id)[0] ?? null;

	if (savedNote) {
		set(noteAtom, savedNote);
	} else {
		throw new Error();
	}
});

const _timeAtom = atom(0);

export const timeAtom = atom((get) => get(_timeAtom));

export const updateTimeAtom = atom(null, (_get, set) => {
	set(_timeAtom, Date.now());
});

const _savedNotesAtom = atomWithStorage<Note[]>(notesAppSavedNotes, []);

export const savedNotesAtom = atom((get) =>
	get(_savedNotesAtom).sort(
		(a, b) => (b.lastUpdated ?? 0) - (a.lastUpdated ?? 0),
	),
);

export const latestSavedNoteAtom = atom((get) => {
	return get(savedNotesAtom)[0] ?? null;
});

export const deleteSavedNoteByIdAtom = atom(null, (get, set, id: string) => {
	set(
		_savedNotesAtom,
		get(savedNotesAtom).filter((note) => note.id !== id),
	);
});

export const saveNoteAtom = atom(null, async (get, set) => {
	const note = get(noteAtom);
	const savedNotes = get(savedNotesAtom);
	const textSelection = get(textSelectionAtom);

	if (note) {
		const formattedText = await (async () => {
			if (textSelection !== null) {
				const result = await formatNoteTextWithCursorResult(
					note.text,
					textSelection.start,
				);
				const newTextSelectionStart = result.cursorOffset;

				if (note.text !== result.formatted) {
					if (textSelection.start !== textSelection.end) {
						const newTextSelectionEnd = (
							await formatNoteTextWithCursorResult(note.text, textSelection.end)
						).cursorOffset;

						set(textSelectionAtom, {
							start: newTextSelectionStart,
							end: newTextSelectionEnd,
						});
					} else {
						set(textSelectionAtom, {
							start: newTextSelectionStart,
							end: newTextSelectionStart,
						});
					}
				}

				return result.formatted;
			} else {
				return await formatNoteText(note.text);
			}
		})();
		const newNote: Note = {
			...note,
			text: formattedText,
			lastUpdated: Date.now(),
		};

		set(noteAtom, newNote);

		if (savedNotes.filter((n) => n.id === newNote.id).length > 0) {
			set(
				_savedNotesAtom,
				savedNotes.map((n) => (n.id === newNote.id ? newNote : n)),
			);
		} else {
			set(_savedNotesAtom, [...savedNotes, newNote]);
		}
	}
});

export const unsavedChangesAtom = atom((get) => {
	const note = get(noteAtom);
	const savedNote =
		get(savedNotesAtom).filter((n) => note && n.id === note.id)[0] ?? null;

	return (
		!(!note && !savedNote) &&
		!(
			note &&
			savedNote &&
			note.id === savedNote.id &&
			note.text === savedNote.text
		)
	);
});

export const shouldWarnBeforeLeavingAtom = atom((get) => {
	const note = get(noteAtom);
	const savedNote =
		get(savedNotesAtom).filter((n) => note && n.id === note.id)[0] ?? null;

	return (
		((!savedNote && (note?.text ?? "").trim().length > 0) ||
			(note && savedNote && note.text !== savedNote.text)) ??
		false
	);
});

export const statusAtom = atom<Status>("viewing");

export const themeAtom = atomWithStorage<"light" | "dark">(
	notesAppTheme,
	window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
);

export const documentTitleAtom = atom((get) => {
	const messages = get(messagesAtom);
	const noteText = get(noteAtom)?.text;

	if (noteText) {
		const firstHeadingOrParagraphText =
			getFirstHeadingOrParagraphText(noteText);

		if (firstHeadingOrParagraphText) {
			return `${messages.appName} – ${firstHeadingOrParagraphText}`;
		}
	}

	return messages.appName;
});

export const noteThumbnailImageAtom = atom((get) => {
	const noteText = get(noteAtom)?.text;

	if (noteText) {
		const thumbnail = getFirstImage(noteText);

		if (thumbnail) {
			return thumbnail;
		}
	}

	return null;
});

export const textSelectionAtom = atom<TextSelection | null>(null);

const _editHistoryAtom = atom<EditHistoryEntry[]>([]);

const _editHistoryPointerAtom = atom<number>(-1);

export const saveEditHistoryAtom = atom(
	null,
	(get, set, noteText: string, textSelection: TextSelection | null) => {
		const editHistory = get(_editHistoryAtom);
		const editHistoryPointer = get(_editHistoryPointerAtom);

		const newEntry: EditHistoryEntry = {
			noteText,
			textSelection,
			created: Date.now(),
		};

		const newEditHistory = [
			...editHistory.slice(0, editHistoryPointer + 1),
			newEntry,
		];
		const newEditHistoryPointer = editHistoryPointer + 1;

		set(_editHistoryAtom, newEditHistory);
		set(_editHistoryPointerAtom, newEditHistoryPointer);
	},
);

export const initializeEditHistoryAtom = atom(
	null,
	(_get, set, noteText: string, textSelection: TextSelection | null) => {
		set(_editHistoryAtom, []);
		set(_editHistoryPointerAtom, -1);
		set(saveEditHistoryAtom, noteText, textSelection);
	},
);

export const applyPreviousEditHistoryAtom = atom(null, (get, set) => {
	const editHistory = get(_editHistoryAtom);
	const editHistoryPointer = get(_editHistoryPointerAtom);

	if (editHistoryPointer >= 1) {
		const previousHistoryEntry = editHistory[editHistoryPointer - 1];

		set(updateNoteTextAtom, previousHistoryEntry.noteText);
		set(textSelectionAtom, previousHistoryEntry.textSelection);
		set(_editHistoryPointerAtom, editHistoryPointer - 1);
	}
});

export const applyNextEditHistoryAtom = atom(null, (get, set) => {
	const editHistory = get(_editHistoryAtom);
	const editHistoryPointer = get(_editHistoryPointerAtom);

	if (editHistory.length - editHistoryPointer >= 2) {
		const nextEditHistory = editHistory[editHistoryPointer + 1];

		set(updateNoteTextAtom, nextEditHistory.noteText);
		set(textSelectionAtom, nextEditHistory.textSelection);
		set(_editHistoryPointerAtom, editHistoryPointer + 1);
	}
});
