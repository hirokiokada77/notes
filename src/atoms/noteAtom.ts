import { atom } from "jotai";
import { v4 as uuidv4 } from "uuid";

export interface Note {
	id: string;
	text: string;
	dateCreated: number;
	dateLastModified: number;
}

export function createNewNote(): Note {
	return {
		id: uuidv4(),
		text: "",
		dateCreated: Date.now(),
		dateLastModified: Date.now(),
	};
}

function getInitialNote(): Note {
	const fragment = window.location.hash.substring(1);
	let note: Note = createNewNote();

	if (fragment) {
		try {
			note = JSON.parse(decodeURIComponent(fragment));
		} catch (error) {
			console.error("Error decoding URL fragment on initial load:", error);
		}
	} else {
		const savedNote = localStorage.getItem("notesAppSavedNote");

		if (savedNote) {
			setTimeout(() => {
				globalThis.registerToastMessage("note_loaded_from_browser");
			}, 100);

			note = JSON.parse(decodeURIComponent(savedNote));
		}
	}

	return note;
}

export const noteAtom = atom<Note>(getInitialNote());
