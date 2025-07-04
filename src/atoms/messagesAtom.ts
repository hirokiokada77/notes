import { atom } from "jotai";
import de from "../locales/de.json";
import en from "../locales/en.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";
import it from "../locales/it.json";
import ja from "../locales/ja.json";
import ko from "../locales/ko.json";
import pt from "../locales/pt.json";
import ru from "../locales/ru.json";
import zh from "../locales/zh.json";
import { type Locale, localeAtom } from "./localeAtom";

export type MessageKeys =
	| "app_name"
	| "app_description"
	| "textarea_placeholder"
	| "current_url_label"
	| "copy_button"
	| "copy_success"
	| "copy_fail"
	| "share_instruction"
	| "locale_selector_label"
	| "dark_mode_label"
	| "save_button"
	| "save_success"
	| "note_loaded_from_browser"
	| "save_fail"
	| "clear_button"
	| "clear_confirm"
	| "clear_success"
	| "clear_fail"
	| "view_button"
	| "edit_button";

export interface Messages {
	app_name: string;
	app_description: string;
	textarea_placeholder: string;
	current_url_label: string;
	copy_button: string;
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
}

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

export const messagesAtom = atom((get) => {
	const locale = get(localeAtom);

	return messagesByLocale[locale];
});
