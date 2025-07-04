import { atomWithStorage } from "jotai/utils";

export const displayQrCodeAtom = atomWithStorage(
	"notesAppDisplayQrCode",
	false,
);
