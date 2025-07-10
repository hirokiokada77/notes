import "katex/dist/katex.css";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { PluggableList } from "unified";
import { noteAtom } from "../atoms";

const rehypeKatex = import("rehype-katex");

export function NotePreview() {
	const note = useAtomValue(noteAtom);

	const [plugins, setPlugins] = useState<{
		rehypePlugins: PluggableList;
	}>({ rehypePlugins: [] });

	useEffect(() => {
		(async () => {
			setPlugins({
				rehypePlugins: [(await rehypeKatex).default],
			});
		})();
	}, []);

	return (
		<ReactMarkdown
			disallowedElements={["img"]}
			remarkPlugins={[remarkGfm, remarkMath]}
			{...plugins}
		>
			{note.text}
		</ReactMarkdown>
	);
}
