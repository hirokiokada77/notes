import { type ChangeEvent, useId } from "react";
import { type Locale, useLocale } from "../contexts/LocaleContext";

export function LocaleSelector() {
	const { locale, messages, changeLocale } = useLocale();

	const handleLocaleChange = (event: ChangeEvent<HTMLSelectElement>) => {
		changeLocale(event.target.value as Locale);
	};

	const localeSelectorContainerId = useId();

	return (
		<div className="locale-selector">
			<label htmlFor={localeSelectorContainerId}>
				{messages.locale_selector_label}
			</label>

			<select
				id={localeSelectorContainerId}
				onChange={handleLocaleChange}
				value={locale}
				aria-label={messages.locale_selector_label}
			>
				<option value="de" lang="de">
					Deutsch
				</option>

				<option value="en" lang="en">
					English
				</option>

				<option value="es" lang="es">
					Español
				</option>

				<option value="fr" lang="fr">
					Français
				</option>

				<option value="it" lang="it">
					Italiano
				</option>

				<option value="ja" lang="ja">
					日本語
				</option>

				<option value="ko" lang="ko">
					한국어
				</option>

				<option value="pt" lang="pt">
					Português
				</option>

				<option value="ru" lang="ru">
					Русский
				</option>

				<option value="zh" lang="zh">
					中文
				</option>
			</select>
		</div>
	);
}
