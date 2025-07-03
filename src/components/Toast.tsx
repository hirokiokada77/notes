import { useToast } from "../contexts/ToastContext";
import "./Toast.css";

export function Toast() {
	const { toastMessage, showToast, isHiding } = useToast();

	return (
		// biome-ignore lint/a11y/useSemanticElements: false positive
		<div
			className={[
				"toast",
				showToast && !isHiding ? "show" : "",
				isHiding ? "hide" : "",
			]
				.filter((className) => className.length > 0)
				.join(" ")}
			role="status"
			aria-live={showToast && !isHiding ? "polite" : "off"}
			aria-hidden={showToast ? "false" : "true"}
		>
			{toastMessage}
		</div>
	);
}
