import "katex/dist/katex.css";
import { useAtomValue } from "jotai";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { noteAtom } from "../atoms";

export function NotePreview() {
	const note = useAtomValue(noteAtom);

	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm, remarkMath]}
			// Run rehype-sanitize first, and then run rehype-katex. If
			// done in reverse, the KaTeX rendering will be improperly
			// sanitized.
			rehypePlugins={[rehypeSanitize, rehypeKatex, rehypeRaw, rehypeSlug]}
			components={{
				code({ node, className, children, ...props }) {
					const match = /language-(\w+)/.exec(className ?? "");

					if (match) {
						return (
							<SyntaxHighlighter
								className="note-preview-code-block"
								// @ts-ignore
								style={dracula}
								language={match[1]}
								PreTag="div"
								{...props}
							>
								{children ? String(children) : ""}
							</SyntaxHighlighter>
						);
					}

					return (
						<code className={className} {...props}>
							{children}
						</code>
					);
				},
			}}
		>
			{note?.text}
		</ReactMarkdown>
	);
}
