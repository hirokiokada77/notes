interface Window {
	registerToastMessage: ((newToastMessageKey: MessageKeys) => void) | null;
	showToast: boolean;
	isHiding: boolean;
}
