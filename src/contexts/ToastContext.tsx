import { createContext, useContext } from "react";

export interface ToastContextType {
	toastMessage: string | null;
	showToast: boolean;
	isHiding: boolean;
	showAppToast: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
	undefined,
);

export function useToast(): ToastContextType {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}
