import { useEffect, useState } from "react";
import { useLocale } from "../contexts/LocaleContext";
import { useToast } from "../contexts/ToastContext";

export function useUrl() {
	const [url, setUrl] = useState(window.location.href);

	const [hash, setHash] = useState(window.location.hash);

	const { showAppToast } = useToast();

	const { messages } = useLocale();

	const copyUrlToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(url);
			showAppToast(messages.copy_success);
		} catch (err) {
			console.error("Error copying to clipboard:", err);
			showAppToast(messages.copy_fail);
		}
	};

	useEffect(() => {
		const listener = () => {
			setUrl(window.location.href);

			setHash(window.location.hash);
		};

		window.addEventListener("hashchange", listener);
		return () => window.removeEventListener("hashchange", listener);
	}, []);

	return { url, setUrl, hash, copyUrlToClipboard };
}
