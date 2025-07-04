import { atom } from "jotai";

export const urlAtom = atom(new URL(location.href));
