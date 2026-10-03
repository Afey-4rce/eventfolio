"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const theme = useAppStore((s) => s.theme);
  const setView = useAppStore((s) => s.setView);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  // Hydrate user session on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data?.user) {
            setUser(data.user);
          }
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  // Sync theme to next-themes via toggling the .dark class
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  // Keep next-themes and our store in sync (one-way: store -> DOM)
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      onThemeChange={() => {}}
    >
      {children}
    </NextThemesProvider>
  );
}
