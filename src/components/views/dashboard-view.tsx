"use client";

import { useAppStore, type CurrentUser } from "@/lib/store";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  Calendar,
  Briefcase,
  Eye,
  Heart,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Pencil,
  Globe,
  Loader2,
  Copy,
  Check,
  TrendingUp,
  Clock,
  ArrowUpRight,
  LayoutGrid,
  Palette,
  BarChart3,
  Settings as SettingsIcon,
  CopyPlus,
  User,
  Upload,
  Image as ImageIcon,
  Home,
  Menu,
  X,
  LogOut,
  Type,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatNumber, timeAgo, slugify } from "@/lib/helpers";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

type Site = {
  id: string;
  type: "event" | "portfolio";
  title: string;
  slug: string;
  subtitle: string | null;
  theme: string;
  coverImage: string | null;
  published: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
};

type Template = {
  id: string;
  name: string;
  type: "event" | "portfolio";
  category: string;
  description: string;
  thumbnail: string;
  theme: string;
  popularity: number;
};

type PortfolioContent = {
  hero: { title: string; eyebrow: string; tagline: string; ctaPrimary: string; ctaSecondary: string };
  selected_work?: Array<{ title: string; client: string; year: string; description: string; tag: string }>;
  about?: { body: string; highlights: string[] };
  services?: Array<{ name: string; description: string }>;
  contact: { email: string; phone: string; location: string; socials: Array<{ platform: string; handle: string; url: string }> };
  design?: { logo?: string | null; favicon?: string | null; banner?: string | null; ogImage?: string | null; font?: string };
};

type NavId = "portfolio" | "home" | "events" | "analytics" | "settings" | "templates";

type ThemeOption = { id: string; name: string; swatch: string; ring: string };
type FontOption = { id: string; name: string; sample: string; className: string };

const DASH_THEMES: ThemeOption[] = [
  { id: "aurora", name: "Aurora", swatch: "from-[#0d2818] to-[#96a131]", ring: "ring-ef-amber" },
  { id: "noir", name: "Noir", swatch: "from-[#000900] to-[#0d2818]", ring: "ring-ef-amber" },
  { id: "sunset", name: "Sunset", swatch: "from-[#96a131] to-[#000900]", ring: "ring-ef-amber" },
  { id: "mint", name: "Mint", swatch: "from-[#f0faf4] to-[#96a131]", ring: "ring-ef-amber" },
  { id: "crimson", name: "Crimson", swatch: "from-[#0d2818] to-[#96a131]", ring: "ring-ef-amber" },
];

const DASH_FONTS: FontOption[] = [
  { id: "sans", name: "Sans", sample: "Aa", className: "font-sans" },
  { id: "serif", name: "Serif", sample: "Aa", className: "font-serif" },
  { id: "mono", name: "Mono", sample: "Aa", className: "font-mono" },
];

