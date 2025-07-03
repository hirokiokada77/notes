import { type ReactNode, useEffect, useState } from "react";
import {
	LOCALE_STORAGE_KEY,
	type Locale,
	LocaleContext,
	type Messages,
	messagesByLocale,
	supportedLocales,
} from "./LocaleContext";

export interface LocaleProviderProps {
	children: ReactNode;
}

export const LocaleProvider = ({ children }: LocaleProviderProps) => {
	const initialLocale = (() => {
		const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
		if (savedLocale && (supportedLocales as string[]).includes(savedLocale)) {
			return savedLocale as Locale;
		}

		const browserLocale = navigator.language.split("-")[0];
		if ((supportedLocales as string[]).includes(browserLocale)) {
			return browserLocale as Locale;
		}
		if (
			browserLocale === "zh" &&
			(supportedLocales as string[]).includes("zh")
		) {
			return "zh" as Locale;
		}
		return "en" as Locale;
	})();

	const [locale, setLocale] = useState<Locale>(initialLocale);
	const [messages, setMessages] = useState<Messages>(messagesByLocale[locale]);

	useEffect(() => {
		setMessages(messagesByLocale[locale]);
		localStorage.setItem(LOCALE_STORAGE_KEY, locale);
	}, [locale]);

	const changeLocale = (newLocale: Locale) => {
		setLocale(newLocale);
	};

	return (
		<LocaleContext.Provider value={{ locale, messages, changeLocale }}>
			{children}
		</LocaleContext.Provider>
	);
};
