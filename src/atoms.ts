import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
	notesAppDisplayQrCode,
	notesAppLocale,
	notesAppSavedNote,
	notesAppTheme,
} from "./constants";
import {
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

export const noteAtom = atom<Note | null>(getInitialNote());

export const rerenderAtom = atom(0);

export const savedNoteAtom = atomWithStorage<Note | null>(
	notesAppSavedNote,
	null,
);

export const statusAtom = atom<Status>("viewing");

export const themeAtom = atomWithStorage<"light" | "dark">(
	notesAppTheme,
	window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
);

export const urlAtom = atom(new URL(location.href));
