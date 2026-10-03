"use client";

import { useAppStore } from "@/lib/store";
import { useTranslation, type TranslationKey } from "@/lib/i18n";
import { Sparkles, Menu, X, LayoutDashboard, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const { t } = useTranslation();
  const user = useAppStore((s) => s.user);
  const goAuth = useAppStore((s) => s.goAuth);
  const goLanding = useAppStore((s) => s.goLanding);
  const goDashboard = useAppStore((s) => s.goDashboard);
  const goAdmin = useAppStore((s) => s.goAdmin);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ef-line/40 bg-ef-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={goLanding}
          className="group flex items-center gap-2"
          aria-label="EventFolio home"
        >
          <img src="/icon-limemoss.svg" alt="EventFolio" className="h-8 w-8 object-contain" />
          <span className="font-mono text-base font-semibold tracking-tight text-ef-ink">
            EventFolio
            <span className="text-ef-amber">.</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="#features" label={t("nav.features")} />
          <NavLink href="#showcase" label={t("nav.showcase")} />
          <NavLink href="#templates" label={t("nav.templates")} />
          <NavLink href="#pricing" label={t("nav.pricing")} />
          <NavLink href="#faq" label={t("nav.faq")} />
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={toggleTheme}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-ef-muted hover:text-ef-ink"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? t("nav.light") : t("nav.dark")}
          </button>
          <button
            onClick={() => setLanguage(language === "en" ? "fr" : "en")}
            className="rounded-md border border-ef-line px-2.5 py-1 text-xs font-medium text-ef-muted transition-colors hover:text-ef-ink"
            aria-label="Switch language"
          >
            {language === "en" ? "FR" : "EN"}
          </button>
          {user ? (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => goDashboard()}
                className="text-ef-muted hover:text-ef-ink"
              >
                <LayoutDashboard className="mr-1.5 h-4 w-4" />
                {t("nav.dashboard")}
              </Button>
              {user.role === "admin" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => goAdmin()}
                  className="text-ef-amber hover:text-ef-amber"
                >
                  <Shield className="mr-1.5 h-4 w-4" />
                  {t("nav.admin")}
                </Button>
              )}
              <Avatar className="h-8 w-8 border border-ef-line">
                <AvatarFallback className="bg-ef-surface text-[10px] text-ef-ink">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => goAuth("login")}
                className="text-ef-muted hover:text-ef-ink"
              >
                {t("nav.login")}
              </Button>
              <Button
                size="sm"
                onClick={() => goAuth("signup")}
                className="bg-ef-ink text-ef-bg hover:bg-ef-ink/90"
              >
                {t("nav.startFree")}
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 text-ef-ink md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-ef-line/40 bg-ef-bg/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {["features", "showcase", "templates", "pricing", "faq"].map((s) => (
                <a
                  key={s}
                  href={`#${s}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-ef-muted hover:bg-ef-surface hover:text-ef-ink"
                >
                  {t(`nav.${s}` as TranslationKey)}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-ef-line/40 pt-3">
                <button
                  onClick={toggleTheme}
                  className="rounded-md px-3 py-2 text-left text-sm text-ef-muted"
                >
                  {theme === "dark" ? t("nav.light") : t("nav.dark")}
                </button>
                <button
                  onClick={() => setLanguage(language === "en" ? "fr" : "en")}
                  className="rounded-md px-3 py-2 text-left text-sm text-ef-muted"
                >
                  {language === "en" ? "Français" : "English"}
                </button>
                {user ? (
                  <>
                    <Button onClick={() => { goDashboard(); setMenuOpen(false); }} variant="outline" size="sm">
                      {t("nav.dashboard")}
                    </Button>
                    {user.role === "admin" && (
                      <Button onClick={() => { goAdmin(); setMenuOpen(false); }} variant="outline" size="sm">
                        {t("nav.admin")}
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button onClick={() => { goAuth("login"); setMenuOpen(false); }} variant="ghost" size="sm">
                      {t("nav.login")}
                    </Button>
                    <Button onClick={() => { goAuth("signup"); setMenuOpen(false); }} size="sm">
                      {t("nav.startFree")}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="relative rounded-md px-3 py-1.5 text-sm font-medium text-ef-muted transition-colors hover:text-ef-ink"
    >
      {label}
    </a>
  );
}

export function LogoutButton() {
  const { t } = useTranslation();
  const logout = useAppStore((s) => s.logout);
  return (
    <button
      onClick={logout}
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-ef-muted hover:text-ef-ink"
    >
      <LogOut className="h-3.5 w-3.5" /> {t("dash.logout")}
    </button>
  );
}
