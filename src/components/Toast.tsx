import "./Toast.css";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectStringResources } from "../stringResourcesSlice";
import { clearToastText, selectToastText } from "../toastTextSlice";
import type { StringResourceKey } from "../utils";

export const Toast = () => {
	const dispatch = useAppDispatch();
	const toastText = useAppSelector(selectToastText);
	const [actualToastText, setActualToastText] =
		useState<StringResourceKey | null>(null);
	const stringResources = useAppSelector(selectStringResources);
	const actualToastTextContent = actualToastText
		? stringResources[actualToastText]
		: null;
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
				dispatch(clearToastText());
			}, displayDuration);
		};

		if (toastText.resourceStringKey) {
			if (showToast) {
				setToastIsHiding(true);
				if (toastDisplayTimeoutRef.current) {
					clearTimeout(toastDisplayTimeoutRef.current);
				}
				if (toastHideTimeoutRef.current) {
					clearTimeout(toastHideTimeoutRef.current);
				}
				toastHideTimeoutRef.current = window.setTimeout(() => {
					setActualToastText(toastText.resourceStringKey);
					setShowToast(true);
					setToastIsHiding(false);
					startToastDisplayTimer();
				}, animationDuration);
			} else {
				setActualToastText(toastText.resourceStringKey);
				setShowToast(true);
				setToastIsHiding(false);
				startToastDisplayTimer();
			}
		} else {
			setToastIsHiding(true);
			if (toastHideTimeoutRef.current) {
				clearTimeout(toastHideTimeoutRef.current);
			}
			toastHideTimeoutRef.current = window.setTimeout(() => {
				setShowToast(false);
			}, animationDuration);
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
		<div
			className={[
				"toast",
				showToast && !toastIsHiding ? "toast--visible" : [],
				toastIsHiding ? "toast--hidden" : [],
			]
				.flat()
				.join(" ")}
			role="status"
			aria-live={showToast && !toastIsHiding ? "polite" : "off"}
			aria-hidden={showToast ? "false" : "true"}
		>
			<div className="toast-container">{actualToastTextContent}</div>
		</div>
	);
};
