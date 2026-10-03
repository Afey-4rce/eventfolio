"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Heart,
  Share2,
  Eye,
  ArrowUpRight,
  ExternalLink,
  Calendar,
  Briefcase,
  Twitter,
  Linkedin,
  Facebook,
  Copy,
  Check,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export type PublicSite = {
  id: string;
  type: "event" | "portfolio";
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  theme: "aurora" | "noir" | "sunset" | "mint" | "crimson";
  coverImage: string | null;
  views: number;
  likes: number;
  ownerName: string;
  createdAt: string;
  content: Record<string, unknown>;
};

type Hero = {
  title?: string;
  eyebrow?: string;
  tagline?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
};

type EventContent = {
  hero: Hero;
  category?: string;
  sectionLabels?: { speakers?: string; agenda?: string; sponsors?: string; stats?: string; gallery?: string };
  stats?: Array<{ value: string; label: string }>;
  speakers?: Array<{ name: string; role: string; studio: string }>;
  agenda?: Array<{ time: string; title: string; track: string; country: string; city: string; date: string }>;
  sponsors?: Array<{ name: string; logo: string }>;
  gallery?: Array<{ src: string; caption: string; alt: string }>;
};

type PortfolioContent = {
  hero: Hero;
  sectionLabels?: { selected_work?: string; about?: string; services?: string; contact?: string; gallery?: string };
  selected_work?: Array<{ title: string; client: string; year: string; description: string; tag: string }>;
  about?: { body: string; highlights?: string[] };
  services?: Array<{ name: string; description: string }>;
  contact?: {
    email: string;
    phone: string;
    location: string;
    socials?: Array<{ platform: string; handle: string; url: string }>;
  };
  gallery?: Array<{ src: string; caption: string; alt: string }>;
};

const THEME_CLASS: Record<PublicSite["theme"], { bg: string; text: string }> = {
  aurora: { bg: "bg-gradient-to-br from-[#0d2818] via-[#0d2818] to-[#96a131]", text: "text-white" },
  noir: { bg: "bg-gradient-to-br from-[#000900] to-[#0d2818]", text: "text-white" },
  sunset: { bg: "bg-gradient-to-br from-[#96a131] to-[#000900]", text: "text-white" },
  mint: { bg: "bg-gradient-to-br from-[#f0faf4] to-[#96a131]", text: "text-white" },
  crimson: { bg: "bg-gradient-to-br from-[#0d2818] to-[#96a131]", text: "text-white" },
};

