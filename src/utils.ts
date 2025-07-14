import { notesAppSavedNote } from "./constants";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import zh from "./locales/zh.json";

export function formatTimeAgo(unixMilliseconds: number) {
	const now = Date.now();
	const seconds = Math.floor((now - unixMilliseconds) / 1000);

	const SECOND = 1;
	const MINUTE = 60;
	const HOUR = MINUTE * 60;
	const DAY = HOUR * 24;
	const MONTH = DAY * 30;
	const YEAR = DAY * 365;

	if (seconds < 0) {
		return "In the future";
	} else if (seconds < SECOND) {
		return "Now";
	} else if (seconds < MINUTE) {
		return `${seconds} sec${seconds === 1 ? "" : "s"} ago`;
	} else if (seconds < HOUR) {
		const minutes = Math.floor(seconds / MINUTE);
		return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
	} else if (seconds < DAY) {
		const hours = Math.floor(seconds / HOUR);
		return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	} else if (seconds < MONTH) {
		const days = Math.floor(seconds / DAY);
		return `${days} day${days === 1 ? "" : "s"} ago`;
	} else if (seconds < YEAR) {
		const months = Math.floor(seconds / MONTH);
		return `${months} month${months === 1 ? "" : "s"} ago`;
	} else {
		const years = Math.floor(seconds / YEAR);
		return `${years} year${years === 1 ? "" : "s"} ago`;
	}
}

export type Locale =
	| "de"
	| "en"
	| "es"
	| "fr"
	| "it"
	| "ja"
	| "ko"
	| "pt"
	| "ru"
	| "zh";

export const messagesByLocale: { [K in Locale]: Messages } = {
	de,
	en,
	es,
	fr,
	it,
	ja,
	ko,
	pt,
	ru,
	zh,
};

const supportedLocales = Object.keys(messagesByLocale) as Locale[];

export function getInitialLocale() {
	const browserLocale = navigator.language.split("-")[0];

	if ((supportedLocales as string[]).includes(browserLocale)) {
		return browserLocale as Locale;
	}

	if (browserLocale === "zh" && (supportedLocales as string[]).includes("zh")) {
		return "zh" as Locale;
	}

	return "en" as Locale;
}

export type { MessageKeys } from "./global";

export interface Messages {
	app_name: string;
	app_description: string;
	textarea_placeholder: string;
	current_url_label: string;
	copy_button: string;
	share_button: string;
	copy_success: string;
	copy_fail: string;
	share_instruction: string;
	locale_selector_label: string;
	dark_mode_label: string;
	save_button: string;
	save_success: string;
	note_loaded_from_browser: string;
	save_fail: string;
	clear_button: string;
	clear_confirm: string;
	clear_success: string;
	clear_fail: string;
	view_button: string;
	edit_button: string;
	qr_code_view_summary: string;
	qr_code_img_alt: string;
}

export interface Note {
	id: string;
	text: string;
	created: number;
	lastUpdated: number;
}

export function createNewNote(): Note {
	return {
		id: createRandomId(),
		text: "",
		created: Date.now(),
		lastUpdated: Date.now(),
	};
}

export function getInitialNote(): Note | null {
	const fragment = window.location.hash.substring(1);
	let note: Note | null = null;

	if (fragment) {
		try {
			note = JSON.parse(decodeURIComponent(fragment));
		} catch (error) {
			console.error("Error decoding URL fragment on initial load:", error);
		}
	} else {
		const savedNote = localStorage.getItem(notesAppSavedNote);

		if (savedNote) {
			const parsedSavedNote = JSON.parse(savedNote);

			if (parsedSavedNote) {
				setTimeout(() => {
					globalThis.registerToastMessage("note_loaded_from_browser");
				}, 100);

				note = JSON.parse(decodeURIComponent(savedNote));
			}
		}
	}

	return note;
}

export type Status = "viewing" | "editing";

export function createRandomId(): string {
	const length = 16;
	const characters = "0123456789abcdef";
	const charactersLength = characters.length;

	const result = Array.from({ length }, () =>
		characters.charAt(Math.floor(Math.random() * charactersLength)),
	).join("");

	return result;
}
