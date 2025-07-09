import { atomWithStorage } from "jotai/utils";
import { notesAppTheme } from "../constants";

export const themeAtom = atomWithStorage<"light" | "dark">(
	notesAppTheme,
	window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
);
