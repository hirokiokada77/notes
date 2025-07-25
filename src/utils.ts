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

const prettier = import("prettier");
const prettierPluginMarkdown = import("prettier/plugins/markdown");

export async function formatNoteText(noteText: string) {
	return await (await prettier).format(noteText, {
		parser: "markdown",
		plugins: [(await prettierPluginMarkdown).default],
	});
}

export async function formatNoteTextWithCursorResult(
	noteText: string,
	cursorOffset: number,
) {
	return await (await prettier).formatWithCursor(noteText, {
		parser: "markdown",
		plugins: [(await prettierPluginMarkdown).default],
		cursorOffset,
	});
}

export function formatTimeAgo(targetTime: number, currentTime: number) {
	const seconds = Math.floor((currentTime - targetTime) / 1000);

	const MINUTE = 60;
	const HOUR = MINUTE * 60;
	const DAY = HOUR * 24;
	const MONTH = DAY * 30;
	const YEAR = DAY * 365;

	if (seconds < MINUTE) {
		return "Now";
	} else if (seconds < HOUR) {
		const minutes = Math.floor(seconds / MINUTE);
		return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
	} else if (seconds < DAY) {
		const hours = Math.floor(seconds / HOUR);
		return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	} else if (seconds < MONTH) {
		const days = Math.floor(seconds / DAY);
		return `${days} day${days === 1 ? "" : "s"} ago`;
	} else if (seconds < YEAR) {
		const months = Math.floor(seconds / MONTH);
		return `${months} month${months === 1 ? "" : "s"} ago`;
	} else {
		const years = Math.floor(seconds / YEAR);
		return `${years} year${years === 1 ? "" : "s"} ago`;
	}
}

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

export const messagesByLocale: { [K in Locale]: Messages } = {
	de,
	en,
	es,
	fr,
	it,
	ja,
	ko,
	pt,
	ru,
	zh,
};

const supportedLocales = Object.keys(messagesByLocale) as Locale[];

export function getInitialLocale() {
	const browserLocale = navigator.language.split("-")[0];

	if ((supportedLocales as string[]).includes(browserLocale)) {
		return browserLocale as Locale;
	}

	if (browserLocale === "zh" && (supportedLocales as string[]).includes("zh")) {
		return "zh" as Locale;
	}

	return "en" as Locale;
}

export type { MessageKeys } from "./global";

export interface Messages {
	appName: string;
	appDescription: string;
	textareaPlaceholder: string;
	currentUrlLabel: string;
	copyButton: string;
	shareButton: string;
	copySuccess: string;
	copyFail: string;
	shareInstruction: string;
	localeSelectorLabel: string;
	darkModeLabel: string;
	saveButton: string;
	saveSuccess: string;
	noteLoadedFromBrowser: string;
	saveFail: string;
	clearButton: string;
	clearConfirm: string;
	clearSuccess: string;
	clearFail: string;
	viewButton: string;
	editButton: string;
	qrCodeViewSummary: string;
	qrCodeImgAlt: string;
}

export interface Note {
	id: string;
	text: string;
	created: number | null;
	lastUpdated: number | null;
}

export function createNewNote(): Note {
	return {
		id: createRandomId(),
		text: "",
		created: Date.now(),
		lastUpdated: Date.now(),
	};
}

export type Status = "viewing" | "editing";

export function createRandomId(): string {
	const length = 16;
	const characters = "0123456789abcdef";
	const charactersLength = characters.length;

	const result = Array.from({ length }, () =>
		characters.charAt(Math.floor(Math.random() * charactersLength)),
	).join("");

	return result;
}

export interface TextSelection {
	start: number;
	end: number;
}

export function updateAnchor(anchor: string) {
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
}

export interface EditHistoryEntry {
	noteText: string;
	textSelection: TextSelection | null;
	created: number;
}

export function getFirstHeadingOrParagraphText(
	noteText: string,
): string | null {
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
}

export interface ExtractedImage {
	url: string;
	alt: string;
	title: string;
}

export function getFirstImage(noteText: string): ExtractedImage | null {
	const tree: Root = remark().parse(noteText) as Root;

	let firstImage: ExtractedImage | null = null;

	function findImage(node: Content | Root): void {
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
	}

	findImage(tree);

	return firstImage;
}
