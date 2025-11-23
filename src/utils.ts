import type { Content, Image, Root } from "mdast";
import { remark } from "remark";
import type { Literal, Parent } from "unist";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import zh from "./locales/zh.json";

export const formatTimeAgo = (targetTime: number, currentTime: number) => {
	const seconds = Math.floor((currentTime - targetTime) / 1000);

	const units = {
		minute: 60,
		hour: 60 * 60,
		day: 60 * 60 * 24,
		month: 60 * 60 * 24 * 30,
		year: 60 * 60 * 24 * 365,
	};

	if (seconds < units.minute) {
		return "Now";
	} else if (seconds < units.hour) {
		const minutes = Math.floor(seconds / units.minute);
		return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
	} else if (seconds < units.day) {
		const hours = Math.floor(seconds / units.hour);
		return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	} else if (seconds < units.month) {
		const days = Math.floor(seconds / units.day);
		return `${days} day${days === 1 ? "" : "s"} ago`;
	} else if (seconds < units.year) {
		const months = Math.floor(seconds / units.month);
		return `${months} month${months === 1 ? "" : "s"} ago`;
	} else {
		const years = Math.floor(seconds / units.year);
		return `${years} year${years === 1 ? "" : "s"} ago`;
	}
};

export type Locale =
	| "de"
	| "en"
	| "es"
	| "fr"
	| "it"
	| "ja"
	| "ko"
	| "pt"
	| "ru"
	| "zh";

const stringResources: { [K in Locale]: StringResources } = {
	de: Object.assign({}, en, de),
	en,
	es: Object.assign({}, en, es),
	fr: Object.assign({}, en, fr),
	it: Object.assign({}, en, it),
	ja: Object.assign({}, en, ja),
	ko: Object.assign({}, en, ko),
	pt: Object.assign({}, en, pt),
	ru: Object.assign({}, en, ru),
	zh: Object.assign({}, en, zh),
};

const supportedLocales = Object.keys(stringResources) as Locale[];

const getInitialLocale = () => {
	const browserLocale = navigator.language.split("-")[0];
	if ((supportedLocales as string[]).includes(browserLocale)) {
		return browserLocale as Locale;
	}
	if (browserLocale === "zh" && (supportedLocales as string[]).includes("zh")) {
		return "zh" as Locale;
	}
	return "en" as Locale;
};

export const initialLocale = getInitialLocale();

export const getStringResources = (locale: Locale) => stringResources[locale];

export const initialStringResources = getStringResources(initialLocale);

export type StringResources = typeof en;

export type StringResourceKey = keyof StringResources;

export interface Note {
	id: string;
	text: string;
	createdAt: number | null;
	lastUpdatedAt: number | null;
}

export const createNewNote = (timestamp: number): Note => {
	return {
		id: createRandomId(),
		text: "",
		createdAt: timestamp,
		lastUpdatedAt: timestamp,
	};
};

export const createRandomId = (): string => {
	const length = 16;
	const characters = "0123456789abcdef";
	const charactersLength = characters.length;

	const result = Array.from({ length }, () =>
		characters.charAt(Math.floor(Math.random() * charactersLength)),
	).join("");

	return result;
};

export interface TextSelection {
	start: number;
	end: number;
}

export const applyAnchor = (anchor: string) => {
	const targetElement = document.getElementById(decodeURIComponent(anchor));

	if (targetElement) {
		const elementPosition =
			targetElement.getBoundingClientRect().top + window.pageYOffset;
		const offsetPosition = elementPosition;

		window.scrollTo({
			top: offsetPosition,
		});

		return true;
	}

	return false;
};

export type EditHistory = EditHistoryState[];

export interface EditHistoryState {
	text: string;
	textSelectionBefore: TextSelection | null;
	textSelectionAfter: TextSelection | null;
	createdAt: number;
}

export const getNoteTitle = (noteText: string): string | null => {
	const tree = remark().parse(noteText);

	if (!tree.children || tree.children.length === 0) {
		return null;
	}

	const firstNode = tree.children[0];

	if (firstNode.type === "heading") {
		let headingText = "";
		const headingNode = firstNode as Parent;

		headingNode.children.forEach((child) => {
			if (child.type === "text") {
				headingText += (child as Literal).value;
			}
		});

		return headingText.trim();
	}

	if (firstNode.type === "paragraph") {
		let paragraphText = "";
		const paragraphNode = firstNode as Parent;

		paragraphNode.children.forEach((child) => {
			if (child.type === "text") {
				paragraphText += (child as Literal).value;
			}
		});

		return paragraphText.trim();
	}

	return null;
};

export interface Thumbnail {
	url: string;
	alt: string;
	title: string;
}

