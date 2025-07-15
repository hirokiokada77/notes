import "./Button.css";
import type { ReactNode } from "react";

export interface ButtonProps {
	children: ReactNode;
	disabled?: boolean | null | undefined;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	level: "primary" | "secondary";
}

export function Button(props: ButtonProps) {
	return (
		<button
			aria-label={props.children?.toString()}
			className={["button", `${props.level}-button`].join(" ")}
			disabled={!!props.disabled}
			type="button"
			onClick={props.onClick}
		>
			{props.children}
		</button>
	);
}
