import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atomWithHash } from "jotai-location";
import {
	notesAppDisplayQrCode,
	notesAppLocale,
	notesAppSavedNote,
	notesAppTheme,
} from "./constants";
import {
	createNewNote,
	type EditHistoryEntry,
	formatNoteText,
	formatNoteTextWithCursorResult,
	formatTimeAgo,
	getFirstHeadingOrParagraphText,
	getFirstImage,
	getInitialLocale,
	type Locale,
	messagesByLocale,
	type Note,
	type Status,
	type TextSelection,
} from "./utils";

export const displayQrCodeAtom = atomWithStorage(notesAppDisplayQrCode, false);

export const localeAtom = atomWithStorage<Locale>(
	notesAppLocale,
	getInitialLocale(),
);

export const messagesAtom = atom((get) => {
	const locale = get(localeAtom);

	return messagesByLocale[locale];
});

const _noteAtom = atom(
	(get) => {
		const id = get(_noteIdAtom);
		const text = get(_noteTextAtom);
		const created = get(_noteCreatedAtom);
		const lastUpdated = get(_noteLastUpdatedAtom);

		if (id !== null) {
			const note: Note = {
				id,
				text,
				created,
				lastUpdated,
			};

			return note;
		}

		return null;
	},
	(_get, set, note: Note | null) => {
		if (note) {
			set(_noteIdAtom, note.id);
			set(_noteTextAtom, note.text);
			set(_noteCreatedAtom, note.created);
			set(_noteLastUpdatedAtom, note.lastUpdated);
		} else {
			set(_noteIdAtom, null);
			set(_noteTextAtom, "");
			set(_noteCreatedAtom, null);
			set(_noteLastUpdatedAtom, null);
		}
	},
);

export const noteAtom = atom((get) => get(_noteAtom));

const _noteIdAtom = atomWithHash<string | null>("id", null, {
	setHash: "replaceState",
	serialize(val) {
		return val ? val : "";
	},
	deserialize(str) {
		return str.length > 0 ? str : null;
	},
});

const _noteTextAtom = atomWithHash<string>("text", "", {
	setHash: "replaceState",
	serialize(val) {
		return val ? val : "";
	},
	deserialize(str) {
		return str.length > 0 ? str : "";
	},
});

const _noteCreatedAtom = atomWithHash<number | null>("created", null, {
	setHash: "replaceState",
	serialize(val) {
		return val ? val.toString() : "";
	},
	deserialize(str) {
		return str.length > 0 ? Number(str) : null;
	},
});

const _noteLastUpdatedAtom = atomWithHash<number | null>("lastUpdated", null, {
	setHash: "replaceState",
	serialize(val) {
		return val ? val.toString() : "";
	},
	deserialize(str) {
		return str.length > 0 ? Number(str) : null;
	},
});

export const noteTitleAtom = atom((get) => {
	const noteText = get(noteAtom)?.text;

	if (noteText) {
		return getFirstHeadingOrParagraphText(noteText);
	}

	return null;
});

export const noteFormattedLastUpdatedAtom = atom((get) => {
	get(rerenderAtom);

	const note = get(noteAtom);

	if (note) {
		const lastUpdated = note.lastUpdated;

		if (lastUpdated) {
			return formatTimeAgo(lastUpdated);
		}
	}

	return null;
});

export const clearNoteAtom = atom(null, (_get, set) => {
	set(_noteAtom, null);
});

export const updateNoteTextAtom = atom(null, (get, set, newText: string) => {
	const currentNote = get(noteAtom);

	if (currentNote) {
		set(_noteAtom, {
			...currentNote,
			text: newText,
			lastUpdated: Date.now(),
		});
	} else {
		set(_noteAtom, {
			...createNewNote(),
			text: newText,
		});
	}

	set(forceRerenderAtom);
});

export const restoreSavedNoteAtom = atom(null, (get, set) => {
	const savedNote = get(savedNoteAtom);

	set(_noteAtom, savedNote);

	globalThis.registerToastMessage("noteLoadedFromBrowser");
});

const _rerenderAtom = atom(0);

export const rerenderAtom = atom((get) => get(_rerenderAtom));

export const forceRerenderAtom = atom(null, (_get, set) => {
	set(_rerenderAtom, Date.now());
});

const _savedNoteAtom = atomWithStorage<Note | null>(notesAppSavedNote, null);

export const savedNoteAtom = atom((get) => get(_savedNoteAtom));

export const clearSavedNoteAtom = atom(null, (_get, set) => {
	set(_savedNoteAtom, null);
});

export const saveNoteAtom = atom(null, async (get, set) => {
	const note = get(noteAtom);
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

		set(_noteAtom, newNote);
		set(_savedNoteAtom, newNote);
	} else {
		set(_savedNoteAtom, note);
	}
});

export const saveFeatureApplicableAtom = atom((get) => {
	const note = get(noteAtom);
	const savedNote = get(savedNoteAtom);

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
	async (_get, set, noteText: string, textSelection: TextSelection | null) => {
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
