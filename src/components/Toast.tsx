import "./Toast.css";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { type MessageKeys, messagesAtom } from "../atoms/messagesAtom";
import {
	showToastAtom,
	toastIsHidingAtom,
	toastMessageAtom,
} from "../atoms/toastAtom";

export function Toast() {
	const messages = useAtomValue(messagesAtom);

	const [toastMessage, setToastMessage] = useAtom(toastMessageAtom);

	const [showToast, setShowToast] = useAtom(showToastAtom);

	const [toastIsHiding, setToastIsHiding] = useAtom(toastIsHidingAtom);

	const displayDuration = 4000;
	const animationDuration = 200;

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

	window.registerToastMessage = (newToastMessageKey: MessageKeys) => {
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
				showToast && !toastIsHiding ? "show" : "",
				toastIsHiding ? "hide" : "",
			]
				.filter((className) => className.length > 0)
				.join(" ")}
			role="status"
			aria-live={showToast && !toastIsHiding ? "polite" : "off"}
			aria-hidden={showToast ? "false" : "true"}
		>
			{toastMessage}
		</div>
	);
}
