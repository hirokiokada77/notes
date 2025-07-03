import { useEffect } from "react";
import { ButtonGroup } from "./components/ButtonGroup";
import { Header } from "./components/Header";
import { InfoBox } from "./components/InfoBox";
import { InputArea } from "./components/InputArea";
import { SettingsPanel } from "./components/SettingsPanel";
import { Toast } from "./components/Toast";
import { useLocale } from "./contexts/LocaleContext";
import { useTheme } from "./contexts/ThemeContext";
import { useText } from "./hooks/useText";

export function App() {
	const { locale, messages } = useLocale();

	const { theme } = useTheme();

	const { text } = useText();

	useEffect(() => {
		const firstLine = (text ?? "").split("\n")[0].trim();
		const maxTitleLength = 140;
		let newTitle = messages.app_name;

		if (firstLine) {
			const truncatedTitle =
				firstLine.length > maxTitleLength
					? `${firstLine.substring(0, maxTitleLength)}...`
					: firstLine;
			newTitle = `${messages.app_name} – ${truncatedTitle}`;
		}
		document.title = newTitle;
	}, [text, messages.app_name]);

	useEffect(() => {
		const description = document.querySelector("meta[name=description]");

		description?.setAttribute("content", messages.app_description);
	}, [messages.app_description]);

	useEffect(() => {
		const html = document.querySelector("html");

		html?.setAttribute("lang", locale);
	}, [locale]);

	useEffect(() => {
		document.body.classList.remove("dark-mode", "light-mode");
		document.body.classList.add(theme === "dark" ? "dark-mode" : "light-mode");
	}, [theme]);

	return (
		<div className="main">
			<Toast />

			<Header />

			<InputArea />

			<ButtonGroup />

			<InfoBox />

			<SettingsPanel />
		</div>
	);
}
