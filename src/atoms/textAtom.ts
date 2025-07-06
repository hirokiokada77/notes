import { atom } from "jotai";

const getInitialText = () => {
	const fragment = window.location.hash.substring(1);

	if (fragment) {
		try {
			return decodeURIComponent(fragment);
		} catch (error) {
			console.error("Error decoding URL fragment on initial load:", error);
			return "";
		}
	}

	const savedText = localStorage.getItem("notesAppText");

	if (savedText) {
		setTimeout(() => {
			globalThis.registerToastMessage("note_loaded_from_browser");
		}, 100);

		return savedText;
	}

	return "";
};

export const textAtom = atom<string>(getInitialText());
