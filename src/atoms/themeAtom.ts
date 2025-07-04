import { atomWithStorage } from "jotai/utils";

export const themeAtom = atomWithStorage<"light" | "dark">(
	"notesAppTheme",
	window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
);
