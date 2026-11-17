"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "moneycontrolr-theme";

function getSystemPreference(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  // Initialize theme from localStorage or system preference on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initialTheme: Theme = stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";

      setThemeState(initialTheme);

      const effective: ResolvedTheme = initialTheme === "system"
        ? getSystemPreference()
        : initialTheme;

      setResolvedTheme(effective);

      if (effective === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // localStorage may be disabled in some private browsing modes
    } finally {
      setMounted(true);
    }
  }, []);

  // Listen for OS system theme changes if theme is "system"
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleMediaChange(e: MediaQueryListEvent) {
      if (theme === "system") {
        const nextResolved: ResolvedTheme = e.matches ? "dark" : "light";
        setResolvedTheme(nextResolved);
        if (nextResolved === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [theme]);

  const setTheme = (nextTheme: Theme) => {
    startTransition(() => {
      setThemeState(nextTheme);

      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch {
        // Safe fallback
      }

      const effective: ResolvedTheme = nextTheme === "system"
        ? getSystemPreference()
        : nextTheme;

      setResolvedTheme(effective);

      if (effective === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    });
  };

  const toggleTheme = () => {
    // If currently dark, switch to light; if currently light, switch to dark
    const nextTheme: Theme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
