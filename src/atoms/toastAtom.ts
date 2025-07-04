import { atom } from "jotai";

export const toastMessageAtom = atom<string | null>(null);

export const showToastAtom = atom(false);

export const toastIsHidingAtom = atom(false);
