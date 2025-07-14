export type MessageKeys =
	| "app_name"
	| "app_description"
	| "textarea_placeholder"
	| "current_url_label"
	| "copy_button"
	| "share_button"
	| "copy_success"
	| "copy_fail"
	| "share_instruction"
	| "locale_selector_label"
	| "dark_mode_label"
	| "save_button"
	| "save_success"
	| "note_loaded_from_browser"
	| "save_fail"
	| "clear_button"
	| "clear_confirm"
	| "clear_success"
	| "clear_fail"
	| "view_button"
	| "edit_button"
	| "qr_code_view_summary"
	| "qr_code_img_alt";

declare global {
	function registerToastMessage(newToastMessageKey: MessageKeys): void;
}
