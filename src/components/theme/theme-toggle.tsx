"use client";

import { useTheme, type Theme } from "./theme-provider";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "cards" | "dropdown-item";
  className?: string;
  onSelect?: () => void;
}

export function ThemeToggle({
  variant = "icon",
  className,
  onSelect,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    if (variant === "cards") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-surface border border-border animate-pulse"
            />
          ))}
        </div>
      );
    }

    return (
      <div
        className={cn(
          "w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border bg-surface/50 animate-pulse",
          className
        )}
      />
    );
  }

  // 1. Icon button for Navbar header (desktop & mobile)
  if (variant === "icon") {
    const isDark = resolvedTheme === "dark";
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "p-1.5 sm:p-2 rounded-full border border-border bg-surface text-apptext hover:text-primary hover:border-primary/40 hover:bg-primary-light/50 transition-all shadow-xs flex items-center justify-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          className
        )}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode (☀️)" : "Switch to dark mode (🌙)"}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-emerald-800 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </button>
    );
  }

  // 2. Dropdown Item for 3-dots Quick Access Menu
  if (variant === "dropdown-item") {
    const isDark = resolvedTheme === "dark";
    return (
      <button
        type="button"
        onClick={() => {
          toggleTheme();
          onSelect?.();
        }}
        className={cn(
          "w-full flex items-center gap-3 p-2.5 rounded-xl text-apptext hover:bg-primary-light hover:text-primary transition-colors text-left group",
          className
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary-light group-hover:bg-primary group-hover:text-white flex items-center justify-center text-primary shrink-0 transition-colors">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:text-white" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </div>
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="text-xs font-bold flex items-center justify-between">
            <span>Theme: {isDark ? "Dark Mode" : "Light Mode"}</span>
            <span className="text-[10px] font-semibold text-apptext-muted uppercase">
              {theme}
            </span>
          </div>
          <div className="text-[11px] text-apptext-muted group-hover:text-primary/80 truncate">
            {isDark ? "Switch to crisp light theme" : "Switch to obsidian dark theme"}
          </div>
        </div>
      </button>
    );
  }

  // 3. High-fidelity Interactive Cards for Settings Page
  const themeOptions: {
    key: Theme;
    title: string;
    subtitle: string;
    icon: typeof Sun;
    previewBg: string;
    previewCard: string;
    previewBorder: string;
    previewText: string;
  }[] = [
    {
      key: "light",
      title: "Light Theme",
      subtitle: "Mint Mist & Forest Green",
      icon: Sun,
      previewBg: "bg-[#EAF4EE]",
      previewCard: "bg-white",
      previewBorder: "border-[#D8E6DE]",
      previewText: "text-[#252D29]",
    },
    {
      key: "dark",
      title: "Dark Theme",
      subtitle: "Obsidian Forest & Emerald Glow",
      icon: Moon,
      previewBg: "bg-[#0B1310]",
      previewCard: "bg-[#13221C]",
      previewBorder: "border-[#203A2F]",
      previewText: "text-[#F3F7F5]",
    },
    {
      key: "system",
      title: "System Preference",
      subtitle: "Auto-sync with your device OS",
      icon: Laptop,
      previewBg: "bg-gradient-to-r from-[#EAF4EE] to-[#0B1310]",
      previewCard: "bg-surface",
      previewBorder: "border-border",
      previewText: "text-apptext",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4", className)}>
      {themeOptions.map((opt) => {
        const isSelected = theme === opt.key;
        const Icon = opt.icon;

        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => setTheme(opt.key)}
            className={cn(
              "relative text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs",
              isSelected
                ? "border-primary bg-primary-light/40 shadow-sm"
                : "border-border bg-surface hover:border-border/80 hover:bg-background/50"
            )}
          >
            {/* Top row: Icon + Checkmark if selected */}
            <div className="flex items-center justify-between w-full">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-primary text-white shadow-xs"
                    : "bg-primary-light text-primary group-hover:bg-primary group-hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              {isSelected && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full border border-primary/20">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Active
                </span>
              )}
            </div>

            {/* Visual Color Swatch Mini-Preview */}
            <div
              className={cn(
                "w-full h-10 rounded-xl p-1.5 flex items-center gap-1.5 border",
                opt.previewBg,
                opt.previewBorder
              )}
            >
              <div
                className={cn(
                  "h-full flex-1 rounded-lg border shadow-2xs flex items-center px-2",
                  opt.previewCard,
                  opt.previewBorder
                )}
              >
                <div className="w-6 h-1.5 rounded-full bg-primary" />
              </div>
              <div
                className={cn(
                  "h-full w-1/3 rounded-lg border shadow-2xs flex items-center justify-center text-[10px] font-bold",
                  opt.previewCard,
                  opt.previewBorder,
                  opt.previewText
                )}
              >
                ₹
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-apptext">{opt.title}</div>
              <p className="text-xs text-apptext-muted">{opt.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