export function DashboardView() {
  const user = useAppStore((s) => s.user);
  const goEditor = useAppStore((s) => s.goEditor);
  const goLanding = useAppStore((s) => s.goLanding);
  const goPreview = useAppStore((s) => s.goPreview);
  const setView = useAppStore((s) => s.setView);
  const logout = useAppStore((s) => s.logout);
  const pushToast = useAppStore((s) => s.pushToast);
  const goAuth = useAppStore((s) => s.goAuth);
  const { t } = useTranslation();

  const [activeNav, setActiveNav] = useState<NavId>("portfolio");
  const [sites, setSites] = useState<Site[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Guard — if not logged in, send to auth
  useEffect(() => {
    if (user === null) {
      let cancelled = false;
      (async () => {
        try {
          const res = await fetch("/api/auth/me", { cache: "no-store" });
          const data = await res.json();
          if (!cancelled && !data?.user) {
            goAuth("login");
          }
        } catch {
          /* ignore */
        }
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [user, goAuth]);

  const loadSites = useCallback(async () => {
    try {
      const res = await fetch("/api/sites", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSites(data.sites ?? []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/templates", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates ?? []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadSites();
      loadTemplates();
    }
  }, [user, loadSites, loadTemplates]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="flex items-center gap-2 text-sm text-ef-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loadingDashboard")}
        </div>
      </div>
    );
  }

  const handleNav = (id: NavId) => {
    setActiveNav(id);
    setMobileNavOpen(false);
    // Sync view.tab so animations re-trigger and URL state stays coherent
    if (id === "analytics") setView({ name: "dashboard", tab: "analytics" });
    else if (id === "settings") setView({ name: "dashboard", tab: "settings" });
    else if (id === "templates") setView({ name: "dashboard", tab: "templates" });
    else setView({ name: "dashboard", tab: "sites" });
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <img src="/icon-limemoss.svg" alt="EventFolio" className="h-8 w-8 object-contain" />
        <span className="font-mono text-base font-semibold tracking-tight text-ef-ink">
          EventFolio<span className="text-ef-amber">.</span>
        </span>
      </div>

      {/* MANAGE */}
      <div className="px-4 pb-2 pt-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ef-ink/40">{t("dash.layout.manage")}</p>
      </div>
      <nav className="space-y-0.5 px-2">
        {([
          { id: "home" as NavId, label: t("dash.layout.home"), icon: Home },
          { id: "portfolio" as NavId, label: t("dash.layout.portfolio"), icon: Briefcase },
          { id: "events" as NavId, label: t("dash.layout.events"), icon: Calendar },
          { id: "analytics" as NavId, label: t("dash.analytics"), icon: BarChart3 },
          { id: "settings" as NavId, label: t("dash.settings"), icon: SettingsIcon },
        ] as const).map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeNav === item.id
                ? "bg-ef-amber text-ef-bg"
                : "text-ef-ink/80 hover:bg-ef-ink/5 hover:text-ef-ink"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* SUPPORT */}
      <div className="px-4 pb-2 pt-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ef-ink/40">{t("dash.layout.support")}</p>
      </div>
      <nav className="space-y-0.5 px-2">
        <button
          onClick={() => handleNav("templates")}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            activeNav === "templates"
              ? "bg-ef-amber text-ef-bg"
              : "text-ef-ink/80 hover:bg-ef-ink/5 hover:text-ef-ink"
          }`}
        >
          <Palette className="h-4 w-4" />
          {t("dash.templates")}
        </button>
        <button
          onClick={() => goLanding()}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ef-ink/80 transition-colors hover:bg-ef-ink/5 hover:text-ef-ink"
        >
          <HelpCircle className="h-4 w-4" />
          {t("nav.faq")}
        </button>
      </nav>

      {/* Bottom: User + Logout */}
      <div className="mt-auto border-t border-white/5 px-4 py-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ef-amber/20 text-xs font-semibold text-ef-amber">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ef-ink">{user.name}</p>
            <p className="truncate font-mono text-[10px] uppercase tracking-wider text-ef-ink/40">
              {user.plan} plan
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-ef-ink/60 transition-colors hover:bg-ef-ink/5 hover:text-ef-ink"
        >
          <LogOut className="h-3.5 w-3.5" /> {t("dash.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ef-bg pt-16">
      {/* Left sidebar — desktop */}
      <aside className="sticky top-16 hidden w-60 shrink-0 flex-col self-start bg-ef-surface lg:flex" style={{ height: "calc(100vh - 4rem)" }}>
        {sidebarContent}
      </aside>

      {/* Mobile top bar + Sheet sidebar */}
      <div className="lg:hidden">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <div className="fixed inset-x-0 top-16 z-30 flex h-12 items-center justify-between border-b border-ef-line/40 bg-ef-surface px-4">
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2 text-ef-ink hover:bg-ef-ink/5">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <div className="flex items-center gap-2">
              <img src="/icon-limemoss.svg" alt="EventFolio" className="h-6 w-6 object-contain" />
              <span className="font-mono text-sm font-semibold text-ef-ink">
                EventFolio<span className="text-ef-amber">.</span>
              </span>
            </div>
            <div className="w-8" />
          </div>
          <SheetContent side="left" className="w-60 border-ef-line bg-ef-surface p-0" style={{ paddingTop: 0 }}>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-2 top-2 z-10 rounded-md p-1.5 text-ef-ink/60 hover:bg-ef-ink/5 hover:text-ef-ink"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Main + right sidebar */}
      <div className="flex min-w-0 flex-1 lg:pt-12">
        {activeNav === "portfolio" ? (
          <PortfolioEditPane
            user={user}
            sites={sites}
            loading={loading}
            onSitesChanged={loadSites}
            onCreateSite={() => setCreateOpen(true)}
            createOpen={createOpen}
            setCreateOpen={setCreateOpen}
            templates={templates}
            pushToast={pushToast}
            goEditor={goEditor}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              {(activeNav === "home" || activeNav === "events") && (
                <>
                  <div className="mb-5 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-ef-ink">{t("dash.mySites")}</h1>
                    <CreateSiteButton
                      open={createOpen}
                      setOpen={setCreateOpen}
                      templates={templates}
                      hasPortfolio={sites.some((s) => s.type === "portfolio")}
                      onCreated={(site) => {
                        setCreateOpen(false);
                        loadSites();
                        pushToast({
                          title: t("dash.siteCreated"),
                          description: `"${site.title}" is ready to edit.`,
                          variant: "success",
                        });
                        goEditor({ siteId: site.id, type: site.type, templateId: undefined });
                      }}
                    />
                  </div>
                  <SitesTab
                    sites={sites}
                    loading={loading}
                    onRefresh={loadSites}
                    onOpenEditor={(s) => goEditor({ siteId: s.id, type: s.type })}
                    onPreview={(s) => goPreview(s.id)}
                    pushToast={pushToast}
                  />
                </>
              )}
              {activeNav === "templates" && (
                <>
                  <div className="mb-5">
                    <h1 className="text-2xl font-semibold tracking-tight text-ef-ink">{t("dash.templates")}</h1>
                  </div>
                  <TemplatesTab
                    templates={templates}
                    hasPortfolio={sites.some((s) => s.type === "portfolio")}
                    onCreated={(site) => {
                      loadSites();
                      goEditor({ siteId: site.id, type: site.type });
                    }}
                    pushToast={pushToast}
                  />
                </>
              )}
              {activeNav === "analytics" && (
                <>
                  <div className="mb-5">
                    <h1 className="text-2xl font-semibold tracking-tight text-ef-ink">{t("dash.analytics")}</h1>
                  </div>
                  <AnalyticsTab sites={sites} />
                </>
              )}
              {activeNav === "settings" && (
                <>
                  <div className="mb-5">
                    <h1 className="text-2xl font-semibold tracking-tight text-ef-ink">{t("dash.settings")}</h1>
                  </div>
                  <SettingsTab user={user} pushToast={pushToast} />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
//  Portfolio edit pane — main content + right sidebar
// ============================================================
function PortfolioEditPane({
  user,
  sites,
  loading,
  onSitesChanged,
  onCreateSite,
  createOpen,
  setCreateOpen,
  templates,
  pushToast,
  goEditor,
}: {
  user: CurrentUser;
  sites: Site[];
  loading: boolean;
  onSitesChanged: () => void;
  onCreateSite: () => void;
  createOpen: boolean;
  setCreateOpen: (b: boolean) => void;
  templates: Template[];
  pushToast: (t: { title: string; description?: string; variant?: "default" | "success" | "error" }) => void;
  goEditor: (params: { siteId?: string; type: "event" | "portfolio"; templateId?: string }) => void;
}) {
  const { t } = useTranslation();
  const portfolio = sites.find((s) => s.type === "portfolio");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [fbUrl, setFbUrl] = useState("");
  const [igUrl, setIgUrl] = useState("");
  const [ttUrl, setTtUrl] = useState("");
  const [liUrl, setLiUrl] = useState("");
  const [theme, setTheme] = useState("aurora");
  const [font, setFont] = useState("sans");
  const [logo, setLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const initialized = useRef<string | null>(null);

  const markDirty = () => setDirty(true);

  // Initialize form state from portfolio content (once per portfolio)
  useEffect(() => {
    if (!portfolio || initialized.current === portfolio.id) return;
    initialized.current = portfolio.id;
    try {
      const c = JSON.parse(portfolio.content) as PortfolioContent;
      setTitle(c?.hero?.title ?? "");
      setDescription(c?.hero?.tagline ?? "");
      setWebsite(c?.hero?.eyebrow ?? "");
      const socials = c?.contact?.socials ?? [];
      setFbUrl(socials.find((s) => s.platform === "facebook")?.url ?? "");
      setIgUrl(socials.find((s) => s.platform === "instagram")?.url ?? "");
      setTtUrl(socials.find((s) => s.platform === "tiktok")?.url ?? "");
      setLiUrl(socials.find((s) => s.platform === "linkedin")?.url ?? "");
      setTheme(portfolio.theme ?? "aurora");
      setFont(c?.design?.font ?? "sans");
      setLogo(c?.design?.logo ?? null);
      setFavicon(c?.design?.favicon ?? null);
      setBanner(c?.design?.banner ?? portfolio.coverImage ?? null);
      setOgImage(c?.design?.ogImage ?? null);
    } catch {
      /* ignore parse errors — keep defaults */
    }
    setDirty(false);
  }, [portfolio]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-ef-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ef-surface">
            <Briefcase className="h-5 w-5 text-ef-amber" />
          </div>
          <h3 className="text-base font-semibold text-ef-ink">{t("dash.layout.noPortfolioTitle")}</h3>
          <p className="mt-1 text-sm text-ef-muted">{t("dash.layout.noPortfolioDesc")}</p>
          <Button onClick={onCreateSite} className="mt-5 bg-ef-ink text-ef-bg hover:bg-ef-ink/90">
            <Plus className="mr-1 h-4 w-4" /> {t("dash.newSite")}
          </Button>
          <CreateSiteButton
            open={createOpen}
            setOpen={setCreateOpen}
            templates={templates}
            hasPortfolio={false}
            onCreated={(site) => {
              setCreateOpen(false);
              onSitesChanged();
              pushToast({
                title: t("dash.siteCreated"),
                description: `"${site.title}" is ready to edit.`,
                variant: "success",
              });
              goEditor({ siteId: site.id, type: site.type, templateId: undefined });
            }}
          />
        </div>
      </div>
    );
  }

  const progress = computeProgress({ title, description, website, fbUrl, igUrl, ttUrl, liUrl, theme, logo, banner });

  const onUpload = (kind: "logo" | "favicon" | "banner" | "ogImage", file: File) => {
    setUploading(kind);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (kind === "logo") setLogo(dataUrl);
      else if (kind === "favicon") setFavicon(dataUrl);
      else if (kind === "banner") setBanner(dataUrl);
      else setOgImage(dataUrl);
      markDirty();
      setUploading(null);
    };
    reader.onerror = () => {
      pushToast({ title: "Failed to read file", variant: "error" });
      setUploading(null);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      let content: PortfolioContent;
      try {
        content = JSON.parse(portfolio.content) as PortfolioContent;
      } catch {
        content = {
          hero: { title: "", eyebrow: "", tagline: "", ctaPrimary: "View work", ctaSecondary: "About" },
          contact: { email: "", phone: "", location: "", socials: [] },
        };
      }
      // deep-merge updated values with ?? fallbacks
      content.hero = {
        title: content.hero?.title ?? "",
        eyebrow: content.hero?.eyebrow ?? "",
        tagline: content.hero?.tagline ?? "",
        ctaPrimary: content.hero?.ctaPrimary ?? "View work",
        ctaSecondary: content.hero?.ctaSecondary ?? "About",
      };
      content.hero.title = title;
      content.hero.tagline = description;
      content.hero.eyebrow = website;
      content.contact = content.contact ?? { email: "", phone: "", location: "", socials: [] };
      const newSocials = [
        { platform: "facebook", handle: "", url: fbUrl },
        { platform: "instagram", handle: "", url: igUrl },
        { platform: "tiktok", handle: "", url: ttUrl },
        { platform: "linkedin", handle: "", url: liUrl },
      ].filter((s) => s.url.trim() !== "");
      content.contact.socials = newSocials;
      content.design = { logo, favicon, banner, ogImage, font };
      const res = await fetch(`/api/sites/${portfolio.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: JSON.stringify(content),
          theme,
          coverImage: banner,
        }),
      });
      if (res.ok) {
        setDirty(false);
        pushToast({ title: t("editor.saved"), description: t("editor.savedDesc"), variant: "success" });
        onSitesChanged();
      } else {
        const e = await res.json();
        pushToast({ title: "Save failed", description: e?.error, variant: "error" });
      }
    } catch (e) {
      pushToast({ title: "Network error", description: String(e), variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Top bar: progress + save */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs text-ef-muted">{t("dash.layout.completedAt", { pct: progress })}</p>
                <span className="font-mono text-xs text-ef-amber">{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ef-line">
                <motion.div
                  className="h-full bg-ef-amber"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
            <Button
              onClick={save}
              disabled={saving || !dirty}
              className="bg-ef-ink text-ef-bg hover:bg-ef-ink/90"
            >
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
              {t("editor.save")}
            </Button>
          </div>

          {/* MAIN INFO */}
          <section className="mb-10">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ef-amber">
              {t("dash.layout.mainInfo")}
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-ef-ink">{t("dash.title")}</Label>
                <input
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); markDirty(); }}
                  placeholder="Your portfolio title"
                  className="mt-1 w-full border-0 border-b border-ef-line bg-transparent px-0 py-1.5 text-lg font-medium text-ef-ink placeholder:text-ef-muted/60 focus:border-ef-amber focus:outline-none"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-ef-ink">{t("editor.description")}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); markDirty(); }}
                  placeholder="A short bio shown on your portfolio."
                  className="mt-1 min-h-[100px] border-ef-line bg-ef-surface"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-ef-ink">{t("dash.layout.website")}</Label>
                <Input
                  value={website}
                  onChange={(e) => { setWebsite(e.target.value); markDirty(); }}
                  placeholder="https://yourwebsite.com"
                  className="mt-1 border-ef-line bg-ef-surface"
                />
              </div>
            </div>
          </section>

          {/* SOCIAL MEDIA INFO */}
          <section>
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ef-amber">
              {t("dash.layout.socialMediaInfo")}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-medium text-ef-ink">{t("dash.layout.facebookUrl")}</Label>
                <Input
                  value={fbUrl}
                  onChange={(e) => { setFbUrl(e.target.value); markDirty(); }}
                  placeholder="https://facebook.com/…"
                  className="mt-1 border-ef-line bg-ef-surface"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-ef-ink">{t("dash.layout.instagramUrl")}</Label>
                <Input
                  value={igUrl}
                  onChange={(e) => { setIgUrl(e.target.value); markDirty(); }}
                  placeholder="https://instagram.com/…"
                  className="mt-1 border-ef-line bg-ef-surface"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-ef-ink">{t("dash.layout.tiktokUrl")}</Label>
                <Input
                  value={ttUrl}
                  onChange={(e) => { setTtUrl(e.target.value); markDirty(); }}
                  placeholder="https://tiktok.com/…"
                  className="mt-1 border-ef-line bg-ef-surface"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-ef-ink">{t("dash.layout.linkedinUrl")}</Label>
                <Input
                  value={liUrl}
                  onChange={(e) => { setLiUrl(e.target.value); markDirty(); }}
                  placeholder="https://linkedin.com/…"
                  className="mt-1 border-ef-line bg-ef-surface"
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Right sidebar */}
      <aside
        className="sticky top-16 hidden w-80 shrink-0 self-start flex-col border-l border-ef-line/40 bg-ef-bg lg:flex"
        style={{ height: "calc(100vh - 4rem)" }}
      >
        <RightSidebar
          theme={theme}
          setTheme={(v) => { setTheme(v); markDirty(); }}
          font={font}
          setFont={(v) => { setFont(v); markDirty(); }}
          logo={logo}
          favicon={favicon}
          banner={banner}
          ogImage={ogImage}
          onUpload={onUpload}
          uploading={uploading}
        />
      </aside>
    </>
  );
}

