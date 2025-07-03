import { createContext, useContext } from "react";

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

export const LOCALE_STORAGE_KEY = "notesAppLocale";

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

export const supportedLocales = Object.keys(messagesByLocale) as Locale[];

export interface LocaleContextType {
	locale: Locale;
	messages: Messages;
	changeLocale: (newLocale: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextType | undefined>(
	undefined,
);

export const useLocale = () => {
	const context = useContext(LocaleContext);
	if (context === undefined) {
		throw new Error("useLocale must be used within a LocaleProvider");
	}
	return context;
};
