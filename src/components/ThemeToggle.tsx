import { useId } from "react";
import { useLocale } from "../contexts/LocaleContext";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	const { messages } = useLocale();

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	const themeToggleContainerId = useId();

	return (
		<div className="theme-toggle">
			<label className="theme-switch" htmlFor={themeToggleContainerId}>
				<input
					id={themeToggleContainerId}
					type="checkbox"
					checked={theme === "dark"}
					onChange={toggleTheme}
					role="switch"
					aria-checked={theme === "dark"}
					aria-label={messages.dark_mode_label}
				/>

				<span className="slider round" aria-hidden="true" />
			</label>

			<span className="theme-text" aria-hidden="true">
				{messages.dark_mode_label}
			</span>
		</div>
	);
}
