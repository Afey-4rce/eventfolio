"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Eye, Heart, ArrowUpRight, Calendar, Briefcase, Filter, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type SortKey = "recent" | "views" | "likes";
type TypeFilter = "all" | "event" | "portfolio";
type ThemeFilter = "all" | "aurora" | "noir" | "sunset" | "mint" | "crimson";

export type ExploreSite = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  type: "event" | "portfolio";
  theme: string;
  coverImage: string | null;
  views: number;
  likes: number;
  ownerName: string | null;
  createdAt: string;
};

const THEME_GRADIENTS: Record<string, string> = {
  aurora: "bg-gradient-to-br from-[#0d2818] via-[#0d2818] to-[#96a131]",
  noir: "bg-gradient-to-br from-[#000900] to-[#0d2818]",
  sunset: "bg-gradient-to-br from-[#96a131] to-[#000900]",
  mint: "bg-gradient-to-br from-[#f0faf4] to-[#96a131]",
  crimson: "bg-gradient-to-br from-[#0d2818] to-[#96a131]",
};

export function ExploreGalleryClient({ initial }: { initial: ExploreSite[] }) {
  const { t } = useTranslation();
  const [sites, setSites] = useState<ExploreSite[]>(initial);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [themeFilter, setThemeFilter] = useState<ThemeFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ all: "1", sort });
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (themeFilter !== "all") params.set("theme", themeFilter);
      const res = await fetch(`/api/sites/explore?${params.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        if (Array.isArray(d?.sites)) setSites(d.sites);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [typeFilter, themeFilter, sort]);

  useEffect(() => {
    // Debounce refetches slightly so toggling filters quickly doesn't spam
    const id = setTimeout(refetch, 80);
    return () => clearTimeout(id);
  }, [refetch]);

  const hasActiveFilters = typeFilter !== "all" || themeFilter !== "all" || sort !== "recent";

  const clearFilters = () => {
    setTypeFilter("all");
    setThemeFilter("all");
    setSort("recent");
  };

  return (
    <>
      {/* Minimal top bar */}
      <header className="sticky top-0 z-40 border-b border-ef-line/40 bg-ef-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon-limemoss.svg" alt="EventFolio" className="h-7 w-7 object-contain" />
            <span className="font-mono text-sm font-semibold tracking-tight">
              EventFolio<span className="text-ef-amber">.</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 rounded-md border border-ef-line px-2.5 py-1 text-xs text-ef-ink hover:bg-ef-surface"
          >
            {t("nav.backToSite")} <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero / header */}
        <section className="border-b border-ef-line/40">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ef-amber">{t("explore.eyebrow")}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ef-ink sm:text-5xl">
              <span className="ef-text-gradient">{t("explore.title")}</span>
            </h1>
            <p className="mt-3 max-w-xl text-ef-muted">
              {t("explore.subtitle")}
            </p>
          </div>
        </section>

        {/* Filter bar */}
        <section className="sticky top-[57px] z-30 border-b border-ef-line/40 bg-ef-bg/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Filter className="h-3.5 w-3.5 text-ef-muted" />

            {/* Type filter */}
            <div className="flex items-center gap-1 rounded-lg border border-ef-line p-0.5">
              {(["all", "event", "portfolio"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTypeFilter(tf)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                    typeFilter === tf ? "bg-ef-surface text-ef-ink" : "text-ef-muted hover:text-ef-ink"
                  }`}
                >
                  {tf === "all" ? t("explore.all") : tf === "event" ? t("explore.event") : t("explore.portfolio")}
                </button>
              ))}
            </div>

            {/* Theme filter */}
            <div className="flex items-center gap-1 rounded-lg border border-ef-line p-0.5">
              <span className="px-2 text-[10px] uppercase tracking-wider text-ef-muted">{t("explore.theme")}</span>
              {(["all", "aurora", "noir", "sunset", "mint", "crimson"] as const).map((th) => (
                <button
                  key={th}
                  onClick={() => setThemeFilter(th)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                    themeFilter === th ? "bg-ef-surface text-ef-ink" : "text-ef-muted hover:text-ef-ink"
                  }`}
                >
                  {th !== "all" && (
                    <span className={`h-2 w-2 rounded-full ${THEME_GRADIENTS[th] ?? ""}`} />
                  )}
                  <span className="capitalize">{th === "all" ? t("explore.all") : th}</span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-1 rounded-lg border border-ef-line p-0.5">
              <span className="px-2 text-[10px] uppercase tracking-wider text-ef-muted">{t("explore.sort")}</span>
              {([
                { key: "recent", label: t("explore.recent") },
                { key: "views", label: t("explore.views") },
                { key: "likes", label: t("explore.likes") },
              ] as { key: SortKey; label: string }[]).map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    sort === s.key ? "bg-ef-surface text-ef-ink" : "text-ef-muted hover:text-ef-ink"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-md border border-ef-line px-2 py-1 text-[11px] text-ef-muted hover:text-ef-ink"
              >
                <X className="h-3 w-3" /> {t("explore.clear")}
              </button>
            )}
          </div>
        </section>

        {/* Grid */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-2xl border border-ef-line bg-ef-surface/40"
                />
              ))}
            </div>
          ) : sites.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ef-line bg-ef-surface/30 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ef-surface">
                <Filter className="h-5 w-5 text-ef-amber" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ef-ink">{t("explore.noMatch")}</h3>
              <p className="mt-1 max-w-xs text-sm text-ef-muted">
                {t("explore.noMatchDesc")}
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 rounded-md border border-ef-line px-3 py-1.5 text-xs text-ef-ink hover:bg-ef-surface"
              >
                {t("explore.clearFilters")}
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-ef-muted">
                {t("explore.showing")} <span className="font-medium text-ef-ink">{sites.length}</span>{" "}
                {sites.length === 1 ? t("explore.page") : t("explore.pages")}
                {typeFilter !== "all" && <> · {t("explore.type")}: <span className="capitalize text-ef-ink">{typeFilter}</span></>}
                {themeFilter !== "all" && <> · {t("explore.themeLabel")}: <span className="capitalize text-ef-ink">{themeFilter}</span></>}
                {sort !== "recent" && <> · {t("explore.sortedBy")} <span className="capitalize text-ef-ink">{sort}</span></>}
              </p>
              <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]">
                {sites.map((s, i) => (
                  <ExploreCard key={s.id} site={s} index={i} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-ef-line/40 bg-ef-bg">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-8 text-xs text-ef-muted sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>
            Built with{" "}
            <Link href="/" className="font-medium text-ef-amber hover:underline">
              EventFolio
            </Link>
          </p>
          <p className="font-mono">{sites.length} {t("explore.pages")} live</p>
        </div>
      </footer>
    </>
  );
}

function ExploreCard({ site, index }: { site: ExploreSite; index: number }) {
  const { t } = useTranslation();
  const gradient = THEME_GRADIENTS[site.theme] ?? THEME_GRADIENTS.aurora;
  const aspect = index % 3 === 1 ? "aspect-[3/4]" : index % 3 === 2 ? "aspect-[1/1]" : "aspect-[4/3]";
  const TypeIcon = site.type === "event" ? Calendar : Briefcase;

  return (
    <motion.a
      href={`/${site.slug}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.04 }}
      className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-ef-line bg-ef-surface/40 transition-all hover:-translate-y-1 hover:border-ef-amber/40 hover:bg-ef-surface/80"
    >
      <div className={`relative ${aspect} overflow-hidden ${gradient}`}>
        {site.coverImage && (site.coverImage.startsWith("data:") || site.coverImage.startsWith("http") || site.coverImage.startsWith("/")) && (
          <img
            src={site.coverImage}
            alt={site.title}
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="absolute inset-0 ef-grid-bg opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
            <TypeIcon className="h-2.5 w-2.5" /> {site.type}
          </span>
          {site.theme && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white capitalize backdrop-blur">
              {site.theme}
            </span>
          )}
        </div>

        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          {t("explore.viewPage")} <ArrowUpRight className="h-3 w-3" />
        </span>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="line-clamp-2 text-base font-semibold text-white drop-shadow-sm sm:text-lg">{site.title}</h3>
          {site.subtitle && (
            <p className="mt-0.5 line-clamp-2 text-xs text-white/80 drop-shadow-sm">{site.subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <span className="truncate font-mono text-[10px] text-ef-muted">
          {t("public.by")} {site.ownerName ?? "Anonymous"}
        </span>
        <div className="flex items-center gap-2 text-[10px] text-ef-muted">
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" /> {Intl.NumberFormat("en-US").format(site.views)}
          </span>
          <span className="flex items-center gap-0.5">
            <Heart className="h-3 w-3" /> {Intl.NumberFormat("en-US").format(site.likes)}
          </span>
        </div>
      </div>
    </motion.a>
  );
}
