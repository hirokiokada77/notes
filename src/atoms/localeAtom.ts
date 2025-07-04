import { atomWithStorage } from "jotai/utils";
import { messagesByLocale } from "./messagesAtom";

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

const supportedLocales = Object.keys(messagesByLocale) as Locale[];

const getinitialLocale = () => {
	const browserLocale = navigator.language.split("-")[0];

	if ((supportedLocales as string[]).includes(browserLocale)) {
		return browserLocale as Locale;
	}

	if (browserLocale === "zh" && (supportedLocales as string[]).includes("zh")) {
		return "zh" as Locale;
	}

	return "en" as Locale;
};

export const localeAtom = atomWithStorage<Locale>("locale", getinitialLocale());
