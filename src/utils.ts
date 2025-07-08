export function formatTimeAgo(unixMilliseconds: number) {
	const now = Date.now();
	const seconds = Math.floor((now - unixMilliseconds) / 1000);

	const SECOND = 1;
	const MINUTE = 60;
	const HOUR = MINUTE * 60;
	const DAY = HOUR * 24;
	const MONTH = DAY * 30;
	const YEAR = DAY * 365;

	if (seconds < 0) {
		return "In the future";
	} else if (seconds < SECOND) {
		return "Now";
	} else if (seconds < MINUTE) {
		return `${seconds} sec${seconds === 1 ? "" : "s"} ago`;
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
