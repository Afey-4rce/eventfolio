"use client";

import { useAppStore } from "@/lib/store";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Heart,
  Share2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

type Site = {
  id: string;
  type: "event" | "portfolio";
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  theme: string;
  coverImage: string | null;
  views: number;
  likes: number;
  content: string;
  ownerName?: string;
};

type EventContent = {
  hero: { title: string; eyebrow: string; tagline: string; ctaPrimary: string; ctaSecondary: string };
  category?: string;
  sectionLabels?: { speakers?: string; agenda?: string; sponsors?: string; stats?: string; gallery?: string };
  stats: Array<{ value: string; label: string }>;
  speakers: Array<{ name: string; role: string; studio: string }>;
  agenda: Array<{ time: string; title: string; track: string; country: string; city: string; date: string }>;
  sponsors: Array<{ name: string; logo: string }>;
  gallery?: Array<{ src: string; caption: string; alt: string }>;
};

type PortfolioContent = {
  hero: { title: string; eyebrow: string; tagline: string; ctaPrimary: string; ctaSecondary: string };
  sectionLabels?: { selected_work?: string; about?: string; services?: string; contact?: string; gallery?: string };
  selected_work: Array<{ title: string; client: string; year: string; description: string; tag: string }>;
  about: { body: string; highlights: string[] };
  services: Array<{ name: string; description: string }>;
  contact: { email: string; phone: string; location: string; socials: Array<{ platform: string; handle: string; url: string }> };
  gallery?: Array<{ src: string; caption: string; alt: string }>;
};

