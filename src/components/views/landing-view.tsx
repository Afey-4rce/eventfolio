"use client";

import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Play,
  Star,
  Calendar,
  Briefcase,
  Wand2,
  Palette,
  Globe,
  Zap,
  Check,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

type ExploreSite = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  type: string;
  theme: string;
  coverImage: string | null;
  views: number;
  likes: number;
  ownerName: string | null;
  createdAt: string;
};

function themeGradient(theme: string): string {
  return theme === "aurora"
    ? "bg-gradient-to-br from-[#0d2818] via-[#0d2818] to-[#96a131]"
    : theme === "noir"
      ? "bg-gradient-to-br from-[#000900] to-[#0d2818]"
      : theme === "sunset"
        ? "bg-gradient-to-br from-[#96a131] to-[#000900]"
        : theme === "mint"
          ? "bg-gradient-to-br from-[#f0faf4] to-[#96a131]"
          : "bg-gradient-to-br from-[#0d2818] to-[#96a131]";
}

export function LandingView() {
  const goAuth = useAppStore((s) => s.goAuth);
  const goDashboard = useAppStore((s) => s.goDashboard);
  const user = useAppStore((s) => s.user);

  const ctaClick = () => (user ? goDashboard() : goAuth("signup"));

  return (
    <div className="min-h-screen pt-16">
      <Hero ctaClick={ctaClick} />
      <Marquee />
      <Showcase />
      <ExploreGallery />
      <Features />
      <HowItWorks />
      <TemplatesPreview />
      <StatsBand />
      <Pricing ctaClick={ctaClick} />
      <Testimonials />
      <WorksCarousel />
      <FAQSection />
      <FinalCTA ctaClick={ctaClick} />
    </div>
  );
}

