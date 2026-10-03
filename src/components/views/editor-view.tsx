"use client";

import { useAppStore } from "@/lib/store";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Wand2,
  Image as ImageIcon,
  Save,
  Eye,
  Globe,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Check,
  X,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { slugify } from "@/lib/helpers";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export type GalleryItem = { src: string; caption: string; alt: string };

type EventContent = {
  hero: { title: string; eyebrow: string; tagline: string; ctaPrimary: string; ctaSecondary: string };
  category?: string;
  sectionLabels?: { speakers?: string; agenda?: string; sponsors?: string; stats?: string; gallery?: string };
  stats: Array<{ value: string; label: string }>;
  speakers: Array<{ name: string; role: string; studio: string }>;
  agenda: Array<{ time: string; title: string; track: string; country: string; city: string; date: string }>;
  sponsors: Array<{ name: string; logo: string }>;
  gallery: GalleryItem[];
};

type PortfolioContent = {
  hero: { title: string; eyebrow: string; tagline: string; ctaPrimary: string; ctaSecondary: string };
  sectionLabels?: { selected_work?: string; about?: string; services?: string; contact?: string; gallery?: string };
  selected_work: Array<{ title: string; client: string; year: string; description: string; tag: string }>;
  about: { body: string; highlights: string[] };
  services: Array<{ name: string; description: string }>;
  contact: { email: string; phone: string; location: string; socials: Array<{ platform: string; handle: string; url: string }> };
  gallery: GalleryItem[];
};

type Site = {
  id: string;
  type: "event" | "portfolio";
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  theme: string;
  coverImage: string | null;
  published: boolean;
  content: string;
};

const DEFAULT_EVENT: EventContent = {
  hero: { title: "", eyebrow: "", tagline: "", ctaPrimary: "Reserve a seat", ctaSecondary: "Learn more" },
  stats: [],
  speakers: [],
  agenda: [],
  sponsors: [],
  gallery: [],
};

const AFRICAN_COUNTRIES = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon",
  "Central African Republic", "Chad", "Comoros", "Congo (Brazzaville)", "Congo (Kinshasa)",
  "Côte d'Ivoire", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia",
  "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya",
  "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia",
  "Niger", "Nigeria", "Rwanda", "São Tomé and Príncipe", "Senegal", "Seychelles", "Sierra Leone",
  "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda",
  "Zambia", "Zimbabwe",
];

const DEFAULT_PORTFOLIO: PortfolioContent = {
  hero: { title: "", eyebrow: "", tagline: "", ctaPrimary: "View work", ctaSecondary: "About" },
  selected_work: [],
  about: { body: "", highlights: [] },
  services: [],
  contact: { email: "", phone: "", location: "", socials: [] },
  gallery: [],
};

