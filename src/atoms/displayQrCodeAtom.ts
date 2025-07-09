import { atomWithStorage } from "jotai/utils";
import { notesAppDisplayQrCode } from "../constants";

export const displayQrCodeAtom = atomWithStorage(notesAppDisplayQrCode, false);
