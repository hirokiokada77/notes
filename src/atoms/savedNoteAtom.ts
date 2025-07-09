import { atomWithStorage } from "jotai/utils";
import { notesAppSavedNote } from "../constants";
import type { Note } from "./noteAtom";

export const savedNoteAtom = atomWithStorage<Note | null>(
	notesAppSavedNote,
	null,
);
