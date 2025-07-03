import { useEffect, useState } from "react";

export function useLocalStorage<T>(
	key: string,
	initialValue: T | (() => T),
): [T, (value: T | ((prev: T) => T)) => void] {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = localStorage.getItem(key);
			if (item !== null) {
				return JSON.parse(item);
			}
			return typeof initialValue === "function"
				? (initialValue as () => T)()
				: initialValue;
		} catch (error) {
			console.error(`Error reading key "${key}" from localStorage:`, error);
			return typeof initialValue === "function"
				? (initialValue as () => T)()
				: initialValue;
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(key, JSON.stringify(storedValue));
		} catch (error) {
			console.error(`Error writing key "${key}" to localStorage:`, error);
		}
	}, [key, storedValue]);

	return [storedValue, setStoredValue];
}
