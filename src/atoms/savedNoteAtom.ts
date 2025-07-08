import { atomWithStorage } from "jotai/utils";
import type { Note } from "./noteAtom";

export const savedNoteAtom = atomWithStorage<Note | null>(
	"notesAppSavedNote",
	null,
);