export function EditorView() {
  const view = useAppStore((s) => s.view);
  const goDashboard = useAppStore((s) => s.goDashboard);
  const goLanding = useAppStore((s) => s.goLanding);
  const goPreview = useAppStore((s) => s.goPreview);
  const pushToast = useAppStore((s) => s.pushToast);
  const user = useAppStore((s) => s.user);
  const { t } = useTranslation();

  const siteId = view.name === "editor" ? view.siteId : undefined;
  const type = view.name === "editor" ? view.type : "event";

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [eventContent, setEventContent] = useState<EventContent>(DEFAULT_EVENT);
  const [portfolioContent, setPortfolioContent] = useState<PortfolioContent>(DEFAULT_PORTFOLIO);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("aurora");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  // Load site if siteId provided
  const loadSite = useCallback(async () => {
    if (!siteId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/sites/${siteId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const s = data.site;
        setSite(s);
        setTitle(s.title);
        setSubtitle(s.subtitle ?? "");
        setDescription(s.description ?? "");
        setTheme(s.theme);
        setCoverImage(s.coverImage);
        setPublished(s.published);
        try {
          const parsed = JSON.parse(s.content);
          if (s.type === "event") {
            setEventContent({
              ...DEFAULT_EVENT,
              ...parsed,
              hero: { ...DEFAULT_EVENT.hero, ...(parsed.hero ?? {}) },
              sectionLabels: { ...(DEFAULT_EVENT.sectionLabels ?? {}), ...(parsed.sectionLabels ?? {}) },
              stats: parsed.stats ?? [],
              speakers: parsed.speakers ?? [],
              agenda: parsed.agenda ?? [],
              sponsors: parsed.sponsors ?? [],
              gallery: parsed.gallery ?? [],
            });
          } else {
            setPortfolioContent({
              ...DEFAULT_PORTFOLIO,
              ...parsed,
              hero: { ...DEFAULT_PORTFOLIO.hero, ...(parsed.hero ?? {}) },
              sectionLabels: { ...(DEFAULT_PORTFOLIO.sectionLabels ?? {}), ...(parsed.sectionLabels ?? {}) },
              selected_work: parsed.selected_work ?? [],
              about: { ...DEFAULT_PORTFOLIO.about, ...(parsed.about ?? {}) },
              services: parsed.services ?? [],
              contact: { ...DEFAULT_PORTFOLIO.contact, ...(parsed.contact ?? {}) },
              gallery: parsed.gallery ?? [],
            });
          }
          if (parsed?.hero?.tagline) setPrompt(parsed.hero.tagline);
        } catch {
          /* keep defaults */
        }
      }
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (!user) {
      goLanding();
      return;
    }
    loadSite();
  }, [user, goLanding, loadSite]);

  // Save the site (PATCH with current state)
  const save = async (silent = false) => {
    if (!siteId) {
      pushToast({ title: t("editor.createFirst"), variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const content = type === "event" ? eventContent : portfolioContent;
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          description,
          theme,
          coverImage,
          content: JSON.stringify(content),
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        pushToast({ title: "Save failed", description: e?.error, variant: "error" });
        return;
      }
      if (!silent) {
        pushToast({ title: t("editor.saved"), description: t("editor.savedDesc"), variant: "success" });
      }
    } finally {
      setSaving(false);
    }
  };

  // Generate AI content
  const generate = async () => {
    if (!prompt.trim()) {
      pushToast({ title: "Describe your site first", variant: "error" });
      return;
    }
    if (!siteId) {
      pushToast({ title: t("editor.createFirst"), variant: "error" });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, prompt, theme, siteId }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast({
          title: "AI generation failed",
          description: data?.error,
          variant: "error",
        });
        return;
      }
      const c = data.content;
      if (type === "event") {
        setEventContent({
          hero: c.hero ?? DEFAULT_EVENT.hero,
          category: c.category,
          sectionLabels: c.sectionLabels,
          stats: c.stats ?? [],
          speakers: c.speakers ?? [],
          agenda: c.agenda ?? [],
          sponsors: c.sponsors ?? [],
          gallery: c.gallery ?? [],
        });
      } else {
        setPortfolioContent({
          hero: c.hero ?? DEFAULT_PORTFOLIO.hero,
          sectionLabels: c.sectionLabels,
          selected_work: c.selected_work ?? [],
          about: c.about ?? { body: "", highlights: [] },
          services: c.services ?? [],
          contact: c.contact ?? { email: "", phone: "", location: "", socials: [] },
          gallery: c.gallery ?? [],
        });
      }
      // Also update the editor title if empty
      if (!title && c.hero?.title) setTitle(c.hero.title);
      if (!subtitle && c.hero?.tagline) setSubtitle(c.hero.tagline);
      pushToast({
        title: "Content generated",
        description: "Review the fields below and Save when ready.",
        variant: "success",
      });
    } catch (e) {
      pushToast({ title: "Network error", description: String(e), variant: "error" });
    } finally {
      setGenerating(false);
    }
  };

  // Regenerate a single section (speakers/agenda/stats/sponsors/selected_work/services/about)
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const regenerateSection = async (section: string) => {
    if (!siteId) {
      pushToast({ title: t("editor.saveFirst"), variant: "error" });
      return;
    }
    setRegeneratingSection(section);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, section, siteId, theme }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast({ title: "Section regeneration failed", description: data?.error, variant: "error" });
        return;
      }
      // Reload the site content to pick up the merged changes
      const updated = data.content;
      if (type === "event") {
        setEventContent({
          hero: (updated as EventContent).hero ?? eventContent.hero,
          category: (updated as EventContent).category ?? eventContent.category,
          sectionLabels: (updated as EventContent).sectionLabels ?? eventContent.sectionLabels,
          stats: (updated as EventContent).stats ?? eventContent.stats,
          speakers: (updated as EventContent).speakers ?? eventContent.speakers,
          agenda: (updated as EventContent).agenda ?? eventContent.agenda,
          sponsors: (updated as EventContent).sponsors ?? eventContent.sponsors,
          gallery: (updated as EventContent).gallery ?? eventContent.gallery,
        });
      } else {
        setPortfolioContent({
          hero: (updated as PortfolioContent).hero ?? portfolioContent.hero,
          sectionLabels: (updated as PortfolioContent).sectionLabels ?? portfolioContent.sectionLabels,
          selected_work: (updated as PortfolioContent).selected_work ?? portfolioContent.selected_work,
          about: (updated as PortfolioContent).about ?? portfolioContent.about,
          services: (updated as PortfolioContent).services ?? portfolioContent.services,
          contact: (updated as PortfolioContent).contact ?? portfolioContent.contact,
          gallery: (updated as PortfolioContent).gallery ?? portfolioContent.gallery,
        });
      }
      pushToast({
        title: t("editor.speakersRegenerated", { section }),
        description: t("editor.speakersRegenDesc"),
        variant: "success",
      });
    } catch (e) {
      pushToast({ title: "Network error", description: String(e), variant: "error" });
    } finally {
      setRegeneratingSection(null);
    }
  };

  // Generate AI cover image
  const generateImage = async () => {
    if (!siteId) return;
    setGeneratingImage(true);
    try {
      const imgPrompt = type === "event"
        ? `A striking, design-forward hero image for the event: "${title || prompt}". Bold colors, geometric, editorial. No text.`
        : `A minimal, editorial hero image for a creative portfolio called "${title || prompt}". Sophisticated typography-like composition. No text.`;
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imgPrompt, size: "1344x768" }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast({
          title: "Image generation failed",
          description: data?.error,
          variant: "error",
        });
        return;
      }
      setCoverImage(data.url);
      pushToast({ title: t("editor.imageGenerated"), variant: "success" });
    } finally {
      setGeneratingImage(false);
    }
  };

  const togglePublish = async () => {
    if (!siteId) return;
    try {
      const res = await fetch(`/api/sites/${siteId}/publish`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPublished(data.site.published);
        pushToast({
          title: data.site.published ? t("editor.sitePublished") : t("editor.siteUnpublished"),
          description: data.site.published ? `${t("editor.liveAt")} /${data.site.slug}` : undefined,
          variant: "success",
        });
      }
    } catch {
      pushToast({ title: "Failed to toggle publish", variant: "error" });
    }
  };

  // Keyboard shortcuts:
  //   Cmd/Ctrl + S       → save (prevents the browser "save page" dialog)
  //   Cmd/Ctrl + Enter   → generate AI content
  //   Cmd/Ctrl + Shift + P → toggle publish
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      // Don't trigger when the user is typing in a textarea/input and pressing
      // only Cmd+Enter (which some browsers use for newline). We still allow
      // Cmd+S and Cmd+Shift+P everywhere.
      const target = e.target as HTMLElement;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        save(true);
        return;
      }
      if (e.key === "Enter" && !isTyping) {
        e.preventDefault();
        generate();
        return;
      }
      if ((e.key === "p" || e.key === "P") && e.shiftKey) {
        e.preventDefault();
        togglePublish();
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [siteId, title, subtitle, description, theme, coverImage, published, eventContent, portfolioContent, prompt]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="flex items-center gap-2 text-sm text-ef-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loadingEditor")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Editor header */}
      <div className="sticky top-16 z-30 border-b border-ef-line/40 bg-ef-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button onClick={() => goDashboard()} variant="ghost" size="sm" className="text-ef-muted hover:text-ef-ink">
              <ArrowLeft className="mr-1 h-4 w-4" /> {t("editor.back")}
            </Button>
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-ef-amber sm:inline">
              {type === "event" ? t("editor.eventEditor") : t("editor.portfolioEditor")}
            </span>
            <span className="font-mono text-[10px] text-ef-muted">{"/"}</span>
            <span className="font-mono text-[10px] text-ef-muted truncate">
              {site?.slug ?? (slugify(title) || "untitled")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden items-center gap-1 lg:flex" title="Keyboard shortcuts">
              <kbd className="rounded border border-ef-line bg-ef-surface/60 px-1.5 py-0.5 font-mono text-[9px] text-ef-muted">⌘S</kbd>
              <span className="text-[9px] text-ef-muted/60">save</span>
              <kbd className="ml-2 rounded border border-ef-line bg-ef-surface/60 px-1.5 py-0.5 font-mono text-[9px] text-ef-muted">⌘↵</kbd>
              <span className="text-[9px] text-ef-muted/60">generate</span>
            </span>
            <Button
              onClick={() => save(false)}
              disabled={saving}
              variant="outline"
              size="sm"
              className="border-ef-line text-ef-ink hover:bg-ef-surface"
            >
              {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />}
              {t("editor.save")}
            </Button>
            {siteId && (
              <Button
                onClick={() => goPreview(siteId)}
                variant="outline"
                size="sm"
                className="border-ef-line text-ef-ink hover:bg-ef-surface"
              >
                <Eye className="mr-1 h-3.5 w-3.5" /> {t("editor.preview")}
              </Button>
            )}
            <Button
              onClick={togglePublish}
              size="sm"
              className={published ? "bg-ef-amber text-ef-bg hover:bg-ef-amber/90" : "bg-ef-ink text-ef-bg hover:bg-ef-ink/90"}
            >
              <Globe className="mr-1 h-3.5 w-3.5" />
              {published ? t("editor.live") : t("editor.publish")}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-0 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_minmax(360px,420px)] lg:px-8">
        {/* Left: live preview — sticks to the canvas surface (ef-bg) */}
        <div className="order-2 lg:order-2 lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-hidden lg:pr-6">
          <PreviewPane
            type={type}
            title={title}
            subtitle={subtitle}
            theme={theme}
            coverImage={coverImage}
            eventContent={eventContent}
            portfolioContent={portfolioContent}
          />
        </div>

        {/* Right: editor controls — distinct surface + left divider */}
        <div className="order-1 lg:order-1 lg:border-l lg:border-ef-line/60 lg:pl-6">
          <div className="space-y-4 lg:bg-ef-surface/30 lg:-my-6 lg:py-6 lg:pr-1 lg:rounded-l-2xl">
            {/* AI generation card */}
            <Card className="border-ef-line bg-gradient-to-br from-[#96a131]/5 to-[#0d2818]/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-ef-amber" />
                  <CardTitle className="text-sm font-semibold text-ef-ink">{t("editor.aiGenerator")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-ef-muted">
                  {t("editor.aiDesc", {
                    type: (type === "event" ? t("dash.event") : t("dash.portfolio")).toLowerCase(),
                    sections: type === "event" ? "speakers, agenda, sponsors, gallery" : "selected work, about, services, gallery, contact",
                  })}
                </p>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    type === "event"
                      ? "A 2-day design conference in Berlin called Type Fringe. 4 keynote speakers and a workshop track on risograph printing. Mar 14-16."
                      : "An independent designer in Lisbon called Atlas Studio. Focus on brand systems and editorial design. 5 case studies."
                  }
                  className="bg-ef-surface border-ef-line min-h-[100px]"
                />
                <Button
                  onClick={generate}
                  disabled={generating}
                  className="w-full bg-ef-ink text-ef-bg hover:bg-ef-ink/90"
                >
                  {generating ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-1.5 h-4 w-4" />
                  )}
                  {generating ? t("editor.generating") : t("editor.generateContent")}
                </Button>
              </CardContent>
            </Card>

            {/* Cover image card */}
            <Card className="border-ef-line bg-ef-surface/40">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-ef-amber" />
                  <CardTitle className="text-sm font-semibold text-ef-ink">{t("editor.coverImage")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {coverImage ? (
                  <div className="relative overflow-hidden rounded-lg border border-ef-line">
                    <img src={coverImage} alt="Cover preview" className="aspect-[16/9] w-full object-cover" />
                    <button
                      onClick={() => setCoverImage(null)}
                      className="absolute right-2 top-2 rounded-md bg-black/60 p-1 text-white backdrop-blur hover:bg-black/80"
                      aria-label={t("editor.remove")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed border-ef-line bg-ef-surface/40 text-xs text-ef-muted">
                    {t("editor.noCover")}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={generateImage}
                    disabled={generatingImage}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-ef-line text-ef-ink hover:bg-ef-surface"
                  >
                    {generatingImage ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1 h-3.5 w-3.5 text-ef-amber" />
                    )}
                    {generatingImage ? t("editor.generating") : t("editor.generate")}
                  </Button>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = () => setCoverImage(reader.result as string);
                        reader.readAsDataURL(f);
                      }}
                    />
                    <Button variant="outline" size="sm" className="border-ef-line text-ef-ink hover:bg-ef-surface" asChild>
                      <span>{t("editor.upload")}</span>
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Site meta card */}
            <Card className="border-ef-line bg-ef-surface/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-ef-ink">{t("editor.siteDetails")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ef-ink">{t("dash.title")}</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-ef-surface border-ef-line" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ef-ink">{t("dash.subtitle")}</Label>
                  <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="bg-ef-surface border-ef-line" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ef-ink">{t("editor.description")}</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-ef-surface border-ef-line min-h-[60px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ef-ink">{t("dash.theme")}</Label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: "aurora", name: "Aurora", swatch: "from-[#0d2818] to-[#96a131]", ring: "ring-ef-amber" },
                      { id: "noir", name: "Noir", swatch: "from-[#000900] to-[#0d2818]", ring: "ring-ef-amber" },
                      { id: "sunset", name: "Sunset", swatch: "from-[#96a131] to-[#000900]", ring: "ring-ef-amber" },
                      { id: "mint", name: "Mint", swatch: "from-[#f0faf4] to-[#96a131]", ring: "ring-ef-amber" },
                      { id: "crimson", name: "Crimson", swatch: "from-[#0d2818] to-[#96a131]", ring: "ring-ef-amber" },
                    ].map((th) => (
                      <button
                        key={th.id}
                        onClick={() => setTheme(th.id)}
                        title={th.name}
                        className={`group relative flex flex-col items-center gap-1 rounded-md border p-1.5 transition-all ${
                          theme === th.id ? "border-ef-amber ring-1 ring-offset-0 " + th.ring : "border-ef-line hover:border-ef-muted/60"
                        }`}
                      >
                        <span className={`h-8 w-full rounded bg-gradient-to-br ${th.swatch}`} />
                        <span className="text-[9px] font-medium text-ef-ink">{th.name}</span>
                        {theme === th.id && (
                          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ef-amber text-ef-bg shadow-sm">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content sections — depends on type */}
            {type === "event" ? (
              <EventContentEditor
                content={eventContent}
                setContent={setEventContent}
                onRegenerate={regenerateSection}
                regeneratingSection={regeneratingSection}
              />
            ) : (
              <PortfolioContentEditor
                content={portfolioContent}
                setContent={setPortfolioContent}
                onRegenerate={regenerateSection}
                regeneratingSection={regeneratingSection}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Preview pane ----------
function PreviewPane({
  type,
  title,
  subtitle,
  theme,
  coverImage,
  eventContent,
  portfolioContent,
}: {
  type: "event" | "portfolio";
  title: string;
  subtitle: string;
  theme: string;
  coverImage: string | null;
  eventContent: EventContent;
  portfolioContent: PortfolioContent;
}) {
  const { t } = useTranslation();
  const themeClass = {
    aurora: { bg: "bg-gradient-to-br from-[#0d2818] via-[#0d2818] to-[#96a131]", text: "text-white" },
    noir: { bg: "bg-gradient-to-br from-[#000900] to-[#0d2818]", text: "text-white" },
    sunset: { bg: "bg-gradient-to-br from-[#96a131] to-[#000900]", text: "text-white" },
    mint: { bg: "bg-gradient-to-br from-[#f0faf4] to-[#96a131]", text: "text-white" },
    crimson: { bg: "bg-gradient-to-br from-[#0d2818] to-[#96a131]", text: "text-white" },
  }[theme] ?? { bg: "bg-gradient-to-br from-[#0d2818] to-[#96a131]", text: "text-white" };

  const hero = type === "event" ? eventContent.hero : portfolioContent.hero;

  return (
    <div className="overflow-hidden rounded-2xl border border-ef-line bg-ef-bg shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 border-b border-ef-line/60 bg-ef-surface/40 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-ef-amber/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-ef-amber/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-ef-amber/60" />
        <span className="ml-3 font-mono text-[10px] text-ef-muted">Live preview · auto-sync</span>
      </div>

      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
        {/* Hero */}
        <div className={`relative aspect-[16/10] overflow-hidden ${themeClass.bg}`}>
          {coverImage && (
            <img src={coverImage} alt="Cover" className="absolute inset-0 h-full w-full object-cover opacity-90" />
          )}
          <div className="absolute inset-0 ef-grid-bg opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <span className={`font-mono text-[10px] uppercase tracking-widest ${themeClass.text} opacity-80`}>
                {hero.eyebrow || "—"}
              </span>
              <span className={`rounded-full border border-white/20 px-2 py-0.5 text-[9px] ${themeClass.text} backdrop-blur`}>
                {type === "event" ? t("dash.event") : t("dash.portfolio")}
              </span>
            </div>
            <div>
              <h2 className={`text-2xl font-semibold tracking-tight ${themeClass.text} sm:text-3xl`}>
                {hero.title || title || "Your title here"}
              </h2>
              <p className={`mt-2 max-w-md text-sm ${themeClass.text} opacity-80`}>
                {hero.tagline || subtitle || "Your tagline appears here."}
              </p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-md bg-white/90 px-3 py-1.5 text-[11px] font-medium text-black">
                  {hero.ctaPrimary || t("editor.primaryCta")}
                </span>
                <span className="rounded-md border border-white/40 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur">
                  {hero.ctaSecondary || t("editor.secondaryCta")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        {type === "event" ? (
          <EventPreviewSections content={eventContent} />
        ) : (
          <PortfolioPreviewSections content={portfolioContent} />
        )}

        {/* Footer */}
        <div className="border-t border-ef-line/40 p-6 text-center text-[10px] text-ef-muted">
          Built with <span className="text-ef-amber">EventFolio</span> · {theme}
        </div>
      </div>
    </div>
  );
}

function EventPreviewSections({ content }: { content: EventContent }) {
  const { t } = useTranslation();
  const labels = content.sectionLabels ?? {};
  const speakersLabel = labels.speakers || "Speakers";
  const agendaLabel = labels.agenda || "Agenda";
  const sponsorsLabel = labels.sponsors || "Sponsors";
  return (
    <div>
      {/* Stats */}
      {content.stats.length > 0 && (
        <div className="grid grid-cols-2 gap-px bg-ef-line/40 sm:grid-cols-4">
          {content.stats.map((s, i) => (
            <div key={i} className="bg-ef-bg p-4 text-center">
              <p className="text-2xl font-semibold tracking-tight text-ef-ink">{s.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-ef-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Speakers */}
      {content.speakers.length > 0 && (
        <Section title={speakersLabel}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {content.speakers.map((s, i) => (
              <div key={i} className="rounded-lg border border-ef-line bg-ef-surface/40 p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#96a131] to-[#0d2818] text-xs font-semibold text-ef-bg">
                  {s.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <p className="mt-2 text-sm font-medium text-ef-ink">{s.name}</p>
                <p className="text-[10px] text-ef-amber">{s.role}</p>
                <p className="mt-1 text-[10px] text-ef-muted">{s.studio}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Agenda */}
      {content.agenda.length > 0 && (
        <Section title={agendaLabel}>
          <div className="space-y-2">
            {content.agenda.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-lg border border-ef-line bg-ef-surface/40 p-3"
              >
                <div>
                  <span className="font-mono text-sm text-ef-amber">{a.time}</span>
                  {a.date && <p className="text-[10px] text-ef-muted">{a.date}</p>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ef-ink">{a.title}</p>
                  <p className="text-[10px] text-ef-muted">{a.track}</p>
                  {(a.country || a.city) && (
                    <p className="mt-1 text-[10px] text-ef-muted">📍 {a.city}{a.city && a.country ? ", " : ""}{a.country}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Sponsors */}
      {content.sponsors.length > 0 && (
        <Section title={sponsorsLabel}>
          <div className="flex flex-wrap gap-3">
            {content.sponsors.map((s, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-ef-line bg-ef-surface/60 p-2">
                {s.logo && (
                  <img src={s.logo} alt={s.name} className="h-8 w-8 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                )}
                <span className="text-xs text-ef-ink">{s.name}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Gallery */}
      {content.gallery.length > 0 && (
        <Section title={t("editor.gallery")}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {content.gallery.map((g, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-ef-line bg-ef-surface/40">
                <div className="relative aspect-[4/3]">
                  <img
                    src={g.src}
                    alt={g.alt || g.caption || `Gallery image ${i + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                {g.caption && (
                  <p className="border-t border-ef-line/40 px-2 py-1.5 text-[10px] text-ef-muted">{g.caption}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function PortfolioPreviewSections({ content }: { content: PortfolioContent }) {
  const { t } = useTranslation();
  const labels = content.sectionLabels ?? {};
  const workLabel = labels.selected_work || "Selected work";
  const aboutLabel = labels.about || "About";
  const servicesLabel = labels.services || "Services";
  const contactLabel = labels.contact || "Contact";
  return (
    <div>
      {/* Selected work */}
      {content.selected_work.length > 0 && (
        <Section title={workLabel}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {content.selected_work.map((w, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-ef-line bg-ef-surface/40">
                <div className="aspect-[16/10] bg-gradient-to-br from-[#96a131]/20 to-[#0d2818]/20" />
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ef-ink">{w.title}</p>
                    <span className="font-mono text-[10px] text-ef-muted">{w.year}</span>
                  </div>
                  <p className="text-[10px] text-ef-amber">{w.tag} · {w.client}</p>
                  <p className="mt-1 text-xs text-ef-muted">{w.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* About */}
      {(content.about.body || content.about.highlights.length > 0) && (
        <Section title={aboutLabel}>
          <p className="text-sm text-ef-ink/80">{content.about.body}</p>
          {content.about.highlights.length > 0 && (
            <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-ef-muted">
              {content.about.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-ef-amber" /> {h}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {/* Services */}
      {content.services.length > 0 && (
        <Section title={servicesLabel}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {content.services.map((s, i) => (
              <div key={i} className="rounded-lg border border-ef-line bg-ef-surface/40 p-3">
                <p className="text-sm font-medium text-ef-ink">{s.name}</p>
                <p className="mt-1 text-xs text-ef-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Contact */}
      {(content.contact.email || content.contact.phone || content.contact.location) && (
        <Section title={contactLabel}>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {content.contact.email && (
              <span className="text-ef-ink">{content.contact.email}</span>
            )}
            {content.contact.phone && (
              <span className="text-ef-ink">{content.contact.phone}</span>
            )}
            {content.contact.location && (
              <span className="text-ef-muted">{content.contact.location}</span>
            )}
          </div>
          {content.contact.socials.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {content.contact.socials.map((s, i) => (
                s.url ? (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-ef-line bg-ef-surface/60 px-2.5 py-1 text-[10px] text-ef-amber transition-colors hover:bg-ef-surface">
                    {s.platform} · {s.handle} ↗
                  </a>
                ) : (
                  <span key={i} className="rounded-md border border-ef-line bg-ef-surface/60 px-2.5 py-1 text-[10px] text-ef-ink">
                    {s.platform} · {s.handle}
                  </span>
                )
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Gallery */}
      {content.gallery.length > 0 && (
        <Section title={t("editor.gallery")}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {content.gallery.map((g, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-ef-line bg-ef-surface/40">
                <div className="relative aspect-[4/3]">
                  <img
                    src={g.src}
                    alt={g.alt || g.caption || `Gallery image ${i + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                {g.caption && (
                  <p className="border-t border-ef-line/40 px-2 py-1.5 text-[10px] text-ef-muted">{g.caption}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-ef-line/40 p-6">
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ef-amber">({title})</h3>
      {children}
    </div>
  );
}

// ---------- Event content editor ----------
function EventContentEditor({
  content,
  setContent,
  onRegenerate,
  regeneratingSection,
}: {
  content: EventContent;
  setContent: (c: EventContent) => void;
  onRegenerate: (section: string) => void;
  regeneratingSection: string | null;
}) {
  const { t } = useTranslation();
  const labels = content.sectionLabels ?? {};
  const speakersLabel = labels.speakers || "Speakers";
  const agendaLabel = labels.agenda || "Agenda";
  const sponsorsLabel = labels.sponsors || "Sponsors";
  return (
    <div className="space-y-4">
      <Card className="border-ef-line bg-ef-surface/40">
        <CollapsibleSection title={t("editor.hero")} defaultOpen>
          <div className="space-y-3">
            <InputRow label={t("editor.eyebrow")} value={content.hero.eyebrow} onChange={(v) => setContent({ ...content, hero: { ...content.hero, eyebrow: v } })} />
            <InputRow label={t("dash.title")} value={content.hero.title} onChange={(v) => setContent({ ...content, hero: { ...content.hero, title: v } })} />
            <TextareaRow label={t("editor.tagline")} value={content.hero.tagline} onChange={(v) => setContent({ ...content, hero: { ...content.hero, tagline: v } })} />
            <div className="grid grid-cols-2 gap-2">
              <InputRow label={t("editor.primaryCta")} value={content.hero.ctaPrimary} onChange={(v) => setContent({ ...content, hero: { ...content.hero, ctaPrimary: v } })} />
              <InputRow label={t("editor.secondaryCta")} value={content.hero.ctaSecondary} onChange={(v) => setContent({ ...content, hero: { ...content.hero, ctaSecondary: v } })} />
            </div>
          </div>
        </CollapsibleSection>
      </Card>

      <Card className="border-ef-line bg-ef-surface/40">
        <CollapsibleSection
          title={`Stats (${content.stats.length})`}
          defaultOpen
          onRegenerate={() => onRegenerate("stats")}
          regenerating={regeneratingSection === "stats"}
        >
          <ListEditor
            items={content.stats}
            onChange={(items) => setContent({ ...content, stats: items })}
            empty={{ value: "", label: "" }}
            renderRow={(item, update) => (
              <div className="grid grid-cols-2 gap-2">
                <Input value={item.value} onChange={(e) => update({ ...item, value: e.target.value })} placeholder={t("editor.placeholderValue")} className="bg-ef-surface border-ef-line" />
                <Input value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} placeholder={t("editor.placeholderLabel")} className="bg-ef-surface border-ef-line" />
              </div>
            )}
          />
        </CollapsibleSection>
      </Card>

      <Card className="border-ef-line bg-ef-surface/40">
        <CollapsibleSection
          title={`${speakersLabel} (${content.speakers.length})`}
          onRegenerate={() => onRegenerate("speakers")}
          regenerating={regeneratingSection === "speakers"}
        >
          <ListEditor
            items={content.speakers}
            onChange={(items) => setContent({ ...content, speakers: items })}
            empty={{ name: "", role: "", studio: "" }}
            renderRow={(item, update) => (
              <div className="grid grid-cols-3 gap-2">
                <Input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder={t("editor.name")} className="bg-ef-surface border-ef-line" />
                <Input value={item.role} onChange={(e) => update({ ...item, role: e.target.value })} placeholder={t("editor.role")} className="bg-ef-surface border-ef-line" />
                <Input value={item.studio} onChange={(e) => update({ ...item, studio: e.target.value })} placeholder={t("editor.studio")} className="bg-ef-surface border-ef-line" />
              </div>
            )}
          />
        </CollapsibleSection>
      </Card>

      <Card className="border-ef-line bg-ef-surface/40">
        <CollapsibleSection
          title={`${agendaLabel} (${content.agenda.length})`}
          onRegenerate={() => onRegenerate("agenda")}
          regenerating={regeneratingSection === "agenda"}
        >
          <ListEditor
            items={content.agenda}
            onChange={(items) => setContent({ ...content, agenda: items })}
            empty={{ time: "", title: "", track: "", country: "", city: "", date: "" }}
            renderRow={(item, update) => (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <Input value={item.time} onChange={(e) => update({ ...item, time: e.target.value })} placeholder="10:00" className="bg-ef-surface border-ef-line" />
                  <Input value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} placeholder={t("dash.title")} className="bg-ef-surface border-ef-line" />
                  <Input value={item.track} onChange={(e) => update({ ...item, track: e.target.value })} placeholder={t("editor.track")} className="bg-ef-surface border-ef-line" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={item.date} onChange={(e) => update({ ...item, date: e.target.value })} placeholder="Mar 14" className="bg-ef-surface border-ef-line" />
                  <select
                    value={item.country}
                    onChange={(e) => update({ ...item, country: e.target.value })}
                    className="h-8 rounded-md border border-ef-line bg-ef-surface px-2 text-xs text-ef-ink"
                  >
                    <option value="">— Country —</option>
                    {AFRICAN_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Input value={item.city} onChange={(e) => update({ ...item, city: e.target.value })} placeholder="City" className="bg-ef-surface border-ef-line" />
                </div>
              </div>
            )}
          />
        </CollapsibleSection>
      </Card>

      <Card className="border-ef-line bg-ef-surface/40">
        <CollapsibleSection
          title={`${sponsorsLabel} (${content.sponsors.length})`}
          onRegenerate={() => onRegenerate("sponsors")}
          regenerating={regeneratingSection === "sponsors"}
        >
          <ListEditor
            items={content.sponsors}
            onChange={(items) => setContent({ ...content, sponsors: items })}
            empty={{ name: "", logo: "" }}
            renderRow={(item, update) => (
              <div className="flex items-center gap-2">
                {item.logo ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-ef-line">
                    <img src={item.logo} alt={item.name} className="h-full w-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-ef-line bg-ef-surface/40">
                    <ImageIcon className="h-4 w-4 text-ef-muted" />
                  </div>
                )}
                <Input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder={t("editor.sponsorName")} className="flex-1 bg-ef-surface border-ef-line" />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => update({ ...item, logo: reader.result as string });
                      reader.readAsDataURL(f);
                    }}
                  />
                  <span className="flex items-center gap-1 rounded-md border border-ef-line px-2 py-1.5 text-[10px] text-ef-muted hover:text-ef-ink">
                    <Upload className="h-3 w-3" /> Logo
                  </span>
                </label>
                {item.logo && (
                  <button
                    onClick={() => update({ ...item, logo: "" })}
                    className="rounded-md p-1.5 text-ef-muted hover:text-rose-400"
                    aria-label="Remove logo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          />
        </CollapsibleSection>
      </Card>

      <GalleryEditor
        items={content.gallery}
        onChange={(items) => setContent({ ...content, gallery: items })}
      />
    </div>
  );
}

// ---------- Gallery editor (shared by event + portfolio) ----------
function GalleryEditor({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const readers = Array.from(files).map(
        (file) =>
          new Promise<GalleryItem>((resolve) => {
            const r = new FileReader();
            r.onload = () =>
              resolve({
                src: r.result as string,
                caption: "",
                alt: file.name.replace(/\.[^.]+$/, ""),
              });
            r.readAsDataURL(file);
          }),
      );
      const newItems = await Promise.all(readers);
      onChange([...items, ...newItems]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-ef-line bg-ef-surface/40">
      <CollapsibleSection title={`${t("editor.gallery")} (${items.length})`} defaultOpen={items.length === 0}>
        <p className="mb-3 text-[11px] text-ef-muted">
          {t("editor.galleryDesc")}
        </p>
        <ListEditor
          items={items}
          onChange={onChange}
          empty={{ src: "", caption: "", alt: "" }}
          renderRow={(item, update) => (
            <div className="space-y-2">
              <div className="flex gap-2">
                {item.src ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-ef-line">
                    <img src={item.src} alt={item.alt || item.caption} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-ef-line bg-ef-surface/40">
                    <ImageIcon className="h-5 w-5 text-ef-muted" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Input
                    value={item.caption}
                    onChange={(e) => update({ ...item, caption: e.target.value })}
                    placeholder={t("editor.galleryCaptionPlaceholder")}
                    className="bg-ef-surface border-ef-line"
                  />
                  <Input
                    value={item.alt}
                    onChange={(e) => update({ ...item, alt: e.target.value })}
                    placeholder={t("editor.galleryAltPlaceholder")}
                    className="bg-ef-surface border-ef-line"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => update({ ...item, src: reader.result as string });
                      reader.readAsDataURL(f);
                    }}
                  />
                  <span className="flex items-center gap-1 rounded-md border border-ef-line px-2 py-1 text-[10px] text-ef-muted hover:text-ef-ink">
                    <Upload className="h-3 w-3" /> {t("editor.galleryImage")}
                  </span>
                </label>
                {item.src && (
                  <button
                    onClick={() => update({ ...item, src: "" })}
                    className="rounded-md p-1.5 text-ef-muted hover:text-rose-400"
                    aria-label={t("editor.removeImage")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        />
        <label className="mt-2 block cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <span className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-ef-line px-3 py-2 text-[11px] text-ef-muted hover:bg-ef-surface hover:text-ef-ink">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? t("editor.galleryUploading") : t("editor.galleryBulkUpload")}
          </span>
        </label>
      </CollapsibleSection>
    </Card>
  );
}

// ---------- Portfolio content editor ----------
function PortfolioContentEditor({
  content,
  setContent,
  onRegenerate,
  regeneratingSection,
}: {
  content: PortfolioContent;
  setContent: (c: PortfolioContent) => void;
  onRegenerate: (section: string) => void;
  regeneratingSection: string | null;
}) {
  const { t } = useTranslation();
  const labels = content.sectionLabels ?? {};
  const workLabel = labels.selected_work || "Selected work";
  const aboutLabel = labels.about || "About";
  const servicesLabel = labels.services || "Services";
  const contactLabel = labels.contact || "Contact";
  return (
    <div className="space-y-4">
      <Card className="border-ef-line bg-ef-surface/40">
        <CollapsibleSection title={t("editor.hero")} defaultOpen>
          <div className="space-y-3">
            <InputRow label={t("editor.eyebrow")} value={content.hero.eyebrow} onChange={(v) => setContent({ ...content, hero: { ...content.hero, eyebrow: v } })} />
            <InputRow label={t("dash.title")} value={content.hero.title} onChange={(v) => setContent({ ...content, hero: { ...content.hero, title: v } })} />
            <TextareaRow label={t("editor.tagline")} value={content.hero.tagline} onChange={(v) => setContent({ ...content, hero: { ...content.hero, tagline: v } })} />
            <div className="grid grid-cols-2 gap-2">
              <InputRow label={t("editor.primaryCta")} value={content.hero.ctaPrimary} onChange={(v) => setContent({ ...content, hero: { ...content.hero, ctaPrimary: v } })} />
              <InputRow label={t("editor.secondaryCta")} value={content.hero.ctaSecondary} onChange={(v) => setContent({ ...content, hero: { ...content.hero, ctaSecondary: v } })} />
            </div>
          </div>
        </CollapsibleSection>
      </Card>

      <Card className="border-ef-line bg-ef-surface/40">
        <CollapsibleSection
          title={`${workLabel} (${content.selected_work.length})`}
          defaultOpen
          onRegenerate={() => onRegenerate("selected_work")}
          regenerating={regeneratingSection === "selected_work"}
        >
          <ListEditor
            items={content.selected_work}
            onChange={(items) => setContent({ ...content, selected_work: items })}
            empty={{ title: "", client: "", year: "", description: "", tag: "" }}
            renderRow={(item, update) => (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <Input value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} placeholder={t("dash.title")} className="bg-ef-surface border-ef-line" />
                  <Input value={item.client} onChange={(e) => update({ ...item, client: e.target.value })} placeholder={t("editor.client")} className="bg-ef-surface border-ef-line" />
                  <Input value={item.year} onChange={(e) => update({ ...item, year: e.target.value })} placeholder="2025" className="bg-ef-surface border-ef-line" />
                </div>
                <Input value={item.tag} onChange={(e) => update({ ...item, tag: e.target.value })} placeholder="Tag (e.g. Brand)" className="bg-ef-surface border-ef-line" />
                <Textarea value={item.description} onChange={(e) => update({ ...item, description: e.target.value })} placeholder="Short description" className="bg-ef-surface border-ef-line min-h-[60px]" />
              </div>
            )}
          />
        </CollapsibleSection>
      </Card>

      <Card className="border-ef-line bg-ef-surface/40">
        <CollapsibleSection
          title={aboutLabel}
          onRegenerate={() => onRegenerate("about")}
          regenerating={regeneratingSection === "about"}
        >
          <Textarea
            value={content.about.body}
            onChange={(e) => setContent({ ...content, about: { ...content.about, body: e.target.value } })}
            placeholder="A short narrative about you or your studio."
            className="bg-ef-surface border-ef-line min-h-[80px]"
          />
          <div className="mt-3">
            <Label className="text-xs font-medium text-ef-ink">{t("editor.highlights")}</Label>
            <StringListEditor
              items={content.about.highlights}
              onChange={(items) => setContent({ ...content, about: { ...content.about, highlights: items } })}
              placeholder="Highlight"
            />
          </div>
        </CollapsibleSection>
      </Card>

      <Card className="border-ef-line bg-ef-surface/40">
        <CollapsibleSection
          title={`${servicesLabel} (${content.services.length})`}
          onRegenerate={() => onRegenerate("services")}
          regenerating={regeneratingSection === "services"}
        >
          <ListEditor
            items={content.services}
            onChange={(items) => setContent({ ...content, services: items })}
            empty={{ name: "", description: "" }}
            renderRow={(item, update) => (
              <div className="space-y-2">
                <Input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder={t("editor.serviceName")} className="bg-ef-surface border-ef-line" />
                <Textarea value={item.description} onChange={(e) => update({ ...item, description: e.target.value })} placeholder="Short description" className="bg-ef-surface border-ef-line min-h-[60px]" />
              </div>
            )}
          />
        </CollapsibleSection>
      </Card>

      <Card className="border-ef-line bg-ef-surface/40">
        <CollapsibleSection title={contactLabel}>
          <div className="space-y-2">
            <InputRow label={t("editor.email")} value={content.contact.email} onChange={(v) => setContent({ ...content, contact: { ...content.contact, email: v } })} />
            <InputRow label={t("editor.phone")} value={content.contact.phone} onChange={(v) => setContent({ ...content, contact: { ...content.contact, phone: v } })} />
            <InputRow label={t("editor.location")} value={content.contact.location} onChange={(v) => setContent({ ...content, contact: { ...content.contact, location: v } })} />
          </div>
          <div className="mt-3">
            <Label className="text-xs font-medium text-ef-ink">Socials</Label>
            <ListEditor
              items={content.contact.socials}
              onChange={(items) => setContent({ ...content, contact: { ...content.contact, socials: items } })}
              empty={{ platform: "", handle: "", url: "" }}
              renderRow={(item, update) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={item.platform} onChange={(e) => update({ ...item, platform: e.target.value })} placeholder="Instagram" className="bg-ef-surface border-ef-line" />
                    <Input value={item.handle} onChange={(e) => update({ ...item, handle: e.target.value })} placeholder={t("editor.handle")} className="bg-ef-surface border-ef-line" />
                  </div>
                  <Input value={item.url} onChange={(e) => update({ ...item, url: e.target.value })} placeholder="https://instagram.com/yourhandle" className="bg-ef-surface border-ef-line" />
                </div>
              )}
            />
          </div>
        </CollapsibleSection>
      </Card>

      <GalleryEditor
        items={content.gallery}
        onChange={(items) => setContent({ ...content, gallery: items })}
      />
    </div>
  );
}

// ---------- Shared editor sub-components ----------
function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  onRegenerate,
  regenerating = false,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  onRegenerate?: () => void;
  regenerating?: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div className="flex w-full items-center justify-between py-1">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-1"
        >
          <span className="text-sm font-medium text-ef-ink">{title}</span>
          {open ? (
            <ChevronDown className="h-4 w-4 text-ef-muted" />
          ) : (
            <ChevronRight className="h-4 w-4 text-ef-muted" />
          )}
        </button>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-ef-amber transition-colors hover:bg-ef-amber/10 disabled:opacity-50"
            title={`${t("editor.regenerate")} ${title.split(" (")[0]}`}
          >
            {regenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">{regenerating ? t("editor.regenerating") : t("editor.regenerate")}</span>
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pb-2 pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-medium uppercase tracking-wider text-ef-muted">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-ef-surface border-ef-line" />
    </div>
  );
}

function TextareaRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-medium uppercase tracking-wider text-ef-muted">{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="bg-ef-surface border-ef-line min-h-[60px]" />
    </div>
  );
}

function ListEditor<T extends Record<string, string>>({
  items,
  onChange,
  empty,
  renderRow,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  empty: T;
  renderRow: (item: T, update: (next: T) => void) => React.ReactNode;
}) {
  const { t } = useTranslation();
  const safeItems = items ?? [];
  // Generate stable IDs for sortable items. We use the array index as the ID
  // because items don't have intrinsic IDs — when the order changes, dnd-kit
  // re-renders with the new index mapping.
  const itemIds = safeItems.map((_, i) => `item-${i}`);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(safeItems, oldIndex, newIndex);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {safeItems.map((item, i) => (
            <SortableRow
              key={itemIds[i]}
              id={itemIds[i]}
              onRemove={() => onChange(safeItems.filter((_, idx) => idx !== i))}
            >
              {renderRow(item, (next) =>
                onChange(safeItems.map((it, idx) => (idx === i ? next : it)))
              )}
            </SortableRow>
          ))}
        </SortableContext>
      </DndContext>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange([...safeItems, { ...empty }])}
        className="w-full border-dashed border-ef-line text-ef-muted hover:bg-ef-surface hover:text-ef-ink"
      >
        <Plus className="mr-1 h-3 w-3" /> {t("editor.add")}
      </Button>
    </div>
  );
}

function SortableRow({
  id,
  onRemove,
  children,
}: {
  id: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-start gap-1 rounded-md border border-ef-line bg-ef-bg p-2 ${
        isDragging ? "ring-1 ring-ef-amber shadow-lg z-10" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab rounded p-1 text-ef-muted hover:bg-ef-surface hover:text-ef-ink active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <div className="flex-1 pr-6">{children}</div>
      <button
        onClick={onRemove}
        className="absolute right-1 top-1 rounded p-1 text-ef-muted hover:bg-ef-surface hover:text-red-400"
        aria-label={t("editor.remove")}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function StringListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const safeItems = items ?? [];
  return (
    <div className="space-y-1.5">
      {safeItems.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input
            value={item}
            onChange={(e) => onChange(safeItems.map((it, idx) => (idx === i ? e.target.value : it)))}
            placeholder={placeholder}
            className="bg-ef-surface border-ef-line"
          />
          <button
            onClick={() => onChange(safeItems.filter((_, idx) => idx !== i))}
            className="rounded p-1.5 text-ef-muted hover:bg-ef-surface hover:text-red-400"
            aria-label={t("editor.remove")}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange([...safeItems, ""])}
        className="w-full border-dashed border-ef-line text-ef-muted hover:bg-ef-surface hover:text-ef-ink"
      >
        <Plus className="mr-1 h-3 w-3" /> {t("editor.add")}
      </Button>
    </div>
  );
}
