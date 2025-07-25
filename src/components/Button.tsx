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

export function Button(props: ButtonProps) {
	return (
		<button
			className={["button", `${props.level}-button`].join(" ")}
			disabled={!!props.disabled}
			type="button"
			onClick={props.onClick}
			hidden={props.hidden}
			aria-label={props.accessibilityLabel ?? undefined}
		>
			{props.children}
		</button>
	);
}
