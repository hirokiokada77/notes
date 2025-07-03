import { type ReactNode, useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
	type Theme,
	ThemeContext,
	USER_PREFERENCE_STORAGE_KEY,
	type UserPreference,
} from "./ThemeContext";

export interface ThemeProviderProps {
	children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const [userPreference, setUserPreference] = useLocalStorage<UserPreference>(
		USER_PREFERENCE_STORAGE_KEY,
		null,
	);

	const [theme, setThemeState] = useState<Theme>(() => {
		if (userPreference) {
			return userPreference;
		}
		if (typeof window !== "undefined" && window.matchMedia) {
			return window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		}
		return "light";
	});

	useEffect(() => {
		if (userPreference === null) {
			if (typeof window !== "undefined" && window.matchMedia) {
				const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

				const handleChange = (e: MediaQueryListEvent) => {
					setThemeState(e.matches ? "dark" : "light");
				};

				mediaQuery.addEventListener("change", handleChange);

				return () => {
					mediaQuery.removeEventListener("change", handleChange);
				};
			}
		}
	}, [userPreference]);

	const toggleTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
		setUserPreference(newTheme);
	};

	const resetToSystemTheme = () => {
		setUserPreference(null);
		if (typeof window !== "undefined" && window.matchMedia) {
			setThemeState(
				window.matchMedia("(prefers-color-scheme: dark)").matches
					? "dark"
					: "light",
			);
		} else {
			setThemeState("light");
		}
	};

	const contextValue = {
		theme,
		setTheme: toggleTheme,
		userPreference,
		resetToSystemTheme,
	};

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);
}