function Hero({ ctaClick }: { ctaClick: () => void }) {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 ef-grid-bg opacity-50" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-ef-amber/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-ef-violet/20 blur-[120px]" />
      <div className="ef-grain absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ef-line bg-ef-surface/60 px-3 py-1 text-xs font-medium text-ef-muted backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ef-amber opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ef-amber" />
            </span>
            {t("hero.badge")}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-5xl text-balance text-5xl font-semibold leading-[0.95] tracking-tight text-ef-ink sm:text-6xl lg:text-7xl xl:text-[88px]"
        >
          {t("hero.title1")}
          <br />
          {t("hero.title2")}
          <br />
          <span className="ef-text-gradient">{t("hero.title3")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 max-w-2xl text-pretty text-lg text-ef-ink/70 sm:text-xl"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
        >
          <Button
            onClick={ctaClick}
            size="lg"
            className="group bg-ef-ink text-ef-bg hover:bg-ef-ink/90"
          >
            {t("hero.startFree")}
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button size="lg" variant="outline" className="border-ef-line text-ef-ink hover:bg-ef-surface">
            <Play className="mr-1.5 h-4 w-4" />
            {t("hero.watchTour")}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex items-center gap-4 text-xs text-ef-muted"
        >
          <div className="flex -space-x-2">
            {["ML", "HT", "AK", "LK", "RV"].map((i) => (
              <span
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ef-bg bg-gradient-to-br from-[#96a131] to-[#0d2818] text-[10px] font-semibold text-ef-bg"
              >
                {i}
              </span>
            ))}
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-ef-ink">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-ef-amber text-ef-amber" />
              ))}
              <span className="ml-1 text-xs font-medium">4.9</span>
            </span>
            <span>{t("hero.rating")}</span>
          </div>
        </motion.div>
      </div>

      {/* Hero preview mock */}
      <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl border border-ef-line bg-ef-surface/60 shadow-2xl backdrop-blur"
        >
          <div className="flex items-center gap-1.5 border-b border-ef-line/60 px-4 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-ef-amber/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-ef-amber/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-ef-amber/60" />
            <span className="ml-3 font-mono text-[11px] text-ef-muted">
              eventfolio.app/design-fringe-2025
            </span>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#96a131]/10 to-[#0d2818]/10">
            <div className="absolute inset-0 ef-grid-bg opacity-30" />
            <div className="relative flex h-full flex-col justify-between p-6 sm:p-10">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ef-amber">
                    Mar 14 — 16 · Lisbon
                  </span>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ef-ink sm:text-3xl">
                    Design Fringe 2025
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-ef-muted">
                    A 3-day festival on the edges of contemporary design.
                  </p>
                </div>
                <span className="rounded-full border border-ef-line bg-ef-surface/80 px-2.5 py-1 text-[10px] text-ef-muted">
                  {t("hero.livePreview")}
                </span>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {["Type", "Material", "Brand", "Research"].map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-ef-line bg-ef-surface/60 px-2.5 py-1 text-[10px] text-ef-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-ef-ink px-3 py-1.5 text-[11px] font-medium text-ef-bg">
                  Reserve a seat <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Marquee() {
  const { t } = useTranslation();
  const marqueeItems = [
    t("marquee.conference"),
    t("marquee.workshop"),
    t("marquee.festival"),
    t("marquee.designer"),
    t("marquee.photographer"),
    t("marquee.studio"),
    t("marquee.meetup"),
    t("marquee.talk"),
    t("marquee.exhibition"),
    t("marquee.retrospective"),
    t("marquee.index"),
    t("marquee.showcase"),
  ];
  return (
    <section className="border-y border-ef-line/40 bg-ef-surface/40 py-5">
      <div className="relative flex overflow-hidden">
        {/* Edge fades so marquee text appears/disappears smoothly */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-ef-bg to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-ef-bg to-transparent" />
        <div className="ef-marquee ef-marquee-fast flex items-center gap-8 whitespace-nowrap pr-8">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-8 text-xl font-medium text-ef-ink/70">
              <span>{item}</span>
              <span className="text-ef-amber">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  const { t } = useTranslation();
  const showcaseItems = [
    {
      title: "Design Fringe 2025",
      type: t("explore.event"),
      tag: t("marquee.festival"),
      accent: "from-[#96a131] via-[#0d2818] to-[#000900]",
      description: "A 3-day festival on the edges of contemporary design.",
      author: "Maya Lin",
    },
    {
      title: "Atlas Studio",
      type: t("explore.portfolio"),
      tag: t("marquee.studio"),
      accent: "from-[#0d2818] via-[#000900] to-[#000900]",
      description: "Brand systems & visual identities for ambitious teams.",
      author: "Atlas",
    },
    {
      title: "Lisbo Type",
      type: t("explore.event"),
      tag: t("marquee.conference"),
      accent: "from-[#f0faf4] via-[#96a131] to-[#0d2818]",
      description: "Iberian type conference · 14 speakers · 3 workshops.",
      author: "Lisbo Type",
    },
    {
      title: "Fringe Co.",
      type: t("explore.portfolio"),
      tag: t("marquee.photographer"),
      accent: "from-[#0d2818] via-[#96a131] to-[#f0faf4]",
      description: "Long-form documentary photography from the borders.",
      author: "Fringe",
    },
    {
      title: "Workshop 09",
      type: t("explore.event"),
      tag: t("marquee.workshop"),
      accent: "from-[#000900] via-[#0d2818] to-[#96a131]",
      description: "Hands-on risograph workshop · 12 seats · 2 days.",
      author: "Workshop 09",
    },
    {
      title: "Studio Index",
      type: t("explore.portfolio"),
      tag: t("marquee.designer"),
      accent: "from-[#f0faf4] via-[#96a131] to-[#0d2818]",
      description: "A curated index of independent design studios worldwide.",
      author: "Index",
    },
  ];
  return (
    <section id="showcase" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-ef-amber">
            {t("showcase.eyebrow")}
          </span>
          <h2 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight text-ef-ink sm:text-5xl">
            {t("showcase.title")}
          </h2>
          <p className="mt-4 max-w-xl text-ef-muted">
            {t("showcase.subtitle")}
          </p>
        </div>
        <a href="#templates" className="text-sm text-ef-muted hover:text-ef-ink">
          {t("showcase.seeAll")} →
        </a>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {showcaseItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-ef-line bg-ef-surface"
          >
            <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${item.accent}`}>
              <div className="absolute inset-0 ef-grid-bg opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
                {item.type}
              </span>
              <span className="absolute right-4 top-4 rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-white backdrop-blur">
                {item.tag}
              </span>
              <ArrowUpRight className="absolute bottom-4 right-4 h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold tracking-tight text-ef-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-ef-muted">{item.description}</p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-ef-muted/70">
                {t("public.by")} {item.author}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ExploreGallery() {
  const { t } = useTranslation();
  const [sites, setSites] = useState<ExploreSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sites/explore")
      .then((r) => r.json())
      .then((data: { sites?: ExploreSite[] }) => {
        if (cancelled) return;
        setSites(data.sites ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSites([]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Vary cover aspect ratios so the masonry has rhythm.
  const aspectFor = (i: number) =>
    i % 3 === 0 ? "aspect-[4/3]" : i % 3 === 1 ? "aspect-[3/4]" : "aspect-[1/1]";

  return (
    <section id="explore" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-ef-amber">
            {t("explore.eyebrow")}
          </span>
          <h2 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight text-ef-ink sm:text-5xl">
            {t("explore.title")}
          </h2>
          <p className="mt-4 max-w-xl text-ef-muted">
            {t("showcase.subtitle")}
          </p>
        </div>
        <a href="/explore" className="group inline-flex items-center gap-1 text-sm text-ef-muted hover:text-ef-ink">
          {t("showcase.seeAll")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      {loading ? (
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`mb-4 break-inside-avoid rounded-2xl border border-ef-line bg-ef-surface/40 ${aspectFor(
                i,
              )} animate-pulse`}
            />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ef-line bg-ef-surface/30 p-12 text-center">
          <p className="text-sm text-ef-ink/70">
            No public sites yet — be the first.
          </p>
        </div>
      ) : (
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {sites.map((s, i) => {
            const hasImage =
              !!s.coverImage &&
              (s.coverImage.startsWith("data:") ||
                s.coverImage.startsWith("http"));
            return (
              <motion.a
                key={s.id}
                href={`/${s.slug}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.05 }}
                className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-ef-line bg-ef-surface transition-all duration-300 hover:-translate-y-1 hover:border-ef-line/80 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]"
              >
                <div
                  className={`relative overflow-hidden ${aspectFor(i)} ${themeGradient(
                    s.theme,
                  )}`}
                >
                  <div className="absolute inset-0 ef-grid-bg opacity-20" />
                  {hasImage && (
                    <img
                      src={s.coverImage as string}
                      alt={s.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
                    {s.type}
                  </span>
                  <span className="absolute right-4 top-4 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium capitalize text-white backdrop-blur">
                    {s.theme}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold tracking-tight text-ef-ink">
                    {s.title}
                  </h3>
                  {s.subtitle && (
                    <p className="mt-1 line-clamp-2 text-sm text-ef-muted">
                      {s.subtitle}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-[11px] text-ef-muted">
                    <span className="font-mono">
                      {s.ownerName ?? "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      {s.views.toLocaleString()} {t("explore.views").toLowerCase()}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-ef-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {t("explore.viewPage")}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Features() {
  const { t } = useTranslation();
  const features = [
    {
      icon: Wand2,
      title: t("features.describeShip.title"),
      body: t("features.describeShip.body"),
    },
    {
      icon: Palette,
      title: t("features.themes.title"),
      body: t("features.themes.body"),
    },
    {
      icon: Globe,
      title: t("features.publicLink.title"),
      body: t("features.publicLink.body"),
    },
    {
      icon: Zap,
      title: t("features.fast.title"),
      body: t("features.fast.body"),
    },
    {
      icon: Briefcase,
      title: t("features.twoProducts.title"),
      body: t("features.twoProducts.body"),
    },
    {
      icon: Sparkles,
      title: t("features.aiImages.title"),
      body: t("features.aiImages.body"),
    },
  ];
  return (
    <section id="features" className="border-y border-ef-line/40 bg-ef-surface/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-ef-amber">
            {t("features.eyebrow")}
          </span>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ef-ink sm:text-5xl">
            {t("features.title")}
          </h2>
          <p className="mt-4 text-ef-muted">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ef-line bg-ef-line sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative bg-ef-bg p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-ef-surface/80 sm:p-8"
            >
              <f.icon className="h-5 w-5 text-ef-amber transition-transform duration-300 group-hover:scale-110" />
              <h3 className="mt-4 text-base font-semibold tracking-tight text-ef-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ef-muted">{f.body}</p>
              <div className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-gradient-to-r from-[#96a131] to-[#0d2818] transition-transform duration-300 group-hover:scale-x-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useTranslation();
  const steps = [
    {
      n: "01",
      title: t("how.step1.title"),
      body: t("how.step1.body"),
      icon: Briefcase,
    },
    {
      n: "02",
      title: t("how.step2.title"),
      body: t("how.step2.body"),
      icon: Wand2,
    },
    {
      n: "03",
      title: t("how.step3.title"),
      body: t("how.step3.body"),
      icon: Palette,
    },
    {
      n: "04",
      title: t("how.step4.title"),
      body: t("how.step4.body"),
      icon: Globe,
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-ef-amber">
          {t("how.eyebrow")}
        </span>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ef-ink sm:text-5xl">
          {t("how.title")}
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="relative rounded-2xl border border-ef-line bg-ef-surface/40 p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-3xl font-semibold text-ef-line">{s.n}</span>
              <s.icon className="h-5 w-5 text-ef-amber" />
            </div>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-ef-ink">{s.title}</h3>
            <p className="mt-2 text-sm text-ef-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TemplatesPreview() {
  const { goAuth, user, goDashboard } = useAppStore();
  const { t } = useTranslation();
  const click = () => (user ? goDashboard() : goAuth("signup"));
  const templates = [
    {
      title: "Design Fringe 2025",
      type: t("explore.event"),
      tag: t("marquee.festival"),
      accent: "from-[#96a131] via-[#0d2818] to-[#000900]",
    },
    {
      title: "Atlas Studio",
      type: t("explore.portfolio"),
      tag: t("marquee.studio"),
      accent: "from-[#0d2818] via-[#000900] to-[#000900]",
    },
    {
      title: "Lisbo Type",
      type: t("explore.event"),
      tag: t("marquee.conference"),
      accent: "from-[#f0faf4] via-[#96a131] to-[#0d2818]",
    },
    {
      title: "Fringe Co.",
      type: t("explore.portfolio"),
      tag: t("marquee.photographer"),
      accent: "from-[#0d2818] via-[#96a131] to-[#f0faf4]",
    },
    {
      title: "Workshop 09",
      type: t("explore.event"),
      tag: t("marquee.workshop"),
      accent: "from-[#000900] via-[#0d2818] to-[#96a131]",
    },
    {
      title: "Studio Index",
      type: t("explore.portfolio"),
      tag: t("marquee.designer"),
      accent: "from-[#f0faf4] via-[#96a131] to-[#0d2818]",
    },
  ];
  return (
    <section id="templates" className="border-y border-ef-line/40 bg-ef-surface/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-ef-amber">
              {t("templates.eyebrow")}
            </span>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ef-ink sm:text-5xl">
              {t("templates.title")}
            </h2>
          </div>
          <Button onClick={click} variant="outline" className="border-ef-line text-ef-ink hover:bg-ef-surface">
            {t("templates.browseAll")}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {templates.slice(0, 6).map((tpl, i) => (
            <div
              key={tpl.title}
              className="group relative overflow-hidden rounded-xl border border-ef-line bg-ef-bg transition-transform duration-300 hover:-translate-y-1"
            >
              <div
                className={`relative ${i % 3 === 1 ? "aspect-[16/12]" : "aspect-[16/10]"} bg-gradient-to-br ${tpl.accent}`}
              >
                <div className="absolute inset-0 ef-grid-bg opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-end p-4">
                  <h3 className="text-sm font-semibold text-white drop-shadow-sm">{tpl.title}</h3>
                </div>
                {/* Glassmorphism hover overlay with Preview affordance */}
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white">
                    <Play className="h-3 w-3" />
                    {t("templates.preview")}
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-[10px] uppercase tracking-wider text-ef-muted">{tpl.tag}</span>
                <span className="text-[10px] text-ef-muted">{tpl.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBand() {
  const { t } = useTranslation();
  const stats = [
    { target: 12000, suffix: "+", prefix: "", label: t("stats.pagesShipped"), decimals: 0 },
    { target: 180, suffix: "+", prefix: "", label: t("stats.cities"), decimals: 0 },
    { target: 94, suffix: "", prefix: "", label: t("stats.lighthouse"), decimals: 0 },
    { target: 4.9, suffix: "", prefix: "", label: t("stats.rating"), decimals: 1 },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-ef-line bg-ef-surface/40 p-8 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-semibold tracking-tight text-ef-ink sm:text-4xl">
              <AnimatedCounter target={s.target} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-ef-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Counts up from 0 to `target` when the element scrolls into view.
 * Uses IntersectionObserver to trigger the animation once.
 */
function AnimatedCounter({
  target,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1500,
}: {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

function Pricing({ ctaClick }: { ctaClick: () => void }) {
  const { t } = useTranslation();
  const plans = [
    {
      name: t("pricing.fringe.name"),
      price: "$0",
      period: t("pricing.forever"),
      description: t("pricing.fringe.desc"),
      features: [
        t("pricing.f1"),
        t("pricing.f2"),
        t("pricing.f3"),
        t("pricing.f4"),
        t("pricing.f5"),
      ],
      cta: t("pricing.fringe.cta"),
      highlight: false,
    },
    {
      name: t("pricing.studio.name"),
      price: "$19",
      period: t("pricing.month"),
      description: t("pricing.studio.desc"),
      features: [
        t("pricing.s1"),
        t("pricing.s2"),
        t("pricing.s3"),
        t("pricing.s4"),
        t("pricing.s5"),
        t("pricing.s6"),
      ],
      cta: t("pricing.studio.cta"),
      highlight: true,
    },
    {
      name: t("pricing.atelier.name"),
      price: "$49",
      period: t("pricing.month"),
      description: t("pricing.atelier.desc"),
      features: [
        t("pricing.a1"),
        t("pricing.a2"),
        t("pricing.a3"),
        t("pricing.a4"),
        t("pricing.a5"),
        t("pricing.a6"),
      ],
      cta: t("pricing.atelier.cta"),
      highlight: false,
    },
  ];
  return (
    <section id="pricing" className="relative border-y border-ef-line/40 bg-ef-surface/30">
      <div className="ef-grain absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-ef-amber">
            {t("pricing.eyebrow")}
          </span>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ef-ink sm:text-5xl">
            {t("pricing.title")}
          </h2>
          <p className="mt-4 text-ef-muted">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl p-6 ${
                p.highlight
                  ? "border-2 border-ef-amber bg-gradient-to-b from-ef-amber/5 to-ef-bg shadow-[0_0_40px_-12px_rgba(150,161,49,0.3)]"
                  : "border border-ef-line bg-ef-surface/40"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-ef-amber px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ef-bg">
                  {t("pricing.studio.popular")}
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-ef-ink">{p.name}</h3>
                <div className="text-right">
                  <span className="text-3xl font-semibold tracking-tight text-ef-ink">{p.price}</span>
                  <span className="ml-1 text-xs text-ef-muted">{p.period}</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-ef-muted">{p.description}</p>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-ef-ink/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ef-amber" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={ctaClick}
                className={`mt-6 w-full ${
                  p.highlight
                    ? "bg-ef-ink text-ef-bg hover:bg-ef-ink/90"
                    : ""
                }`}
                variant={p.highlight ? "default" : "outline"}
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { t } = useTranslation();
  const items = [
    {
      quote: t("testimonials.t1.quote"),
      name: t("testimonials.t1.name"),
      role: t("testimonials.t1.role"),
    },
    {
      quote: t("testimonials.t2.quote"),
      name: t("testimonials.t2.name"),
      role: t("testimonials.t2.role"),
    },
    {
      quote: t("testimonials.t3.quote"),
      name: t("testimonials.t3.name"),
      role: t("testimonials.t3.role"),
    },
  ];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance every 5 seconds (pauses on hover)
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  const goPrev = () => setActive((prev) => (prev - 1 + items.length) % items.length);
  const goNext = () => setActive((prev) => (prev + 1) % items.length);

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-ef-amber">
            {t("testimonials.eyebrow")}
          </span>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ef-ink sm:text-5xl">
            {t("testimonials.title")}
          </h2>
        </div>
        {/* Prev/next controls — desktop only */}
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={goPrev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ef-line text-ef-muted transition-colors hover:border-ef-amber hover:text-ef-amber"
            aria-label={t("testimonials.prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goNext}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ef-line text-ef-muted transition-colors hover:border-ef-amber hover:text-ef-amber"
            aria-label={t("testimonials.next")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carousel — single featured card on mobile, grid on desktop */}
      <div className="mt-10">
        {/* Desktop: grid with all 3 */}
        <div className="hidden gap-4 md:grid md:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={item.name}
              className={`rounded-2xl border bg-ef-surface/40 p-6 transition-all duration-300 ${
                i === active ? "border-ef-amber/60 shadow-[0_0_30px_-8px_rgba(150,161,49,0.2)]" : "border-ef-line opacity-60"
              }`}
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-3 w-3 fill-ef-amber text-ef-amber" />
                ))}
              </div>
              <p className="mt-4 text-pretty text-sm text-ef-ink/90">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#96a131] to-[#0d2818] text-[10px] font-semibold text-ef-bg">
                  {item.name.split(" ").map((p) => p[0]).join("")}
                </span>
                <div>
                  <p className="text-xs font-medium text-ef-ink">{item.name}</p>
                  <p className="text-[10px] text-ef-muted">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: single rotating card */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-ef-amber/60 bg-ef-surface/40 p-6"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-3 w-3 fill-ef-amber text-ef-amber" />
                ))}
              </div>
              <p className="mt-4 text-pretty text-sm text-ef-ink/90">&ldquo;{items[active].quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#96a131] to-[#0d2818] text-[10px] font-semibold text-ef-bg">
                  {items[active].name.split(" ").map((p) => p[0]).join("")}
                </span>
                <div>
                  <p className="text-xs font-medium text-ef-ink">{items[active].name}</p>
                  <p className="text-[10px] text-ef-muted">{items[active].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-8 bg-ef-amber" : "w-1.5 bg-ef-line hover:bg-ef-muted"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Infinite-loop works carousel ----------
const FALLBACK_WORKS = [
  { title: "Design Fringe 2025", type: "event" as const, theme: "aurora", slug: "design-fringe-2025", coverImage: null },
  { title: "Atlas Studio", type: "portfolio" as const, theme: "noir", slug: "atlas-studio", coverImage: null },
  { title: "Lisbo Type", type: "event" as const, theme: "mint", slug: "lisbo-type", coverImage: null },
  { title: "Fringe Co.", type: "portfolio" as const, theme: "crimson", slug: "fringe-co", coverImage: null },
  { title: "Workshop 09", type: "event" as const, theme: "sunset", slug: "workshop-09", coverImage: null },
  { title: "Studio Index", type: "portfolio" as const, theme: "mint", slug: "studio-index", coverImage: null },
  { title: "Edge Type", type: "event" as const, theme: "aurora", slug: "edge-type", coverImage: null },
  { title: "Mori Lab", type: "portfolio" as const, theme: "noir", slug: "mori-lab", coverImage: null },
];

const THEME_GRADIENTS: Record<string, string> = {
  aurora: "bg-gradient-to-br from-[#0d2818] via-[#0d2818] to-[#96a131]",
  noir: "bg-gradient-to-br from-[#000900] to-[#0d2818]",
  sunset: "bg-gradient-to-br from-[#96a131] to-[#000900]",
  mint: "bg-gradient-to-br from-[#f0faf4] to-[#96a131]",
  crimson: "bg-gradient-to-br from-[#0d2818] to-[#96a131]",
};

function WorksCarousel() {
  const { t } = useTranslation();
  const [works, setWorks] = useState<typeof FALLBACK_WORKS>(FALLBACK_WORKS);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/sites/explore?all=1&sort=views", { cache: "no-store" });
        if (res.ok) {
          const d = await res.json();
          if (!cancelled && Array.isArray(d?.sites) && d.sites.length >= 3) {
            setWorks(d.sites.map((s: { title: string; type: string; theme: string; slug: string; coverImage: string | null }) => ({
              title: s.title, type: s.type, theme: s.theme, slug: s.slug, coverImage: s.coverImage,
            })));
          }
        }
      } catch { /* keep fallbacks */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // Duplicate the array so the marquee loops seamlessly
  const looped = [...works, ...works];

  // Split into two rows for a richer visual
  const row1 = looped;
  const row2 = [...works.slice().reverse(), ...works.slice().reverse()];

  return (
    <section
      className="relative overflow-hidden border-y border-ef-line/40 bg-ef-bg py-20 sm:py-24 lg:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Section header */}
      <div className="mx-auto mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ef-amber">{t("works.eyebrow")}</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ef-ink sm:text-5xl">
          {t("works.title")}
        </h2>
        <p className="mt-3 max-w-xl text-ef-muted">
          {t("works.subtitle")}
        </p>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative mb-4 overflow-hidden">
        <div
          className="ef-marquee flex w-max gap-4"
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          {row1.map((w, i) => (
            <WorkCard key={`r1-${i}`} work={w} />
          ))}
        </div>
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-ef-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-ef-bg to-transparent" />
      </div>

      {/* Row 2 — scrolls right (reverse) */}
      <div className="relative overflow-hidden">
        <div
          className="ef-marquee ef-marquee-reverse flex w-max gap-4"
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          {row2.map((w, i) => (
            <WorkCard key={`r2-${i}`} work={w} variant="tall" />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-ef-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-ef-bg to-transparent" />
      </div>
    </section>
  );
}

function WorkCard({
  work,
  variant = "normal",
}: {
  work: { title: string; type: string; theme: string; slug: string; coverImage: string | null };
  variant?: "normal" | "tall";
}) {
  const { t } = useTranslation();
  const gradient = THEME_GRADIENTS[work.theme] ?? THEME_GRADIENTS.aurora;
  const aspect = variant === "tall" ? "aspect-[3/4]" : "aspect-[4/3]";
  const width = variant === "tall" ? "w-[220px] sm:w-[260px]" : "w-[300px] sm:w-[360px]";

  return (
    <a
      href={`/${work.slug}`}
      className={`group relative ${width} shrink-0 overflow-hidden rounded-2xl border border-ef-line ${aspect} ${gradient}`}
    >
      {work.coverImage && (work.coverImage.startsWith("http") || work.coverImage.startsWith("/") || work.coverImage.startsWith("data:")) && (
        <img
          src={work.coverImage}
          alt={work.title}
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="absolute inset-0 ef-grid-bg opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
          {work.type}
        </span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] capitalize text-white backdrop-blur">
          {work.theme}
        </span>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-lg font-semibold text-white drop-shadow-sm">{work.title}</h3>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-black">{t("works.viewPage")} →</span>
      </div>
    </a>
  );
}

function FAQSection() {
  const { t } = useTranslation();
  const faqItems = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-y border-ef-line/40 bg-ef-surface/30">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="text-center">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-ef-amber">
            {t("faq.eyebrow")}
          </span>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ef-ink sm:text-5xl">
            {t("faq.title")}
          </h2>
        </div>
        <div className="mt-10 divide-y divide-ef-line/40 rounded-2xl border border-ef-line bg-ef-bg">
          {faqItems.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span className="text-sm font-medium text-ef-ink">{item.q}</span>
                {open === i ? (
                  <Minus className="h-4 w-4 shrink-0 text-ef-muted" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0 text-ef-muted" />
                )}
              </button>
              {open === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 pb-5"
                >
                  <p className="text-sm text-ef-muted">{item.a}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ ctaClick }: { ctaClick: () => void }) {
  const { t } = useTranslation();
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="relative overflow-hidden rounded-3xl border border-ef-line bg-gradient-to-br from-[#96a131]/10 to-[#0d2818]/10 p-10 sm:p-16">
        <div className="absolute inset-0 ef-grid-bg opacity-30" />
        <div className="ef-grain absolute inset-0" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-ef-amber/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-ef-violet/20 blur-[120px]" />
        <div className="relative">
          <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-ef-ink sm:text-5xl lg:text-6xl">
            {t("cta.title")}
          </h2>
          <p className="mt-4 max-w-xl text-ef-muted">
            {t("cta.subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button onClick={ctaClick} size="lg" className="group bg-ef-ink text-ef-bg hover:bg-ef-ink/90">
              {t("cta.startFree")}
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <span className="font-mono text-xs text-ef-muted">{t("cta.noCard")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
