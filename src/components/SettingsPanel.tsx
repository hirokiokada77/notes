import "./SettingsPanel.css";
import { LocaleSelector } from "./LocaleSelector";
import { ThemeToggle } from "./ThemeToggle";

export function SettingsPanel() {
	return (
		<div className="main-section">
			<div className="settings-panel">
				<LocaleSelector />

				<ThemeToggle />
			</div>
		</div>
	);
}
