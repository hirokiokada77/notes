import { type ReactNode, useEffect, useRef, useState } from "react";
import { ToastContext, type ToastContextType } from "./ToastContext";

export interface ToastProviderProps {
	children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
	const displayDuration = 4000;
	const animationDuration = 200;

	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [showToast, setShowToast] = useState(false);
	const [isHiding, setHiding] = useState(false);

	const toastDisplayTimeoutRef = useRef<number | null>(null);
	const toastHideTimeoutRef = useRef<number | null>(null);

	const startToastDisplayTimer = () => {
		if (toastDisplayTimeoutRef.current) {
			clearTimeout(toastDisplayTimeoutRef.current);
		}

		toastDisplayTimeoutRef.current = window.setTimeout(() => {
			setHiding(true);
			if (toastHideTimeoutRef.current) {
				clearTimeout(toastHideTimeoutRef.current);
			}
			toastHideTimeoutRef.current = window.setTimeout(() => {
				setShowToast(false);
			}, animationDuration);
		}, displayDuration);
	};

	const showAppToast = (message: string) => {
		if (showToast) {
			setHiding(true);
			if (toastDisplayTimeoutRef.current) {
				clearTimeout(toastDisplayTimeoutRef.current);
			}
			if (toastHideTimeoutRef.current) {
				clearTimeout(toastHideTimeoutRef.current);
			}

			toastHideTimeoutRef.current = window.setTimeout(() => {
				setToastMessage(message);
				setShowToast(true);
				setHiding(false);
				startToastDisplayTimer();
			}, animationDuration);
		} else {
			setToastMessage(message);
			setShowToast(true);
			setHiding(false);
			startToastDisplayTimer();
		}
	};

	useEffect(() => {
		return () => {
			if (toastDisplayTimeoutRef.current) {
				clearTimeout(toastDisplayTimeoutRef.current);
			}
			if (toastHideTimeoutRef.current) {
				clearTimeout(toastHideTimeoutRef.current);
			}
		};
	}, []);

	const contextValue: ToastContextType = {
		toastMessage,
		showToast,
		isHiding,
		showAppToast,
	};

	return (
		<ToastContext.Provider value={contextValue}>
			{children}
		</ToastContext.Provider>
	);
}
