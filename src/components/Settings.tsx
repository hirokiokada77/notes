import "./Settings.css";
import { LocaleSelector } from "./LocaleSelector";
import { ThemeToggle } from "./ThemeToggle";

export function Settings() {
	return (
		<div className="settings">
			<LocaleSelector />

			<ThemeToggle />
		</div>
	);
}
