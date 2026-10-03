"use client";

import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();
  const goAuth = useAppStore((s) => s.goAuth);
  const goLanding = useAppStore((s) => s.goLanding);

  return (
    <footer className="mt-auto border-t border-ef-line/40 bg-ef-bg">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <button onClick={goLanding} className="flex items-center gap-2">
              <img src="/icon-limemoss.svg" alt="EventFolio" className="h-8 w-8 object-contain" />
              <span className="font-mono text-base font-semibold tracking-tight text-ef-ink">
                EventFolio<span className="text-ef-amber">.</span>
              </span>
            </button>
            <p className="mt-4 max-w-sm text-sm text-ef-muted">
              {t("footer.tagline")}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="GitHub"
                className="rounded-md border border-ef-line p-2 text-ef-muted hover:text-ef-ink"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="rounded-md border border-ef-line p-2 text-ef-muted hover:text-ef-ink"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="rounded-md border border-ef-line p-2 text-ef-muted hover:text-ef-ink"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ef-muted">{t("footer.product")}</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#features" className="text-ef-ink/80 hover:text-ef-ink">{t("nav.features")}</a></li>
              <li><a href="#templates" className="text-ef-ink/80 hover:text-ef-ink">{t("nav.templates")}</a></li>
              <li><a href="#pricing" className="text-ef-ink/80 hover:text-ef-ink">{t("nav.pricing")}</a></li>
              <li><button onClick={() => goAuth("signup")} className="text-ef-ink/80 hover:text-ef-ink">{t("nav.startFree")}</button></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ef-muted">{t("footer.company")}</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="text-ef-ink/80 hover:text-ef-ink">{t("footer.about")}</a></li>
              <li><a href="#faq" className="text-ef-ink/80 hover:text-ef-ink">{t("nav.faq")}</a></li>
              <li><a href="#" className="text-ef-ink/80 hover:text-ef-ink">{t("footer.changelog")}</a></li>
              <li><a href="#" className="text-ef-ink/80 hover:text-ef-ink">{t("footer.privacy")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-ef-line/40 pt-6 text-xs text-ef-muted sm:flex-row sm:items-center">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <p className="font-mono">v0.1 · made with intention</p>
        </div>
      </div>
    </footer>
  );
}
