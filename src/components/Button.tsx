import "./Button.css";
import type { ReactNode } from "react";

export interface ButtonProps {
	children: ReactNode;
	disabled?: boolean | null | undefined;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	level: "primary" | "secondary" | "in-text";
	hidden?: boolean;
	accessibilityLabel?: string;
}

export const Button = (props: ButtonProps) => {
	return (
		<button
			className={["button", `button-${props.level}`].join(" ")}
			disabled={Boolean(props.disabled)}
			type="button"
			onClick={props.onClick}
			hidden={props.hidden}
			aria-label={props.accessibilityLabel ?? undefined}
		>
			{props.children}
		</button>
	);
};
