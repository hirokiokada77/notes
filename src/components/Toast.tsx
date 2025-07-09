import "./Toast.css";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { type MessageKeys, messagesAtom } from "../atoms/messagesAtom";

export function Toast() {
	const messages = useAtomValue(messagesAtom);

	const [toastMessage, setToastMessage] = useState<string | null>(null);

	const [showToast, setShowToast] = useState(false);

	const [toastIsHiding, setToastIsHiding] = useState(false);

	const displayDuration = 4000;
	const animationDuration = 100;

	const toastDisplayTimeoutRef = useRef<number | null>(null);
	const toastHideTimeoutRef = useRef<number | null>(null);

	const startToastDisplayTimer = () => {
		if (toastDisplayTimeoutRef.current) {
			clearTimeout(toastDisplayTimeoutRef.current);
		}

		toastDisplayTimeoutRef.current = window.setTimeout(() => {
			setToastIsHiding(true);

			if (toastHideTimeoutRef.current) {
				clearTimeout(toastHideTimeoutRef.current);
			}

			toastHideTimeoutRef.current = window.setTimeout(() => {
				setShowToast(false);
			}, animationDuration);
		}, displayDuration);
	};

	globalThis.registerToastMessage = (newToastMessageKey: MessageKeys) => {
		if (showToast) {
			setToastIsHiding(true);

			if (toastDisplayTimeoutRef.current) {
				clearTimeout(toastDisplayTimeoutRef.current);
			}

			if (toastHideTimeoutRef.current) {
				clearTimeout(toastHideTimeoutRef.current);
			}

			toastHideTimeoutRef.current = window.setTimeout(() => {
				setToastMessage(messages[newToastMessageKey]);

				setShowToast(true);

				setToastIsHiding(false);

				startToastDisplayTimer();
			}, animationDuration);
		} else {
			setToastMessage(messages[newToastMessageKey]);

			setShowToast(true);

			setToastIsHiding(false);

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

	return (
		// biome-ignore lint/a11y/useSemanticElements: false positive
		<div
			className={[
				"toast",
				showToast && !toastIsHiding ? "show" : [],
				toastIsHiding ? "hide" : [],
			]
				.flat()
				.join(" ")}
			role="status"
			aria-live={showToast && !toastIsHiding ? "polite" : "off"}
			aria-hidden={showToast ? "false" : "true"}
		>
			{toastMessage}
		</div>
	);
}