export function PublicSiteClient({ site }: { site: PublicSite }) {
  const { t } = useTranslation();
  const [views, setViews] = useState(site.views);
  const [likes, setLikes] = useState(site.likes);
  const [liked, setLiked] = useState(false);
  const [recordedView, setRecordedView] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/${site.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [site.slug]);

  // Record a view once on mount (client-side so we don't double-count on revalidate)
  useEffect(() => {
    if (recordedView) return;
    setRecordedView(true);
    fetch(`/api/sites/${site.id}/view`, { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.views != null) setViews(d.views);
      })
      .catch(() => {});
  }, [site.id, recordedView]);

  // Track scroll progress for the top reading-progress bar (0 to 1)
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      let pct = 0;
      if (total > 0) {
        pct = Math.min(1, Math.max(0, doc.scrollTop / total));
      }
      setScrollProgress(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLike = useCallback(async () => {
    if (liked) return;
    setLiked(true);
    try {
      const res = await fetch(`/api/sites/${site.id}/like`, { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        if (d?.likes != null) setLikes(d.likes);
      }
    } catch {
      setLiked(false);
    }
  }, [liked, site.id]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/${site.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: site.title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* user dismissed share sheet */
    }
  }, [site.slug, site.title]);

  const themeClass = THEME_CLASS[site.theme] ?? THEME_CLASS.aurora;
  const content = site.content as EventContent | PortfolioContent | Record<string, never>;
  const hero: Hero = (content as { hero?: Hero }).hero ?? {};

  return (
    <div className="flex min-h-screen flex-col bg-ef-bg text-ef-ink">
      {/* Reading progress bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-[#96a131] to-[#0d2818] transition-[width] duration-150 ease-out"
          style={{ width: `${Math.round(scrollProgress * 100)}%` }}
        />
      </div>

      {/* Minimal top bar */}
      <header className="sticky top-0 z-40 border-b border-ef-line/40 bg-ef-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon-limemoss.svg" alt="EventFolio" className="h-7 w-7 object-contain" />
            <span className="font-mono text-sm font-semibold tracking-tight">
              EventFolio<span className="text-ef-amber">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-ef-muted">
            <span className="hidden sm:inline">{t("public.by")} {site.ownerName}</span>
            <a
              href="/"
              className="flex items-center gap-1 rounded-md border border-ef-line px-2.5 py-1 text-ef-ink hover:bg-ef-surface"
            >
              {t("public.makeYourOwn")} <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={`relative overflow-hidden ${themeClass.bg} aspect-[2/1] sm:aspect-[3/1]`}
        >
          {site.coverImage && (
            <img
              src={site.coverImage}
              alt={site.title}
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              onError={(e) => {
                // Hide the broken image so the gradient cover remains visible.
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div className="absolute inset-0 ef-grid-bg opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-between px-4 py-8 sm:px-6 sm:py-12">
            <div className="flex items-start justify-between">
              <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${themeClass.text} opacity-80 sm:text-xs`}>
                {hero.eyebrow || site.subtitle || ""}
              </span>
              <span
                className={`flex items-center gap-1.5 rounded-full border border-white/20 px-2.5 py-1 text-[10px] ${themeClass.text} backdrop-blur`}
              >
                {site.type === "event" ? <Calendar className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                {site.type}
              </span>
            </div>
            <div>
              <h1 className={`text-balance text-3xl font-semibold tracking-tight ${themeClass.text} sm:text-5xl lg:text-6xl`}>
                {hero.title || site.title}
              </h1>
              {(hero.tagline || site.description) && (
                <p className={`mt-3 max-w-xl text-pretty text-sm ${themeClass.text} opacity-80 sm:text-base`}>
                  {hero.tagline || site.description}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                <button className="rounded-lg bg-white/95 px-5 py-2 text-xs font-medium text-black hover:bg-white sm:text-sm">
                  {hero.ctaPrimary || (site.type === "event" ? "Reserve a seat" : "View work")}
                </button>
                {hero.ctaSecondary && (
                  <button className="rounded-lg border border-white/40 px-4 py-2 text-xs font-medium text-white backdrop-blur hover:bg-white/10 sm:text-sm">
                    {hero.ctaSecondary}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sections with sticky TOC on desktop */}
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-8">
            <TableOfContents site={site} />
            <div>
              {site.type === "event" ? (
                <EventSections content={content as EventContent} themeClass={themeClass} hero={hero} siteTitle={site.title} />
              ) : (
                <PortfolioSections content={content as PortfolioContent} />
              )}
            </div>
          </div>
        </div>

        {/* Like + share band */}
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-ef-line bg-ef-surface/40 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <p className="text-sm font-medium text-ef-ink">{t("public.enjoyed")}</p>
              <p className="mt-0.5 text-xs text-ef-muted">
                <Link href="/" className="text-ef-amber hover:underline">
                  {t("public.madeWith")}
                </Link>{" "}
                · {t("public.by")} {site.ownerName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-md border border-ef-line px-2.5 py-1.5 text-[11px] text-ef-muted">
                <Eye className="h-3 w-3" /> {Intl.NumberFormat("en-US").format(views)}
              </span>
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  liked
                    ? "border-ef-amber bg-ef-amber text-ef-bg"
                    : "border-ef-line text-ef-ink hover:bg-ef-surface"
                }`}
              >
                <Heart className={`h-3 w-3 ${liked ? "fill-current" : ""}`} />
                {liked ? t("public.liked") : t("public.like")} · {Intl.NumberFormat("en-US").format(likes)}
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-md border border-ef-line px-3 py-1.5 text-[11px] font-medium text-ef-ink transition-colors hover:bg-ef-surface"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-ef-amber" /> {t("public.copied")}
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> {t("public.copyLink")}
                  </>
                )}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-md border border-ef-line px-3 py-1.5 text-[11px] font-medium text-ef-ink hover:bg-ef-surface"
              >
                <Share2 className="h-3 w-3" /> {t("public.share")}
              </button>
              {/* Social share buttons */}
              {(() => {
                const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/${site.slug}` : "";
                const shareText = site.title;
                return (
                  <>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-md border border-ef-line p-1.5 text-ef-muted transition-colors hover:bg-ef-surface hover:text-ef-ink"
                      aria-label="Share on Twitter/X"
                      title="Share on Twitter/X"
                    >
                      <Twitter className="h-3 w-3" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-md border border-ef-line p-1.5 text-ef-muted transition-colors hover:bg-ef-surface hover:text-ef-ink"
                      aria-label="Share on LinkedIn"
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="h-3 w-3" />
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-md border border-ef-line p-1.5 text-ef-muted transition-colors hover:bg-ef-surface hover:text-ef-ink"
                      aria-label="Share on Facebook"
                      title="Share on Facebook"
                    >
                      <Facebook className="h-3 w-3" />
                    </a>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-ef-line/40 bg-ef-bg">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-8 text-xs text-ef-muted sm:flex-row sm:items-center sm:px-6">
          <p>
            Built with{" "}
            <Link href="/" className="font-medium text-ef-amber hover:underline">
              EventFolio
            </Link>
          </p>
          <p className="font-mono">/{site.slug}</p>
        </div>
      </footer>
    </div>
  );
}

// ---------- Event sections ----------
function EventSections({
  content,
  themeClass,
  hero,
  siteTitle,
}: {
  content: EventContent;
  themeClass: { bg: string; text: string };
  hero: Hero;
  siteTitle: string;
}) {
  const { t } = useTranslation();
  const labels = content.sectionLabels ?? {};
  const speakersLabel = labels.speakers || "Speakers";
  const agendaLabel = labels.agenda || "Agenda";
  const sponsorsLabel = labels.sponsors || "Sponsors";

  return (
    <div className="space-y-16">
      {content.stats && content.stats.length > 0 && (
        <section>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ef-line bg-ef-line/40 sm:grid-cols-4">
            {content.stats.map((s, i) => (
              <div key={i} className="bg-ef-bg p-5 text-center sm:p-6">
                <p className="text-3xl font-semibold tracking-tight text-ef-ink sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ef-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {content.speakers && content.speakers.length > 0 && (
        <Section id="speakers" eyebrow={`( ${speakersLabel} )`} title={speakersLabel}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.speakers.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
                className="rounded-2xl border border-ef-line bg-ef-surface/40 p-5 transition-colors hover:bg-ef-surface/80"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#96a131] to-[#0d2818] text-base font-semibold text-ef-bg">
                  {s.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <p className="mt-3 text-base font-medium text-ef-ink">{s.name}</p>
                <p className="text-xs text-ef-amber">{s.role}</p>
                {s.studio && <p className="mt-1 text-xs text-ef-muted">{s.studio}</p>}
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {content.agenda && content.agenda.length > 0 && (
        <Section id="agenda" eyebrow={`( ${agendaLabel} )`} title={agendaLabel}>
          <div className="overflow-hidden rounded-2xl border border-ef-line bg-ef-bg">
            {content.agenda.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 p-4 ${i > 0 ? "border-t border-ef-line/40" : ""}`}
              >
                <div>
                  <span className="font-mono text-base text-ef-amber">{a.time}</span>
                  {a.date && <p className="text-xs text-ef-muted">{a.date}</p>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ef-ink">{a.title}</p>
                  {a.track && <p className="text-xs text-ef-muted">{a.track}</p>}
                  {(a.country || a.city) && (
                    <p className="mt-1 text-xs text-ef-muted">📍 {a.city}{a.city && a.country ? ", " : ""}{a.country}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {content.sponsors && content.sponsors.length > 0 && (
        <Section id="sponsors" eyebrow={`( ${sponsorsLabel} )`} title={sponsorsLabel}>
          <div className="flex flex-wrap gap-4">
            {content.sponsors.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-ef-line bg-ef-surface/60 px-5 py-3">
                {s.logo && (
                  <img src={s.logo} alt={s.name} className="h-10 w-10 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                )}
                <span className="text-sm font-medium text-ef-ink">{s.name}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {content.gallery && content.gallery.length > 0 && (
        <Section id="gallery" eyebrow={`( ${labels.gallery || "Gallery"} )`} title={labels.gallery || "Gallery"}>
          <GalleryGrid items={content.gallery} />
        </Section>
      )}

      {/* CTA band */}
      <div className={`relative overflow-hidden rounded-3xl ${themeClass.bg} p-8 sm:p-12`}>
        <div className="absolute inset-0 ef-grid-bg opacity-20" />
        <div className="relative flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className={`text-2xl font-semibold tracking-tight ${themeClass.text} sm:text-3xl`}>
              {t("public.seeYouThere")}
            </h3>
            <p className={`mt-1 text-sm ${themeClass.text} opacity-80`}>
              {t("public.reserveSeat", { title: hero.title || siteTitle })}
            </p>
          </div>
          <button className={`rounded-lg bg-white/90 px-5 py-2.5 text-sm font-medium text-black hover:bg-white ${themeClass.text}`}>
            {hero.ctaPrimary || "Reserve a seat"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Portfolio sections ----------
function PortfolioSections({ content }: { content: PortfolioContent }) {
  const labels = content.sectionLabels ?? {};
  const workLabel = labels.selected_work || "Selected work";
  const aboutLabel = labels.about || "About";
  const servicesLabel = labels.services || "Services";
  const contactLabel = labels.contact || "Contact";

  return (
    <div className="space-y-16">
      {content.selected_work && content.selected_work.length > 0 && (
        <Section id="work" eyebrow={`( ${workLabel} )`} title={workLabel}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {content.selected_work.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: (i % 2) * 0.05 }}
                className="group overflow-hidden rounded-2xl border border-ef-line bg-ef-surface/40 transition-colors hover:bg-ef-surface/80"
              >
                <div className="relative aspect-[16/10] bg-gradient-to-br from-[#96a131]/20 to-[#0d2818]/20">
                  <div className="absolute inset-0 ef-grid-bg opacity-20" />
                  {w.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white backdrop-blur">
                      {w.tag}
                    </span>
                  )}
                  <ExternalLink className="absolute bottom-3 right-3 h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-base font-medium text-ef-ink">{w.title}</p>
                    {w.year && <span className="font-mono text-[10px] text-ef-muted">{w.year}</span>}
                  </div>
                  {w.client && <p className="text-[10px] text-ef-amber">{w.client}</p>}
                  {w.description && <p className="mt-2 text-sm text-ef-muted">{w.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {content.about && (content.about.body || (content.about.highlights && content.about.highlights.length > 0)) && (
        <Section id="about" eyebrow={`( ${aboutLabel} )`} title={aboutLabel}>
          <div className="rounded-2xl border border-ef-line bg-ef-surface/40 p-6 sm:p-8">
            {content.about.body && <p className="text-base text-ef-ink/90">{content.about.body}</p>}
            {content.about.highlights && content.about.highlights.length > 0 && (
              <ul className="mt-5 grid grid-cols-1 gap-2 text-sm text-ef-muted sm:grid-cols-2">
                {content.about.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-ef-amber" /> {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      )}

      {content.services && content.services.length > 0 && (
        <Section id="services" eyebrow={`( ${servicesLabel} )`} title={servicesLabel}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {content.services.map((s, i) => (
              <div key={i} className="rounded-2xl border border-ef-line bg-ef-surface/40 p-5">
                <p className="text-base font-medium text-ef-ink">{s.name}</p>
                {s.description && <p className="mt-1 text-sm text-ef-muted">{s.description}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {content.contact && (content.contact.email || content.contact.phone || content.contact.location || (content.contact.socials && content.contact.socials.length > 0)) && (
        <Section id="contact" eyebrow={`( ${contactLabel} )`} title={contactLabel}>
          <div className="rounded-2xl border border-ef-line bg-ef-surface/40 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-6">
              {content.contact.email && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ef-muted">{t("editor.email")}</p>
                  <a href={`mailto:${content.contact.email}`} className="text-base text-ef-ink hover:text-ef-amber">
                    {content.contact.email}
                  </a>
                </div>
              )}
              {content.contact.phone && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ef-muted">{t("editor.phone")}</p>
                  <a href={`tel:${content.contact.phone}`} className="text-base text-ef-ink hover:text-ef-amber">
                    {content.contact.phone}
                  </a>
                </div>
              )}
              {content.contact.location && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ef-muted">{t("editor.location")}</p>
                  <p className="text-base text-ef-ink">{content.contact.location}</p>
                </div>
              )}
            </div>
            {content.contact.socials && content.contact.socials.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {content.contact.socials.map((s, i) => (
                  s.url ? (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-ef-line bg-ef-surface/60 px-3 py-1.5 text-xs text-ef-amber transition-colors hover:bg-ef-surface"
                    >
                      {s.platform} · {s.handle}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span
                      key={i}
                      className="rounded-md border border-ef-line bg-ef-surface/60 px-3 py-1.5 text-xs text-ef-ink"
                    >
                      {s.platform} · {s.handle}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>
        </Section>
      )}
      {content.gallery && content.gallery.length > 0 && (
        <Section id="gallery" eyebrow={`( ${labels.gallery || "Gallery"} )`} title={labels.gallery || "Gallery"}>
          <GalleryGrid items={content.gallery} />
        </Section>
      )}
    </div>
  );
}

/**
 * Responsive masonry-style gallery grid with a built-in lightbox.
 * Click any image to open a full-screen modal with prev/next navigation,
 * keyboard support (←/→/Esc) and the caption shown below the image.
 */
function GalleryGrid({ items }: { items: Array<{ src: string; caption: string; alt: string }> }) {
  const [active, setActive] = useState<number | null>(null);

  // Keyboard navigation inside the lightbox
  useEffect(() => {
    if (active === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setActive((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", handler);
    // Lock body scroll while the lightbox is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = prev;
    };
  }, [active, items.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((g, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: (i % 6) * 0.04 }}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-ef-line bg-ef-surface/40 focus:outline-none focus:ring-2 focus:ring-ef-amber"
            aria-label={`Open image ${i + 1}${g.caption ? ": " + g.caption : ""}`}
          >
            <img
              src={g.src}
              alt={g.alt || g.caption || `Gallery image ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            {g.caption && (
              <span className="pointer-events-none absolute bottom-2 left-2 right-2 truncate text-left text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {g.caption}
              </span>
            )}
            <span className="pointer-events-none absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-3 w-3" />
            </span>
          </motion.button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActive(null);
            }}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close gallery"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActive((i) => (i === null ? i : (i - 1 + items.length) % items.length));
            }}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActive((i) => (i === null ? i : (i + 1) % items.length));
            }}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <figure
            className="relative max-h-[85vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={items[active].src}
              alt={items[active].alt || items[active].caption || `Gallery image ${active + 1}`}
              className="mx-auto max-h-[75vh] max-w-full rounded-xl object-contain"
            />
            <figcaption className="mt-3 text-center">
              {items[active].caption && (
                <p className="text-sm font-medium text-white/95">{items[active].caption}</p>
              )}
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                {active + 1} / {items.length}
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

/**
 * Sticky table of contents for the public site. Lists the available sections
 * (computed from the site content) and highlights the one currently in view.
 * Only renders on desktop (lg+) and only when there are 2+ sections.
 */
function TableOfContents({ site }: { site: PublicSite }) {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string>("");

  const sections = useMemo(() => {
    const content = site.content as EventContent | PortfolioContent;
    const list: Array<{ id: string; label: string }> = [];
    if (site.type === "event") {
      const ec = content as EventContent;
      const labels = ec.sectionLabels ?? {};
      if (ec.stats && ec.stats.length > 0) list.push({ id: "top", label: labels.stats || "Stats" });
      if (ec.speakers && ec.speakers.length > 0) list.push({ id: "speakers", label: labels.speakers || "Speakers" });
      if (ec.agenda && ec.agenda.length > 0) list.push({ id: "agenda", label: labels.agenda || "Agenda" });
      if (ec.sponsors && ec.sponsors.length > 0) list.push({ id: "sponsors", label: labels.sponsors || "Sponsors" });
      if (ec.gallery && ec.gallery.length > 0) list.push({ id: "gallery", label: labels.gallery || "Gallery" });
    } else {
      const pc = content as PortfolioContent;
      const labels = pc.sectionLabels ?? {};
      if (pc.selected_work && pc.selected_work.length > 0) list.push({ id: "work", label: labels.selected_work || "Selected work" });
      if (pc.about && (pc.about.body || (pc.about.highlights && pc.about.highlights.length > 0))) list.push({ id: "about", label: labels.about || "About" });
      if (pc.services && pc.services.length > 0) list.push({ id: "services", label: labels.services || "Services" });
      if (pc.contact && (pc.contact.email || pc.contact.location || (pc.contact.socials && pc.contact.socials.length > 0))) list.push({ id: "contact", label: labels.contact || "Contact" });
      if (pc.gallery && pc.gallery.length > 0) list.push({ id: "gallery", label: labels.gallery || "Gallery" });
    }
    return list;
  }, [site]);

  // Track which section is in view using IntersectionObserver
  useEffect(() => {
    if (sections.length < 2) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      if (s.id === "top") return;
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ef-muted">{t("public.onThisPage")}</p>
        <nav className="space-y-1 border-l border-ef-line/60">
          {sections.map((s) => {
            const href = s.id === "top" ? "#top" : `#${s.id}`;
            const isActive = activeId === s.id || (s.id === "top" && !activeId);
            return (
              <a
                key={s.id}
                href={href}
                className={`block border-l-2 py-1 pl-3 text-xs transition-colors ${
                  isActive
                    ? "border-ef-amber text-ef-amber"
                    : "border-transparent text-ef-muted hover:text-ef-ink"
                }`}
              >
                {s.label}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function Section({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ef-amber">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ef-ink sm:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
