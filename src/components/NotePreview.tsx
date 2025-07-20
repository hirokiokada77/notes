import "katex/dist/katex.css";
import { useAtomValue } from "jotai";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { noteAtom } from "../atoms";

export function NotePreview() {
	const note = useAtomValue(noteAtom);

	return (
		<ReactMarkdown
			disallowedElements={["img"]}
			remarkPlugins={[remarkGfm, remarkMath]}
			rehypePlugins={[rehypeKatex, rehypeSlug]}
		>
			{note?.text}
		</ReactMarkdown>
	);
}
