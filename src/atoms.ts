import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
	notesAppDisplayQrCode,
	notesAppLocale,
	notesAppSavedNote,
	notesAppTheme,
} from "./constants";
import {
	createNewNote,
	formatTimeAgo,
	getInitialLocale,
	getInitialNote,
	type Locale,
	messagesByLocale,
	type Note,
	type Status,
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

const _noteAtom = atom<Note | null>(getInitialNote());

export const noteAtom = atom((get) => get(_noteAtom));

export const noteFormattedLastUpdatedAtom = atom((get) => {
	get(rerenderAtom);

	const note = get(noteAtom);

	if (note) {
		return formatTimeAgo(note.lastUpdated);
	}

	return null;
});

export const clearNoteAtom = atom(null, (_get, set) => {
	set(_noteAtom, null);
});

export const restoreNoteFromHashAtom = atom(null, (_get, set, hash: string) => {
	const fragment = hash.substring(1);

	try {
		set(_noteAtom, JSON.parse(decodeURIComponent(fragment)));
	} catch {
		set(clearNoteAtom);
	}
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
});

export const restoreSavedNoteAtom = atom(null, (get, set) => {
	const savedNote = get(savedNoteAtom);

	set(_noteAtom, savedNote);
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

export const saveNoteAtom = atom(null, (get, set) => {
	const note = get(noteAtom);

	if (note) {
		const newNote: Note = {
			...note,
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

const _urlAtom = atom(new URL(location.href));

export const urlAtom = atom((get) => get(_urlAtom));

export const updateUrlAtom = atom(null, (_get, set, newUrl: string) =>
	set(_urlAtom, new URL(newUrl)),
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
