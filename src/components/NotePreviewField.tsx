import "./NotePreviewField.css";
import "katex/dist/katex.css";
import type { MouseEvent } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { useAppSelector } from "../hooks";
import { selectActiveNoteText } from "../notesSlice";
import { applyAnchor } from "../utils";

export const NotePreviewField = () => {
	const activeNoteText = useAppSelector(selectActiveNoteText);

	return (
		<div className="note-preview-field" aria-live="polite">
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[
					[rehypeSanitize, { clobberPrefix: "" }],
					rehypeKatex,
					rehypeRaw,
					rehypeSlug,
				]}
				components={{
					a({ node, children, ...props }) {
						const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
							const href = event.currentTarget.getAttribute("href");
							if (href) {
								event.preventDefault();
								if (href.startsWith("#")) {
									applyAnchor(href.substring(1));
								} else {
									window.open(href, "_blank", "noopener,noreferrer");
								}
							}
						};

						return (
							<a {...props} onClick={handleClick}>
								{children}
							</a>
						);
					},
					code({ node, className, children, ...props }) {
						const match = /language-(\w+)/.exec(className ?? "");

						if (match) {
							return (
								<SyntaxHighlighter
									className="note-preview-field-code-block"
									// @ts-expect-error: temporary workaround
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
				{activeNoteText}
			</ReactMarkdown>
		</div>
	);
};
