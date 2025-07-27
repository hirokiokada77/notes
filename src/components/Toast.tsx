import "./Toast.css";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { toastTextAtom } from "../atoms";

export function Toast() {
	const toastText = useAtomValue(toastTextAtom);
	const [actualToastText, setActualToastText] = useState<string | null>(null);
	const [showToast, setShowToast] = useState(false);
	const [toastIsHiding, setToastIsHiding] = useState(false);
	const displayDuration = 4000;
	const animationDuration = 100;
	const toastDisplayTimeoutRef = useRef<number | null>(null);
	const toastHideTimeoutRef = useRef<number | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: expected behavior
	useEffect(() => {
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

		if (toastText) {
			if (showToast) {
				setToastIsHiding(true);
				if (toastDisplayTimeoutRef.current) {
					clearTimeout(toastDisplayTimeoutRef.current);
				}
				if (toastHideTimeoutRef.current) {
					clearTimeout(toastHideTimeoutRef.current);
				}
				toastHideTimeoutRef.current = window.setTimeout(() => {
					setActualToastText(toastText.content);
					setShowToast(true);
					setToastIsHiding(false);
					startToastDisplayTimer();
				}, animationDuration);
			} else {
				setActualToastText(toastText.content);
				setShowToast(true);
				setToastIsHiding(false);
				startToastDisplayTimer();
			}
		}
	}, [toastText]);

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
			<div className="toast-container">{actualToastText}</div>
		</div>
	);
}