// ============================================================
//  Right sidebar — design settings
// ============================================================
function RightSidebar({
  theme,
  setTheme,
  font,
  setFont,
  logo,
  favicon,
  banner,
  ogImage,
  onUpload,
  uploading,
}: {
  theme: string;
  setTheme: (v: string) => void;
  font: string;
  setFont: (v: string) => void;
  logo: string | null;
  favicon: string | null;
  banner: string | null;
  ogImage: string | null;
  onUpload: (kind: "logo" | "favicon" | "banner" | "ogImage", file: File) => void;
  uploading: string | null;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-ef-amber px-4 py-3">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ef-bg">
          {t("dash.layout.designSettings")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {/* Colors */}
        <section className="mb-6">
          <p className="mb-3 text-xs font-semibold text-ef-ink">{t("dash.layout.colors")}</p>
          <div className="grid grid-cols-5 gap-2">
            {DASH_THEMES.map((th) => (
              <button
                key={th.id}
                onClick={() => setTheme(th.id)}
                title={th.name}
                className={`group relative flex flex-col items-center gap-1 rounded-md border p-1.5 transition-all ${
                  theme === th.id
                    ? "border-ef-amber ring-1 " + th.ring
                    : "border-ef-line hover:border-ef-muted/60"
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
        </section>

        {/* Fonts */}
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5 text-ef-amber" />
            <p className="text-xs font-semibold text-ef-ink">{t("dash.layout.fonts")}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DASH_FONTS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFont(f.id)}
                className={`flex flex-col items-center gap-0.5 rounded-md border p-2 transition-all ${
                  font === f.id
                    ? "border-ef-amber bg-ef-surface ring-1 ring-ef-amber/40"
                    : "border-ef-line hover:border-ef-muted/60"
                }`}
              >
                <span className={`text-base font-semibold text-ef-ink ${f.className}`}>{f.sample}</span>
                <span className="text-[9px] text-ef-muted">{f.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Visual assets */}
        <section>
          <p className="mb-3 text-xs font-semibold text-ef-ink">{t("dash.layout.visualAssets")}</p>
          <div className="space-y-3">
            <AssetUpload
              label={t("dash.layout.logo")}
              value={logo}
              aspect="square"
              uploading={uploading === "logo"}
              onFile={(f) => onUpload("logo", f)}
            />
            <AssetUpload
              label={t("dash.layout.favicon")}
              value={favicon}
              aspect="square"
              small
              uploading={uploading === "favicon"}
              onFile={(f) => onUpload("favicon", f)}
            />
            <AssetUpload
              label={t("dash.layout.banner")}
              value={banner}
              aspect="wide"
              uploading={uploading === "banner"}
              onFile={(f) => onUpload("banner", f)}
            />
            <AssetUpload
              label={t("dash.layout.ogImage")}
              value={ogImage}
              aspect="wide"
              uploading={uploading === "ogImage"}
              onFile={(f) => onUpload("ogImage", f)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================================
//  Asset upload tile — used by the right sidebar
// ============================================================
function AssetUpload({
  label,
  value,
  aspect,
  small,
  uploading,
  onFile,
}: {
  label: string;
  value: string | null;
  aspect: "square" | "wide";
  small?: boolean;
  uploading: boolean;
  onFile: (f: File) => void;
}) {
  const { t } = useTranslation();
  // For small square (favicon) we want a 4rem fixed-size tile.
  // For wide (banner / OG) we want a 16/9 tile that fills the available width minus the button column.
  // For square (logo) we want a square tile that fills similarly to wide.
  const previewClass = small
    ? "h-16 w-16 shrink-0"
    : aspect === "wide"
      ? "flex-1 shrink-0 aspect-[16/9]"
      : "flex-1 shrink-0 aspect-square";
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium text-ef-ink">{label}</p>
      <div className="flex items-center gap-2">
        <label
          className={`relative flex ${previewClass} cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-ef-line bg-ef-surface/40 transition-colors hover:border-ef-amber/60`}
        >
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-ef-muted">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.currentTarget.value = "";
            }}
            disabled={uploading}
          />
        </label>
        <div className={`min-w-0 ${small ? "flex-1" : "w-24 shrink-0"}`}>
          {value ? (
            <p className="truncate text-[10px] text-ef-muted">{t("dash.layout.upload")}ed</p>
          ) : (
            <p className="text-[10px] text-ef-muted">—</p>
          )}
          <label className="mt-1 inline-block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.currentTarget.value = "";
              }}
              disabled={uploading}
            />
            <span className="inline-flex items-center gap-1 rounded-md border border-ef-line px-2 py-1 text-[10px] font-medium text-ef-ink hover:bg-ef-surface">
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {t("dash.layout.upload")}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  Progress calculation
// ============================================================
function computeProgress(fields: {
  title: string;
  description: string;
  website: string;
  fbUrl: string;
  igUrl: string;
  ttUrl: string;
  liUrl: string;
  theme: string;
  logo: string | null;
  banner: string | null;
}): number {
  let count = 0;
  const total = 9;
  if (fields.title.trim()) count++;
  if (fields.description.trim()) count++;
  if (fields.website.trim()) count++;
  if (fields.fbUrl.trim()) count++;
  if (fields.igUrl.trim()) count++;
  if (fields.ttUrl.trim()) count++;
  if (fields.liUrl.trim()) count++;
  if (fields.theme) count++;
  if (fields.banner) count++;
  return Math.round((count / total) * 100);
}

function CreateSiteButton({
  open,
  setOpen,
  templates,
  hasPortfolio,
  onCreated,
}: {
  open: boolean;
  setOpen: (b: boolean) => void;
  templates: Template[];
  hasPortfolio: boolean;
  onCreated: (s: Site) => void;
}) {
  const [type, setType] = useState<"event" | "portfolio">("event");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [theme, setTheme] = useState("aurora");
  const [templateId, setTemplateId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const pushToast = useAppStore((s) => s.pushToast);
  const { t } = useTranslation();

  const themes = [
    { id: "aurora", name: "Aurora", swatch: "from-[#0d2818] to-[#96a131]" },
    { id: "noir", name: "Noir", swatch: "from-[#000900] to-[#0d2818]" },
    { id: "sunset", name: "Sunset", swatch: "from-[#96a131] to-[#000900]" },
    { id: "mint", name: "Mint", swatch: "from-[#f0faf4] to-[#96a131]" },
    { id: "crimson", name: "Crimson", swatch: "from-[#0d2818] to-[#96a131]" },
  ];

  const submit = async () => {
    if (!title.trim()) {
      pushToast({ title: "Give your site a title first", variant: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          theme,
          templateId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast({
          title: "Couldn't create site",
          description: data?.error,
          variant: "error",
        });
        return;
      }
      onCreated(data.site);
      // reset
      setTitle("");
      setSubtitle("");
      setTheme("aurora");
      setTemplateId(undefined);
    } catch (err) {
      pushToast({ title: "Network error", description: String(err), variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const matchingTemplates = templates.filter((t) => t.type === type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-ef-ink text-ef-bg hover:bg-ef-ink/90">
          <Plus className="mr-1 h-4 w-4" /> {t("dash.newSite")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-ef-bg border-ef-line">
        <DialogHeader>
          <DialogTitle className="text-ef-ink">{t("dash.createSite")}</DialogTitle>
          <DialogDescription className="text-ef-muted">
            {t("dash.createDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Type switch */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-ef-ink">{t("dash.type")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setType("event");
                  setTemplateId(undefined);
                }}
                className={`flex items-start gap-2 rounded-lg border p-3 text-left ${
                  type === "event" ? "border-ef-amber bg-ef-surface" : "border-ef-line bg-transparent hover:bg-ef-surface/60"
                }`}
              >
                <Calendar className="mt-0.5 h-4 w-4 text-ef-amber" />
                <div>
                  <p className="text-sm font-medium text-ef-ink">{t("dash.typeEvent")}</p>
                  <p className="text-[10px] text-ef-muted">{t("dash.typeEventDesc")}</p>
                </div>
              </button>
              <button
                onClick={() => {
                  if (!hasPortfolio) {
                    setType("portfolio");
                    setTemplateId(undefined);
                  }
                }}
                disabled={hasPortfolio}
                className={`flex items-start gap-2 rounded-lg border p-3 text-left transition-opacity ${
                  hasPortfolio ? "cursor-not-allowed border-ef-line opacity-40" : type === "portfolio" ? "border-ef-amber bg-ef-surface" : "border-ef-line bg-transparent hover:bg-ef-surface/60"
                }`}
              >
                <Briefcase className="mt-0.5 h-4 w-4 text-ef-amber" />
                <div>
                  <p className="text-sm font-medium text-ef-ink">{t("dash.typePortfolio")}</p>
                  <p className="text-[10px] text-ef-muted">
                    {hasPortfolio ? t("dash.portfolioExists") : t("dash.typePortfolioDesc")}
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium text-ef-ink">{t("dash.title")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "event" ? "Design Fringe 2025" : "Atlas Studio"}
              className="bg-ef-surface border-ef-line"
            />
            <p className="text-[10px] text-ef-muted">
              {t("dash.slugPreview")}:{" "}
              <span className="font-mono text-ef-amber">
                /{slugify(title) || "your-slug"}
              </span>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subtitle" className="text-xs font-medium text-ef-ink">{t("dash.subtitle")}</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="A one-line description"
              className="bg-ef-surface border-ef-line"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-ef-ink">{t("dash.theme")}</Label>
            <div className="grid grid-cols-5 gap-2">
              {themes.map((th) => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 ${
                    theme === th.id ? "border-ef-amber" : "border-ef-line"
                  }`}
                >
                  <span className={`h-8 w-full rounded-md bg-gradient-to-br ${th.swatch}`} />
                  <span className="text-[10px] text-ef-ink">{th.name}</span>
                </button>
              ))}
            </div>
          </div>

          {matchingTemplates.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-ef-ink">Start from template (optional)</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <button
                  onClick={() => setTemplateId(undefined)}
                  className={`rounded-lg border p-2 text-left text-xs ${
                    !templateId ? "border-ef-amber" : "border-ef-line"
                  }`}
                >
                  <p className="font-medium text-ef-ink">{t("dash.blank")}</p>
                  <p className="text-ef-muted">{t("dash.blankDesc")}</p>
                </button>
                {matchingTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setTemplateId(tpl.id)}
                    className={`rounded-lg border p-2 text-left text-xs ${
                      templateId === tpl.id ? "border-ef-amber" : "border-ef-line"
                    }`}
                  >
                    <p className="font-medium text-ef-ink">{tpl.name}</p>
                    <p className="text-ef-muted">{tpl.category}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="text-ef-muted">
            {t("dash.cancel")}
          </Button>
          <Button onClick={submit} disabled={loading} className="bg-ef-ink text-ef-bg hover:bg-ef-ink/90">
            {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
            {t("dash.createSiteBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SitesTab({
  sites,
  loading,
  onRefresh,
  onOpenEditor,
  onPreview,
  pushToast,
}: {
  sites: Site[];
  loading: boolean;
  onRefresh: () => void;
  onOpenEditor: (s: Site) => void;
  onPreview: (s: Site) => void;
  pushToast: (t: { title: string; description?: string; variant?: "default" | "success" | "error" }) => void;
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | "event" | "portfolio">("all");
  const filtered = sites.filter((s) => filter === "all" || s.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-ef-muted">
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> {t("common.loading")}
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ef-line bg-ef-surface/30 py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ef-surface">
          <Briefcase className="h-5 w-5 text-ef-amber" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-ef-ink">{t("dash.noSites")}</h3>
        <p className="mt-1 max-w-xs text-sm text-ef-muted">
          {t("dash.noSitesDesc")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ef-muted">
          {sites.length} {t("dash.sites")} ·{" "}
          {sites.filter((s) => s.published).length} {t("dash.published")}
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-ef-line p-0.5">
          {(["all", "event", "portfolio"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
                filter === f ? "bg-ef-surface text-ef-ink" : "text-ef-muted hover:text-ef-ink"
              }`}
            >
              {f === "all" ? t("dash.all") : f === "event" ? t("dash.event") : t("dash.portfolio")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <SiteCard
            key={s.id}
            site={s}
            onOpenEditor={() => onOpenEditor(s)}
            onPreview={() => onPreview(s)}
            onTogglePublish={async () => {
              try {
                const res = await fetch(`/api/sites/${s.id}/publish`, { method: "POST" });
                if (res.ok) {
                  const updated = await res.json();
                  onRefresh();
                  pushToast({
                    title: updated.site.published ? t("editor.sitePublished") : t("editor.siteUnpublished"),
                    description: updated.site.published
                      ? `${t("editor.liveAt")} /${updated.site.slug}`
                      : t("editor.siteIsPrivate"),
                    variant: "success",
                  });
                }
              } catch {
                pushToast({ title: "Failed to toggle publish", variant: "error" });
              }
            }}
            onDelete={async () => {
              try {
                const res = await fetch(`/api/sites/${s.id}`, { method: "DELETE" });
                if (res.ok) {
                  onRefresh();
                  pushToast({
                    title: t("dash.siteDeleted"),
                    description: `"${s.title}" has been removed.`,
                    variant: "default",
                  });
                }
              } catch {
                pushToast({ title: "Failed to delete site", variant: "error" });
              }
            }}
            onDuplicate={async () => {
              try {
                const res = await fetch(`/api/sites/${s.id}/duplicate`, { method: "POST" });
                const data = await res.json();
                if (res.ok) {
                  onRefresh();
                  pushToast({
                    title: t("dash.siteDuplicated"),
                    description: `"${data.site.title}" created as a draft.`,
                    variant: "success",
                  });
                } else {
                  pushToast({ title: "Duplicate failed", description: data?.error, variant: "error" });
                }
              } catch {
                pushToast({ title: "Failed to duplicate site", variant: "error" });
              }
            }}
            onCopyLink={() => {
              navigator.clipboard.writeText(`${window.location.origin}/${s.slug}`);
              pushToast({ title: t("dash.linkCopied"), variant: "success" });
            }}
            onChangeTheme={async (newTheme) => {
              try {
                const res = await fetch(`/api/sites/${s.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ theme: newTheme }),
                });
                if (res.ok) {
                  onRefresh();
                  pushToast({
                    title: t("dash.themeUpdated"),
                    description: `Theme changed to ${newTheme}.`,
                    variant: "success",
                  });
                } else {
                  const e = await res.json();
                  pushToast({ title: "Theme change failed", description: e?.error, variant: "error" });
                }
              } catch {
                pushToast({ title: "Failed to change theme", variant: "error" });
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SiteCard({
  site,
  onOpenEditor,
  onPreview,
  onTogglePublish,
  onDelete,
  onDuplicate,
  onCopyLink,
  onChangeTheme,
}: {
  site: Site;
  onOpenEditor: () => void;
  onPreview: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCopyLink: () => void;
  onChangeTheme: (theme: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const { t } = useTranslation();
  const themes = [
    { id: "aurora", name: "Aurora", swatch: "from-[#0d2818] to-[#96a131]" },
    { id: "noir", name: "Noir", swatch: "from-[#000900] to-[#0d2818]" },
    { id: "sunset", name: "Sunset", swatch: "from-[#96a131] to-[#000900]" },
    { id: "mint", name: "Mint", swatch: "from-[#f0faf4] to-[#96a131]" },
    { id: "crimson", name: "Crimson", swatch: "from-[#0d2818] to-[#96a131]" },
  ];
  return (
    <Card className="group overflow-hidden border-ef-line bg-ef-surface/40 transition-colors hover:bg-ef-surface/80">
      <div
        className="relative aspect-[16/9] overflow-hidden"
        style={{ background: site.coverImage ?? undefined }}
      >
        {!site.coverImage && (
          <div
            className={`absolute inset-0 ${
              site.theme === "aurora"
                ? "bg-gradient-to-br from-[#0d2818] via-[#0d2818] to-[#96a131]"
                : site.theme === "noir"
                  ? "bg-gradient-to-br from-[#000900] to-[#0d2818]"
                  : site.theme === "sunset"
                    ? "bg-gradient-to-br from-[#96a131] to-[#000900]"
                    : site.theme === "mint"
                      ? "bg-gradient-to-br from-[#f0faf4] to-[#96a131]"
                      : "bg-gradient-to-br from-[#0d2818] to-[#96a131]"
            }`}
          />
        )}
        <div className="absolute inset-0 ef-grid-bg opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
            {site.type}
          </span>
          {site.published ? (
            <span className="rounded-full bg-ef-amber/30 px-2 py-0.5 text-[10px] font-medium text-ef-amber backdrop-blur">
              {t("editor.live")}
            </span>
          ) : (
            <span className="rounded-full bg-ef-muted/30 px-2 py-0.5 text-[10px] font-medium text-ef-muted backdrop-blur">
              {t("admin.draft")}
            </span>
          )}
        </div>
        <button
          onClick={onPreview}
          className="absolute right-3 top-3 rounded-md bg-white/10 p-1.5 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
          aria-label={t("dash.preview")}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-base font-semibold text-white">{site.title}</h3>
          {site.subtitle && <p className="mt-0.5 text-xs text-white/80">{site.subtitle}</p>}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 text-xs text-ef-muted">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {formatNumber(site.views)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" /> {formatNumber(site.likes)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {timeAgo(site.updatedAt)}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1 font-mono text-[10px] text-ef-muted">
          <Globe className="h-3 w-3" />
          <span className="truncate">/{site.slug}</span>
          <button
            onClick={() => {
              onCopyLink();
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="ml-auto rounded p-1 text-ef-muted hover:bg-ef-surface hover:text-ef-ink"
            aria-label={t("public.copyLink")}
          >
            {copied ? <Check className="h-3 w-3 text-ef-amber" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      </CardContent>
      <CardFooter className="border-t border-ef-line/40 p-2">
        <Button variant="ghost" size="sm" onClick={onOpenEditor} className="flex-1 text-ef-ink">
          <Pencil className="mr-1 h-3.5 w-3.5" /> {t("dash.edit")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-ef-muted">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-ef-bg border-ef-line">
            <DropdownMenuItem onClick={onPreview} className="text-ef-ink">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> {t("dash.preview")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCopyLink} className="text-ef-ink">
              <Copy className="mr-1.5 h-3.5 w-3.5" /> {t("dash.copyLink")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate} className="text-ef-ink">
              <CopyPlus className="mr-1.5 h-3.5 w-3.5" /> {t("dash.duplicate")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setThemeOpen(true)} className="text-ef-ink">
              <Palette className="mr-1.5 h-3.5 w-3.5" /> {t("dash.changeTheme")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onTogglePublish} className="text-ef-ink">
              <Globe className="mr-1.5 h-3.5 w-3.5" /> {site.published ? "Unpublish" : t("editor.publish")}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-ef-line" />
            <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> {t("dash.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>

      {/* Change theme dialog */}
      <Dialog open={themeOpen} onOpenChange={setThemeOpen}>
        <DialogContent className="max-w-md bg-ef-bg border-ef-line">
          <DialogHeader>
            <DialogTitle className="text-ef-ink">{t("dash.changeTheme")}</DialogTitle>
            <DialogDescription className="text-ef-muted">
              Pick a new theme for “{site.title}”. The hero gradient + section accents will update instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-2 py-2">
            {themes.map((th) => (
              <button
                key={th.id}
                onClick={() => {
                  onChangeTheme(th.id);
                  setThemeOpen(false);
                }}
                className={`group flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all ${
                  site.theme === th.id ? "border-ef-amber ring-1 ring-ef-amber/40" : "border-ef-line hover:border-ef-muted/60"
                }`}
              >
                <span className={`h-10 w-full rounded-md bg-gradient-to-br ${th.swatch}`} />
                <span className="text-[10px] font-medium text-ef-ink">{th.name}</span>
                {site.theme === th.id && (
                  <span className="text-[9px] text-ef-amber">current</span>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function TemplatesTab({
  templates,
  hasPortfolio,
  onCreated,
  pushToast,
}: {
  templates: Template[];
  hasPortfolio: boolean;
  onCreated: (site: Site) => void;
  pushToast: (t: { title: string; description?: string; variant?: "default" | "success" | "error" }) => void;
}) {
  const { t } = useTranslation();
  const [creatingId, setCreatingId] = useState<string | null>(null);
  return (
    <div>
      <p className="mb-4 text-sm text-ef-muted">
        {t("templates.desc")}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => {
          const isDisabled = tpl.type === "portfolio" && hasPortfolio;
          return (
          <Card key={tpl.id} className={`overflow-hidden border-ef-line ${isDisabled ? "opacity-50" : "bg-ef-surface/40"}`}>
            <div className="relative aspect-[16/10]" style={{ background: tpl.thumbnail }} />
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-ef-ink">{tpl.name}</h3>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ef-amber">
                    {tpl.category} · {tpl.type}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-ef-muted">{tpl.theme}</span>
              </div>
              <p className="mt-2 text-xs text-ef-muted">{tpl.description}</p>
              {isDisabled && (
                <p className="mt-2 text-[10px] text-ef-muted">{t("dash.portfolioExists")}</p>
              )}
            </CardContent>
            <CardFooter className="border-t border-ef-line/40 p-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-ef-ink"
                disabled={isDisabled || creatingId === tpl.id}
                onClick={async () => {
                  setCreatingId(tpl.id);
                  try {
                    const res = await fetch("/api/sites", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: tpl.type,
                        title: tpl.name,
                        theme: tpl.theme,
                        templateId: tpl.id,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      pushToast({ title: t("dash.siteCreated"), description: data?.error, variant: "error" });
                      return;
                    }
                    pushToast({
                      title: t("dash.siteCreated"),
                      description: `"${data.site.title}" is ready to edit.`,
                      variant: "success",
                    });
                    onCreated(data.site);
                  } catch {
                    pushToast({ title: "Network error", variant: "error" });
                  } finally {
                    setCreatingId(null);
                  }
                }}
              >
                {creatingId === tpl.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <ArrowUpRight className="mr-1 h-3.5 w-3.5" />}
                {creatingId === tpl.id ? t("templates.creating") : t("templates.useTemplate")}
              </Button>
            </CardFooter>
          </Card>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsTab({ sites }: { sites: Site[] }) {
  const { t } = useTranslation();
  const totalViews = sites.reduce((a, b) => a + b.views, 0);
  const totalLikes = sites.reduce((a, b) => a + b.likes, 0);
  const published = sites.filter((s) => s.published).length;

  const sorted = [...sites].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t("dash.totalSites")} value={String(sites.length)} icon={LayoutGrid} />
        <StatCard label={t("dash.published")} value={String(published)} icon={Globe} />
        <StatCard label={t("dash.totalViews")} value={formatNumber(totalViews)} icon={Eye} />
        <StatCard label={t("dash.totalLikes")} value={formatNumber(totalLikes)} icon={Heart} />
      </div>

      <h3 className="mt-8 text-base font-semibold text-ef-ink">{t("dash.topSites")}</h3>
      <div className="mt-3 divide-y divide-ef-line/40 rounded-xl border border-ef-line bg-ef-bg">
        {sorted.length === 0 && (
          <p className="p-6 text-sm text-ef-muted">No sites yet — publish one to see analytics here.</p>
        )}
        {sorted.map((s, i) => (
          <div key={s.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-ef-muted">#{i + 1}</span>
              <div>
                <p className="text-sm font-medium text-ef-ink">{s.title}</p>
                <p className="text-[10px] text-ef-muted">/{s.slug} · {s.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-ef-muted">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {formatNumber(s.views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> {formatNumber(s.likes)}
              </span>
              <TrendingUp className="h-3.5 w-3.5 text-ef-amber" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="border-ef-line bg-ef-surface/40">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-ef-muted">{label}</p>
          <Icon className="h-3.5 w-3.5 text-ef-amber" />
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-ef-ink">{value}</p>
      </CardContent>
    </Card>
  );
}

function SettingsTab({ user, pushToast }: { user: CurrentUser; pushToast: (t: { title: string; description?: string; variant?: "default" | "success" | "error" }) => void }) {
  const setUser = useAppStore((s) => s.setUser);
  const { t } = useTranslation();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl ?? null);
  const [coverUrl, setCoverUrl] = useState<string | null>(user.coverUrl ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const onNameChange = (v: string) => {
    setName(v);
    setDirty(v !== user.name || bio !== (user.bio ?? ""));
  };
  const onBioChange = (v: string) => {
    setBio(v);
    setDirty(v !== (user.bio ?? "") || name !== user.name);
  };

  const uploadImage = async (file: File, kind: "avatar" | "cover") => {
    const setUploading = kind === "avatar" ? setUploadingAvatar : setUploadingCover;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        if (kind === "avatar") setAvatarUrl(dataUrl);
        else setCoverUrl(dataUrl);
        try {
          const res = await fetch("/api/users/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(kind === "avatar" ? { avatarUrl: dataUrl } : { coverUrl: dataUrl }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.user) {
              setUser({
                ...user,
                name: data.user.name,
                bio: data.user.bio,
                avatarUrl: data.user.avatarUrl,
                coverUrl: data.user.coverUrl,
              });
            }
            pushToast({ title: kind === "avatar" ? "Profile picture updated" : "Cover picture updated", variant: "success" });
          } else {
            pushToast({ title: "Upload failed", variant: "error" });
          }
        } catch {
          pushToast({ title: "Network error", variant: "error" });
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        pushToast({ title: "Failed to read file", variant: "error" });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      pushToast({ title: "Display name can't be empty", variant: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast({ title: "Save failed", description: data?.error, variant: "error" });
        return;
      }
      if (data?.user) {
        setUser({ ...user, name: data.user.name, bio: data.user.bio, avatarUrl: data.user.avatarUrl, coverUrl: data.user.coverUrl });
      }
      setDirty(false);
      pushToast({ title: t("dash.profileSaved"), description: t("dash.savedLocally"), variant: "success" });
    } catch (e) {
      pushToast({ title: "Network error", description: String(e), variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-base font-semibold text-ef-ink">{t("dash.profile")}</h3>
      <p className="mt-1 text-sm text-ef-muted">
        {t("dash.profileDesc")}
      </p>

      {/* Profile picture + Cover picture */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Profile picture */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-ef-ink">{t("auth.profilePic")}</Label>
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-ef-line bg-ef-surface">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ef-muted">
                  <User className="h-6 w-6" />
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f, "avatar");
                }}
              />
              <Button variant="outline" size="sm" className="border-ef-line text-ef-ink hover:bg-ef-surface" disabled={uploadingAvatar}>
                {uploadingAvatar ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1 h-3.5 w-3.5" />}
                {uploadingAvatar ? "Uploading…" : "Upload"}
              </Button>
            </label>
          </div>
        </div>

        {/* Cover picture */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-ef-ink">{t("auth.coverPic")}</Label>
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-ef-line bg-ef-surface">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ef-muted">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f, "cover");
                }}
              />
              <Button variant="outline" size="sm" className="border-ef-line text-ef-ink hover:bg-ef-surface" disabled={uploadingCover}>
                {uploadingCover ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1 h-3.5 w-3.5" />}
                {uploadingCover ? "Uploading…" : "Upload"}
              </Button>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-ef-ink">{t("dash.email")}</Label>
          <Input value={user.email} disabled className="bg-ef-surface border-ef-line text-ef-muted" />
          <p className="text-[10px] text-ef-muted">{t("dash.emailCantChange")}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-ef-ink">{t("dash.displayName")}</Label>
          <Input id="name" value={name} onChange={(e) => onNameChange(e.target.value)} className="bg-ef-surface border-ef-line" maxLength={80} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio" className="text-xs font-medium text-ef-ink">{t("dash.bio")}</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder="A short bio shown on your public profile."
            className="bg-ef-surface border-ef-line min-h-[100px]"
            maxLength={500}
          />
          <p className="text-[10px] text-ef-muted text-right">{bio.length} / 500</p>
        </div>
        <Button onClick={save} disabled={saving || !dirty} className="bg-ef-ink text-ef-bg hover:bg-ef-ink/90">
          {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
          {t("dash.saveChanges")}
        </Button>
      </div>

      <div className="mt-10 rounded-xl border border-ef-line bg-ef-surface/40 p-4">
        <p className="text-xs font-medium text-ef-ink">{t("dash.accountInfo")}</p>
        <dl className="mt-3 space-y-2 text-xs text-ef-muted">
          <div className="flex justify-between">
            <dt>{t("dash.planLabel")}</dt>
            <dd className="font-mono text-ef-ink">{user.plan}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{t("dash.role")}</dt>
            <dd className="font-mono text-ef-ink">{user.role}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{t("dash.userId")}</dt>
            <dd className="font-mono text-ef-muted truncate ml-4">{user.id}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
