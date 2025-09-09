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
