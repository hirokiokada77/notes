import { atom } from "jotai";
import QRCode from "qrcode";
import { urlAtom } from "./urlAtom";

export const qrCodeAtom = atom(async (get) => {
	const url = get(urlAtom);

	try {
		const dataUrl = await QRCode.toDataURL(url.toString(), {
			errorCorrectionLevel: "low",
		});

		return dataUrl;
	} catch {
		// The URL is too long to be represented by a single QR code
		// (see
		// https://en.wikipedia.org/wiki/QR_code#Information_capacity).

		return null;
	}
});
