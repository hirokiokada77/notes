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
	formatNoteText,
	formatNoteTextWithCursorResult,
	formatTimeAgo,
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

		if (id !== null && text !== null) {
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
			set(_noteTextAtom, null);
			set(_noteCreatedAtom, null);
			set(_noteLastUpdatedAtom, null);
		}
	},
);

export const noteAtom = atom((get) => get(_noteAtom));

const _noteIdAtom = atomWithHash<string | null>("id", null, {
	setHash: "replaceState",
});

const _noteTextAtom = atomWithHash<string | null>("text", null, {
	setHash: "replaceState",
});

const _noteCreatedAtom = atomWithHash<number | null>("created", null, {
	setHash: "replaceState",
});

const _noteLastUpdatedAtom = atomWithHash<number | null>("lastUpdated", null, {
	setHash: "replaceState",
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

	globalThis.registerToastMessage("note_loaded_from_browser");
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

				if (note.text !== result.formatted) {
					set(textSelectionAtom, {
						start: result.cursorOffset,
						end: result.cursorOffset,
					});
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

export const clearFeatureApplicableAtom = atom((get) => {
	const note = get(noteAtom);
	const savedNote = get(savedNoteAtom);

	return !(!note || (!savedNote && note.text.length === 0));
});

export const statusAtom = atom<Status>("viewing");

export const themeAtom = atomWithStorage<"light" | "dark">(
	notesAppTheme,
	window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
);

export const documentTitleAtom = atom((get) => {
	const messages = get(messagesAtom);
	const note = get(noteAtom);

	const noteFirstLine = (note?.text ?? "").split("\n")[0].trim();
	const maxTitleLength = 140;

	if (noteFirstLine) {
		const truncatedTitle =
			noteFirstLine.length > maxTitleLength
				? `${noteFirstLine.substring(0, maxTitleLength)}...`
				: noteFirstLine;
		return `${messages.app_name} – ${truncatedTitle}`;
	}

	return messages.app_name;
});

export const textSelectionAtom = atom<TextSelection | null>(null);
