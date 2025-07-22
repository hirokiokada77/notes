export type MessageKeys =
	| "appName"
	| "appDescription"
	| "textareaPlaceholder"
	| "currentUrlLabel"
	| "copyButton"
	| "shareButton"
	| "copySuccess"
	| "copyFail"
	| "shareInstruction"
	| "localeSelectorLabel"
	| "darkModeLabel"
	| "saveButton"
	| "saveSuccess"
	| "noteLoadedFromBrowser"
	| "saveFail"
	| "clearButton"
	| "clearConfirm"
	| "clearSuccess"
	| "clearFail"
	| "viewButton"
	| "editButton"
	| "qrCodeViewSummary"
	| "qrCodeImgAlt";

declare global {
	function registerToastMessage(newToastMessageKey: MessageKeys): void;
}
