import "./Switch.css";
import { type ChangeEventHandler, useId } from "react";

export interface SwitchProps {
	checked: boolean;
	label: string;
	onChange: ChangeEventHandler<HTMLInputElement>;
}

export function Switch({ checked, label, onChange }: SwitchProps) {
	const inputId = useId();

	return (
		<div className="toggle">
			<label className="toggle-container" htmlFor={inputId}>
				<input
					id={inputId}
					type="checkbox"
					checked={checked}
					onChange={onChange}
					role="switch"
					aria-checked={checked}
					aria-label={label}
				/>

				<span className="toggle-slider" aria-hidden="true" />
			</label>
		</div>
	);
}
