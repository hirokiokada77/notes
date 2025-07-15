import { useAtom, useAtomValue } from "jotai";
import { messagesAtom, themeAtom } from "../atoms";
import { Switch } from "./Switch";

export function ThemeToggle() {
	const [theme, setTheme] = useAtom(themeAtom);

	const messages = useAtomValue(messagesAtom);

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	return (
		<div className="theme-toggle">
			<Switch
				label={messages.dark_mode_label}
				onChange={toggleTheme}
				checked={theme === "dark"}
			/>

			<span className="theme-text" aria-hidden="true">
				{messages.dark_mode_label}
			</span>
		</div>
	);
}