export function PreviewView() {
  const view = useAppStore((s) => s.view);
  const goDashboard = useAppStore((s) => s.goDashboard);
  const goLanding = useAppStore((s) => s.goLanding);
  const pushToast = useAppStore((s) => s.pushToast);
  const user = useAppStore((s) => s.user);
  const { t } = useTranslation();

  const siteId = view.name === "preview" ? view.siteId : "";

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [recordedView, setRecordedView] = useState(false);

  const loadSite = useCallback(async () => {
    try {
      const res = await fetch(`/api/sites/${siteId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSite(data.site);
      }
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    loadSite();
  }, [loadSite]);

  // Record a view (only once)
  useEffect(() => {
    if (site && !recordedView) {
      setRecordedView(true);
      fetch(`/api/sites/${site.id}/view`, { method: "POST" }).catch(() => {});
    }
  }, [site, recordedView]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="flex items-center gap-2 text-sm text-ef-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loadingPreview")}
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 pt-16">
        <p className="text-sm text-ef-muted">{t("common.notFoundDesc")}</p>
        <Button onClick={() => goDashboard()} variant="outline">
          <ArrowLeft className="mr-1 h-4 w-4" /> {t("nav.dashboard")}
        </Button>
      </div>
    );
  }

  const themeClass = {
    aurora: { bg: "bg-gradient-to-br from-[#0d2818] via-[#0d2818] to-[#96a131]", text: "text-white" },
    noir: { bg: "bg-gradient-to-br from-[#000900] to-[#0d2818]", text: "text-white" },
    sunset: { bg: "bg-gradient-to-br from-[#96a131] to-[#000900]", text: "text-white" },
    mint: { bg: "bg-gradient-to-br from-[#f0faf4] to-[#96a131]", text: "text-white" },
    crimson: { bg: "bg-gradient-to-br from-[#0d2818] to-[#96a131]", text: "text-white" },
  }[site.theme] ?? { bg: "bg-gradient-to-br from-[#0d2818] to-[#96a131]", text: "text-white" };

  let content: EventContent | PortfolioContent | null = null;
  try {
    content = JSON.parse(site.content);
  } catch {
    content = null;
  }

  const isOwner = user?.id && siteId;

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    try {
      const res = await fetch(`/api/sites/${site.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSite((s) => (s ? { ...s, likes: data.likes } : s));
      }
    } catch {
      setLiked(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Preview toolbar */}
      <div className="sticky top-16 z-30 border-b border-ef-line/40 bg-ef-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button onClick={() => goDashboard()} variant="ghost" size="sm" className="text-ef-muted hover:text-ef-ink">
              <ArrowLeft className="mr-1 h-4 w-4" /> {t("nav.dashboard")}
            </Button>
            <span className="font-mono text-[10px] text-ef-muted">
              /{site.slug}
            </span>
            {site.coverImage && (
              <span className="rounded-full border border-ef-amber/30 px-2 py-0.5 text-[9px] text-ef-amber">
                {t("hero.livePreview")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-md border border-ef-line px-2 py-1 text-[10px] text-ef-muted">
              <Eye className="h-3 w-3" /> {site.views}
            </span>
            <span className="flex items-center gap-1 rounded-md border border-ef-line px-2 py-1 text-[10px] text-ef-muted">
              <Heart className="h-3 w-3" /> {site.likes}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-ef-line text-ef-ink hover:bg-ef-surface"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/${site.slug}`);
                pushToast({ title: t("public.copied"), variant: "success" });
              }}
            >
              <Share2 className="mr-1 h-3.5 w-3.5" /> {t("public.share")}
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8"
      >
        {/* Hero */}
        <div className={`relative overflow-hidden rounded-3xl ${themeClass.bg} aspect-[16/10] sm:aspect-[2/1]`}>
          {site.coverImage && (
            <img
              src={site.coverImage}
              alt={site.title}
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div className="absolute inset-0 ef-grid-bg opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-6 sm:p-10">
            <div className="flex items-start justify-between">
              <span className={`font-mono text-[10px] uppercase tracking-widest ${themeClass.text} opacity-80`}>
                {(content as EventContent | PortfolioContent | null)?.hero?.eyebrow || site.subtitle || ""}
              </span>
              <span className={`rounded-full border border-white/20 px-2.5 py-0.5 text-[10px] ${themeClass.text} backdrop-blur`}>
                {site.type === "event" ? t("dash.event") : t("dash.portfolio")}
              </span>
            </div>
            <div>
              <h1 className={`text-3xl font-semibold tracking-tight ${themeClass.text} sm:text-5xl lg:text-6xl`}>
                {(content as EventContent | PortfolioContent | null)?.hero?.title || site.title}
              </h1>
              <p className={`mt-3 max-w-xl text-sm ${themeClass.text} opacity-80 sm:text-base`}>
                {(content as EventContent | PortfolioContent | null)?.hero?.tagline || site.description || site.subtitle}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button className="rounded-lg bg-white/90 px-4 py-2 text-xs font-medium text-black hover:bg-white">
                  {(content as EventContent | PortfolioContent | null)?.hero?.ctaPrimary || t("editor.primaryCta")}
                </button>
                <button className="rounded-lg border border-white/40 px-4 py-2 text-xs font-medium text-white backdrop-blur hover:bg-white/10">
                  {(content as EventContent | PortfolioContent | null)?.hero?.ctaSecondary || t("editor.secondaryCta")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="mt-8">
          {site.type === "event" && content && "speakers" in content && (
            <EventSections content={content as EventContent} themeClass={themeClass} />
          )}
          {site.type === "portfolio" && content && "selected_work" in content && (
            <PortfolioSections content={content as PortfolioContent} />
          )}
        </div>

        {/* Like & share band */}
        <div className="mt-12 flex items-center justify-between rounded-2xl border border-ef-line bg-ef-surface/40 p-4">
          <div>
            <p className="text-sm font-medium text-ef-ink">{t("public.enjoyed")}</p>
            <p className="text-xs text-ef-muted">
              {t("public.madeWith")} · {t("public.by")} {site.ownerName ?? "an anonymous maker"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleLike}
              variant={liked ? "default" : "outline"}
              size="sm"
              className={
                liked
                  ? "bg-ef-amber text-ef-bg hover:bg-ef-amber/90"
                  : "border-ef-line text-ef-ink hover:bg-ef-surface"
              }
            >
              <Heart className={`mr-1 h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
              {liked ? t("public.liked") : t("public.like")} · {site.likes}
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/${site.slug}`);
                pushToast({ title: t("public.copied"), variant: "success" });
              }}
              variant="outline"
              size="sm"
              className="border-ef-line text-ef-ink hover:bg-ef-surface"
            >
              <Share2 className="mr-1 h-3.5 w-3.5" /> {t("public.share")}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function EventSections({ content, themeClass }: { content: EventContent; themeClass: { bg: string; text: string } }) {
  const { t } = useTranslation();
  const labels = content.sectionLabels ?? {};
  const speakersLabel = labels.speakers || "Speakers";
  const agendaLabel = labels.agenda || "Agenda";
  const sponsorsLabel = labels.sponsors || "Sponsors";
  return (
    <div className="space-y-12">
      {content.stats.length > 0 && (
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ef-line bg-ef-line/40 sm:grid-cols-4">
          {content.stats.map((s, i) => (
            <div key={i} className="bg-ef-bg p-5 text-center">
              <p className="text-3xl font-semibold tracking-tight text-ef-ink">{s.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-ef-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {content.speakers.length > 0 && (
        <Section title={speakersLabel} eyebrow={`( ${speakersLabel} )`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.speakers.map((s, i) => (
              <div key={i} className="rounded-2xl border border-ef-line bg-ef-surface/40 p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#96a131] to-[#0d2818] text-base font-semibold text-ef-bg">
                  {s.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <p className="mt-3 text-base font-medium text-ef-ink">{s.name}</p>
                <p className="text-xs text-ef-amber">{s.role}</p>
                <p className="mt-1 text-xs text-ef-muted">{s.studio}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {content.agenda.length > 0 && (
        <Section title={agendaLabel} eyebrow={`( ${agendaLabel} )`}>
          <div className="overflow-hidden rounded-2xl border border-ef-line bg-ef-bg">
            {content.agenda.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 p-4 ${
                  i > 0 ? "border-t border-ef-line/40" : ""
                }`}
              >
                <div>
                  <span className="font-mono text-base text-ef-amber">{a.time}</span>
                  {a.date && <p className="text-xs text-ef-muted">{a.date}</p>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ef-ink">{a.title}</p>
                  <p className="text-xs text-ef-muted">{a.track}</p>
                  {(a.country || a.city) && (
                    <p className="mt-1 text-xs text-ef-muted">📍 {a.city}{a.city && a.country ? ", " : ""}{a.country}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {content.sponsors.length > 0 && (
        <Section title={sponsorsLabel} eyebrow={`( ${sponsorsLabel} )`}>
          <div className="flex flex-wrap gap-4">
            {content.sponsors.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-ef-line bg-ef-surface/60 px-4 py-3">
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
        <Section title={(content.sectionLabels?.gallery) || "Gallery"} eyebrow={`( ${(content.sectionLabels?.gallery) || "Gallery"} )`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {content.gallery.map((g, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-ef-line bg-ef-surface/40">
                <div className="relative aspect-[4/3]">
                  <img
                    src={g.src}
                    alt={g.alt || g.caption || `Gallery image ${i + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                {g.caption && (
                  <p className="border-t border-ef-line/40 px-3 py-2 text-xs text-ef-muted">{g.caption}</p>
                )}
              </div>
            ))}
          </div>
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
              {t("public.reserveSeat", { title: content.hero.title })}
            </p>
          </div>
          <button className={`rounded-lg bg-white/90 px-5 py-2.5 text-sm font-medium text-black hover:bg-white ${themeClass.text}`}>
            {content.hero.ctaPrimary}
          </button>
        </div>
      </div>
    </div>
  );
}

function PortfolioSections({ content }: { content: PortfolioContent }) {
  const { t } = useTranslation();
  const labels = content.sectionLabels ?? {};
  const workLabel = labels.selected_work || "Selected work";
  const aboutLabel = labels.about || "About";
  const servicesLabel = labels.services || "Services";
  const contactLabel = labels.contact || "Contact";
  return (
    <div className="space-y-12">
      {content.selected_work.length > 0 && (
        <Section title={workLabel} eyebrow={`( ${workLabel} )`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {content.selected_work.map((w, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-ef-line bg-ef-surface/40">
                <div className="relative aspect-[16/10] bg-gradient-to-br from-[#96a131]/20 to-[#0d2818]/20">
                  <div className="absolute inset-0 ef-grid-bg opacity-20" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white backdrop-blur">
                    {w.tag}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-base font-medium text-ef-ink">{w.title}</p>
                    <span className="font-mono text-[10px] text-ef-muted">{w.year}</span>
                  </div>
                  <p className="text-[10px] text-ef-amber">{w.client}</p>
                  <p className="mt-2 text-sm text-ef-muted">{w.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {(content.about.body || content.about.highlights.length > 0) && (
        <Section title={aboutLabel} eyebrow={`( ${aboutLabel} )`}>
          <div className="rounded-2xl border border-ef-line bg-ef-surface/40 p-6 sm:p-8">
            <p className="text-base text-ef-ink/90">{content.about.body}</p>
            {content.about.highlights.length > 0 && (
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

      {content.services.length > 0 && (
        <Section title={servicesLabel} eyebrow={`( ${servicesLabel} )`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {content.services.map((s, i) => (
              <div key={i} className="rounded-2xl border border-ef-line bg-ef-surface/40 p-5">
                <p className="text-base font-medium text-ef-ink">{s.name}</p>
                <p className="mt-1 text-sm text-ef-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {(content.contact.email || content.contact.phone || content.contact.location || content.contact.socials.length > 0) && (
        <Section title={contactLabel} eyebrow={`( ${contactLabel} )`}>
          <div className="rounded-2xl border border-ef-line bg-ef-surface/40 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-6">
              {content.contact.email && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ef-muted">{t("editor.email")}</p>
                  <p className="text-base text-ef-ink">{content.contact.email}</p>
                </div>
              )}
              {content.contact.phone && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ef-muted">{t("editor.phone")}</p>
                  <p className="text-base text-ef-ink">{content.contact.phone}</p>
                </div>
              )}
              {content.contact.location && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ef-muted">{t("editor.location")}</p>
                  <p className="text-base text-ef-ink">{content.contact.location}</p>
                </div>
              )}
            </div>
            {content.contact.socials.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {content.contact.socials.map((s, i) => (
                  s.url ? (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-ef-line bg-ef-surface/60 px-3 py-1 text-xs text-ef-amber transition-colors hover:bg-ef-surface"
                    >
                      {s.platform} · {s.handle} ↗
                    </a>
                  ) : (
                    <span
                      key={i}
                      className="rounded-md border border-ef-line bg-ef-surface/60 px-3 py-1 text-xs text-ef-ink"
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
        <Section title={(content.sectionLabels?.gallery) || "Gallery"} eyebrow={`( ${(content.sectionLabels?.gallery) || "Gallery"} )`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {content.gallery.map((g, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-ef-line bg-ef-surface/40">
                <div className="relative aspect-[4/3]">
                  <img
                    src={g.src}
                    alt={g.alt || g.caption || `Gallery image ${i + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                {g.caption && (
                  <p className="border-t border-ef-line/40 px-3 py-2 text-xs text-ef-muted">{g.caption}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ef-amber">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ef-ink sm:text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
