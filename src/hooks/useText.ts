import { useEffect, useState } from "react";
import { useLocale } from "../contexts/LocaleContext";
import { useToast } from "../contexts/ToastContext";

const LOCAL_STORAGE_KEY = "notesAppText";

export function useText() {
	const { messages } = useLocale();

	const { showAppToast } = useToast();

	const initialTextFromHashOrStorage = () => {
		const fragment = window.location.hash.substring(1);
		if (fragment) {
			try {
				return decodeURIComponent(fragment);
			} catch (error) {
				console.error("Error decoding URL fragment on initial load:", error);
				return "";
			}
		}

		const savedText = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (savedText) {
			setTimeout(() => {
				showAppToast(messages.note_loaded_from_browser);
			}, 10);
			return savedText;
		}

		return "";
	};

	const [text, setText] = useState<string>(initialTextFromHashOrStorage);

	useEffect(() => {
		const updateTextFromHashChange = () => {
			const fragment = window.location.hash.substring(1);
			try {
				setText(decodeURIComponent(fragment || ""));
			} catch (error) {
				console.error("Error decoding URL fragment on hashchange:", error);
				setText("");
			}
		};

		window.addEventListener("hashchange", updateTextFromHashChange);
		return () =>
			window.removeEventListener("hashchange", updateTextFromHashChange);
	}, []);

	useEffect(() => {
		const encodedText = encodeURIComponent(text);
		const newHash = encodedText ? `#${encodedText}` : "";
		if (window.location.hash !== newHash) {
			window.location.hash = newHash;
		}
	}, [text]);

	const saveTextToBrowser = () => {
		try {
			localStorage.setItem(LOCAL_STORAGE_KEY, text ?? "");
			showAppToast(messages.save_success);
		} catch (err) {
			console.error("Error saving to local storage:", err);
			showAppToast(messages.save_fail);
		}
	};

	const clearText = () => {
		if (window.confirm(messages.clear_confirm)) {
			try {
				setText("");
				localStorage.removeItem(LOCAL_STORAGE_KEY);
				showAppToast(messages.clear_success);
			} catch {
				showAppToast(messages.clear_fail);
			}
		}
	};

	return { text, setText, saveTextToBrowser, clearText };
}
