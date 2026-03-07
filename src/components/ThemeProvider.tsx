"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "dark" | "cream";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    // Load theme from localStorage on mount
    useEffect(() => {
        try {
            const storedTheme = localStorage.getItem("bitacoria-theme") as Theme | null;
            if (storedTheme) {
                setThemeState(storedTheme);
            }
        } catch { /* localStorage unavailable */ }
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setThemeState((prev) => {
            const nextTheme = prev === "dark" ? "cream" : "dark";
            localStorage.setItem("bitacoria-theme", nextTheme);
            return nextTheme;
        });
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("bitacoria-theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
