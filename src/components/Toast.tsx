import "./Toast.css";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAllStringResources } from "../localeSlice";
import { clearToastText, selectToastText } from "../toastTextSlice";
import type { StringResourceKey } from "../utils";

export function Toast() {
	const dispatch = useDispatch();
	const toastText = useSelector(selectToastText);
	const [actualToastText, setActualToastText] =
		useState<StringResourceKey | null>(null);
	const stringResources = useSelector(selectAllStringResources);
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
				dispatch(clearToastText(Date.now()));
			}, displayDuration);
		};

		if (toastText.content) {
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
				showToast && !toastIsHiding ? "show" : [],
				toastIsHiding ? "hide" : [],
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
}
