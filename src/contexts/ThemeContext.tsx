import { createContext, useContext } from "react";

export type Theme = "dark" | "light";
export type UserPreference = Theme | null;

export interface ThemeContextType {
	theme: Theme;
	setTheme: (newTheme: Theme) => void;
	userPreference: UserPreference;
	resetToSystemTheme: () => void;
}

export const USER_PREFERENCE_STORAGE_KEY = "notesAppUserThemePreference";

export const ThemeContext = createContext<ThemeContextType | undefined>(
	undefined,
);

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
