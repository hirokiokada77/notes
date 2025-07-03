import "./Header.css";

import { useLocale } from "../contexts/LocaleContext";

export function Header() {
	const { messages } = useLocale();

	return (
		<div className="main-section">
			<h1 className="app-name">{messages.app_name}</h1>

			<p className="app-description">{messages.app_description}</p>
		</div>
	);
}