export const getNoteThumbnail = (noteText: string): Thumbnail | null => {
	const tree: Root = remark().parse(noteText) as Root;

	let firstImage: Thumbnail | null = null;

	const findImage = (node: Content | Root): void => {
		if (firstImage) {
			return;
		}

		if (node.type === "image") {
			const imageNode = node as Image;

			firstImage = {
				url: imageNode.url,
				alt: imageNode.alt ?? "",
				title: imageNode.title ?? "",
			};

			return;
		}

		if (
			"children" in node &&
			Array.isArray(node.children) &&
			node.children.length > 0
		) {
			for (const child of node.children) {
				findImage(child as Content);

				if (firstImage) {
					return;
				}
			}
		}
	};

	findImage(tree);

	return firstImage;
};

const markdownExtensions = [".md", ".markdown", ".mdown", ".mkdn", ".mkd"];

export function isMarkdownFile(fileName: string) {
	const lastDotIndex = fileName.lastIndexOf(".");
	if (lastDotIndex === -1) {
		return false;
	}
	const extension = fileName.substring(lastDotIndex).toLowerCase();
	return markdownExtensions.includes(extension);
}

export interface IndentResult {
	text: string;
	selection: TextSelection;
}

const TAB = "\t";
const TAB_LENGTH = 1;
const SPACE_LENGTH = 4;

const getLineIndices = (
	text: string,
	start: number,
	end: number,
): { startLineIndex: number; endLineIndex: number } => {
	const lines = text.split("\n");
	let startLineIndex = -1;
	let endLineIndex = -1;
	let currentOffset = 0;

	for (let i = 0; i < lines.length; i++) {
		const lineLengthWithNewline = lines[i].length + 1;

		if (
			startLineIndex === -1 &&
			(currentOffset + lines[i].length >= start ||
				(start === currentOffset && lines[i].length > 0) ||
				(start === 0 && i === 0))
		) {
			startLineIndex = i;
		}

		if (currentOffset < end || (start === end && i === startLineIndex)) {
			endLineIndex = i;
		}

		if (currentOffset + lineLengthWithNewline > end && i >= startLineIndex) {
			break;
		}

		currentOffset += lineLengthWithNewline;
	}

	if (startLineIndex === -1) {
		startLineIndex = 0;
	}
	if (endLineIndex === -1) {
		endLineIndex = startLineIndex;
	}

	return { startLineIndex, endLineIndex };
};

export const insertTab = (
	text: string,
	start: number,
	end: number,
): IndentResult => {
	const { startLineIndex, endLineIndex } = getLineIndices(text, start, end);
	const lines = text.split("\n");

	if (startLineIndex === endLineIndex) {
		const newText = text.substring(0, start) + TAB + text.substring(end);
		const newOffset = start + TAB_LENGTH;

		return {
			text: newText,
			selection: { start: newOffset, end: newOffset },
		};
	}

	let newText = "";
	let totalAddedIndent = 0;
	let totalOffsetUntilStartLine = 0;

	lines.forEach((line, index) => {
		let processedLine = line;

		if (index < startLineIndex) {
			totalOffsetUntilStartLine += line.length + 1;
		}

		if (index >= startLineIndex && index <= endLineIndex && line.length > 0) {
			processedLine = TAB + line;
			totalAddedIndent += TAB_LENGTH;
		}

		newText += processedLine + (index < lines.length - 1 ? "\n" : "");
	});

	let newStart: number;

	if (start === totalOffsetUntilStartLine) {
		newStart = start;
	} else {
		newStart = start + TAB_LENGTH;
	}

	const newEnd = end + totalAddedIndent;

	return {
		text: newText,
		selection: { start: newStart, end: newEnd },
	};
};

export const dedentText = (
	text: string,
	start: number,
	end: number,
): IndentResult => {
	const { startLineIndex, endLineIndex } = getLineIndices(text, start, end);
	const lines = text.split("\n");
	let newText = "";
	let newStartOffsetChange = 0;
	let newEndOffsetChange = 0;

	let currentLineStartOffset = 0;

	lines.forEach((line, index) => {
		let processedLine = line;
		let removedIndent = 0;

		if (index >= startLineIndex && index <= endLineIndex) {
			if (line.startsWith(TAB)) {
				processedLine = line.substring(TAB_LENGTH);
				removedIndent = TAB_LENGTH;
			} else {
				const match = line.match(/^ +/);
				if (match) {
					removedIndent = Math.min(SPACE_LENGTH, match[0].length);
					processedLine = line.substring(removedIndent);
				}
			}

			if (removedIndent > 0) {
				if (index === startLineIndex) {
					if (
						start > currentLineStartOffset &&
						start < currentLineStartOffset + removedIndent
					) {
						newStartOffsetChange = currentLineStartOffset - start;
					} else if (start >= currentLineStartOffset + removedIndent) {
						newStartOffsetChange = -removedIndent;
					}
				}

				newEndOffsetChange -= removedIndent;
			}
		}

		newText += processedLine + (index < lines.length - 1 ? "\n" : "");

		currentLineStartOffset += processedLine.length + 1;
	});

	const newTextSelection = {
		start: Math.max(0, start + newStartOffsetChange),
		end: Math.max(0, end + newEndOffsetChange),
	};

	return {
		text: newText,
		selection: newTextSelection,
	};
};
