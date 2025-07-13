import "./Header.css";
import { useAtomValue } from "jotai";
import { messagesAtom } from "../atoms";

export function Header() {
	const messages = useAtomValue(messagesAtom);

	return (
		<div className="main-section">
			<h1 className="app-name">{messages.app_name}</h1>
		</div>
	);
}
