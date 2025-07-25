import "./Home.css";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { noteAtom } from "../atoms";
import { InfoBox } from "../components/InfoBox";
import { InputArea } from "../components/InputArea";
import { Tab } from "../components/Tab";
import type { Note } from "../utils";

export function Home() {
	const setNote = useSetAtom(noteAtom);

	// biome-ignore lint/correctness/useExhaustiveDependencies: initialization
	useEffect(() => {
		const listener = () => {
			const params = new URLSearchParams(location.hash.substring(1));
			const id = params.get("id");
			const text = params.get("text");
			const created = params.get("created");
			const lastUpdated = params.get("lastUpdated");

			if (id !== null && text !== null) {
				const note: Note = {
					id,
					text,
					created: created !== null ? Number(created) : null,
					lastUpdated: lastUpdated !== null ? Number(lastUpdated) : null,
				};

				setNote(note);

				location.hash = "";
			}
		};

		listener();

		window.addEventListener("hashchange", listener);

		return () => {
			window.removeEventListener("hashchange", listener);
		};
	}, []);

	return (
		<div className="home">
			<Tab />

			<InputArea />

			<div className="home-misc">
				<div className="home-section">
					<InfoBox />
				</div>
			</div>
		</div>
	);
}
