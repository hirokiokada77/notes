import { atom } from "jotai";

export type Status = "viewing" | "editing";

export const statusAtom = atom<Status>("viewing");
