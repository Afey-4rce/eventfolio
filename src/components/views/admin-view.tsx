"use client";

import { useAppStore } from "@/lib/store";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Loader2,
  Users,
  Globe,
  Eye,
  Heart,
  Plus,
  TrendingUp,
  Calendar,
  Briefcase,
  CheckSquare,
  Square,
  Trash2,
  Shield,
  ArrowUpRight,
  Search,
  UserCog,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber, formatDate, timeAgo } from "@/lib/helpers";
import { motion } from "framer-motion";
import { LogoutButton } from "@/components/site/navbar";
import { useTranslation } from "@/lib/i18n";

type Stats = {
  totalUsers: number;
  totalSites: number;
  publishedSites: number;
  totalViews: number;
  totalLikes: number;
  newSignupsLast7Days: number;
  sitesByType: { event: number; portfolio: number };
  recentSignups: Array<{ id: string; name: string; email: string; createdAt: string }>;
  recentSites: Array<{
    id: string;
    title: string;
    slug: string;
    ownerName: string;
    createdAt: string;
    type: string;
    published: boolean;
  }>;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
  siteCount: number;
};

type AdminSite = {
  id: string;
  title: string;
  slug: string;
  type: string;
  published: boolean;
  views: number;
  likes: number;
  createdAt: string;
  ownerName: string;
};

export function AdminView() {
  const { t } = useTranslation();
  const user = useAppStore((s) => s.user);
  const view = useAppStore((s) => s.view);
  const goAuth = useAppStore((s) => s.goAuth);
  const goLanding = useAppStore((s) => s.goLanding);
  const setView = useAppStore((s) => s.setView);
  const pushToast = useAppStore((s) => s.pushToast);

  const tab = view.name === "admin" ? view.tab ?? "overview" : "overview";
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");

  // Guard
  useEffect(() => {
    if (user && user.role !== "admin") {
      goLanding();
      return;
    }
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
  }, [user, goLanding, goAuth]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(userSearch)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users ?? []);
      }
    } catch {
      /* ignore */
    }
  }, [userSearch]);

  const loadSites = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sites", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSites(data.sites ?? []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    // Always load admin data on mount. The guard above redirects non-admins.
    // We don't depend on `user` here because the navbar's auth bootstrap may
    // set the user AFTER this view has mounted (AnimatePresence transition),
    // causing this effect to miss the load.
    loadStats();
    loadSites();
    loadUsers();
  }, []);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="flex items-center gap-2 text-sm text-ef-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loadingAdmin")}
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 pt-16">
        <Shield className="h-8 w-8 text-ef-muted" />
        <p className="text-sm text-ef-muted">{t("admin.adminAccessRequired")}</p>
        <Button onClick={goLanding} variant="outline">
          {t("dash.backToSite")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Admin header */}
      <div className="border-b border-ef-line/40 bg-ef-bg/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ef-amber">
              ( Admin · {user.plan === "studio" ? t("admin.studioPlan") : user.plan === "pro" ? t("admin.proPlan") : t("admin.freePlan")} )
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ef-ink">
              {t("admin.title")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={goLanding} variant="ghost" size="sm" className="text-ef-muted hover:text-ef-ink">
              ← {t("admin.site")}
            </Button>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-ef-line/40 bg-ef-bg">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
          {[
            { id: "overview", label: t("admin.overview"), icon: TrendingUp },
            { id: "users", label: t("admin.users"), icon: Users },
            { id: "sites", label: t("admin.sites"), icon: Globe },
          ].map((tabDef) => (
            <button
              key={tabDef.id}
              onClick={() => setView({ name: "admin", tab: tabDef.id as "overview" | "users" | "sites" })}
              className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                tab === tabDef.id ? "text-ef-ink" : "text-ef-muted hover:text-ef-ink"
              }`}
            >
              <tabDef.icon className="h-3.5 w-3.5" />
              {tabDef.label}
              {tab === tabDef.id && (
                <motion.span
                  layoutId="admin-tab"
                  className="absolute inset-x-0 bottom-0 h-px bg-ef-amber"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === "overview" && stats && <OverviewTab stats={stats} />}
        {tab === "users" && (
          <UsersTab
            users={users}
            search={userSearch}
            onSearch={setUserSearch}
            onReload={loadUsers}
            onRoleChange={async (u, role) => {
              try {
                const res = await fetch(`/api/admin/users/${u.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ role }),
                });
                if (res.ok) {
                  pushToast({ title: "Role updated", variant: "success" });
                  loadUsers();
                }
              } catch {
                pushToast({ title: "Update failed", variant: "error" });
              }
            }}
            onPlanChange={async (u, plan) => {
              try {
                const res = await fetch(`/api/admin/users/${u.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ plan }),
                });
                if (res.ok) {
                  pushToast({ title: "Plan updated", variant: "success" });
                  loadUsers();
                }
              } catch {
                pushToast({ title: "Update failed", variant: "error" });
              }
            }}
          />
        )}
        {tab === "sites" && <SitesTab sites={sites} onReload={loadSites} />}
      </div>
    </div>
  );
}

function OverviewTab({ stats }: { stats: Stats }) {
  const { t } = useTranslation();
  return (
    <div>
      {/* Top stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label={t("admin.totalUsers")} value={formatNumber(stats.totalUsers)} icon={Users} sub={`+${stats.newSignupsLast7Days} ${t("admin.thisWeek")}`} />
        <StatCard label={t("admin.totalSites")} value={formatNumber(stats.totalSites)} icon={Globe} sub={`${stats.publishedSites} ${t("admin.published")}`} />
        <StatCard label={t("admin.totalViews")} value={formatNumber(stats.totalViews)} icon={Eye} />
        <StatCard label={t("admin.totalLikes")} value={formatNumber(stats.totalLikes)} icon={Heart} />
        <StatCard
          label={t("admin.byType")}
          value={`${stats.sitesByType.event} / ${stats.sitesByType.portfolio}`}
          icon={Briefcase}
          sub={t("admin.eventsPortfolios")}
        />
      </div>

      {/* Analytics chart */}
      <AnalyticsChart />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Recent signups */}
        <Card className="border-ef-line bg-ef-surface/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-ef-ink">{t("admin.recentSignups")}</CardTitle>
              <Users className="h-3.5 w-3.5 text-ef-amber" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-ef-line/40">
              {stats.recentSignups.length === 0 && (
                <p className="py-6 text-center text-sm text-ef-muted">{t("admin.noSignups")}</p>
              )}
              {stats.recentSignups.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#96a131] to-[#0d2818] text-[10px] font-semibold text-ef-bg">
                      {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ef-ink">{u.name}</p>
                      <p className="text-[10px] text-ef-muted">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-ef-muted">{timeAgo(u.createdAt)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent sites */}
        <Card className="border-ef-line bg-ef-surface/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-ef-ink">{t("admin.recentSites")}</CardTitle>
              <Globe className="h-3.5 w-3.5 text-ef-amber" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-ef-line/40">
              {stats.recentSites.length === 0 && (
                <p className="py-6 text-center text-sm text-ef-muted">{t("admin.noSites")}</p>
              )}
              {stats.recentSites.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        s.type === "event"
                          ? "bg-ef-amber/15 text-ef-amber"
                          : "bg-ef-amber/15 text-ef-amber"
                      }`}
                    >
                      {s.type === "event" ? <Calendar className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ef-ink">{s.title}</p>
                      <p className="text-[10px] text-ef-muted">/{s.slug} · {t("public.by")} {s.ownerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.published && (
                      <span className="rounded-full bg-ef-amber/15 px-2 py-0.5 text-[9px] text-ef-amber">
                        {t("admin.live")}
                      </span>
                    )}
                    <span className="text-[10px] text-ef-muted">{timeAgo(s.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Big number band */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <BigStat label={t("dash.avgViews")} value={stats.totalSites ? Math.round(stats.totalViews / stats.totalSites).toString() : "0"} />
        <BigStat label={t("dash.avgLikes")} value={stats.totalSites ? Math.round(stats.totalLikes / stats.totalSites).toString() : "0"} />
        <BigStat label={t("dash.publishRate")} value={`${stats.totalSites ? Math.round((stats.publishedSites / stats.totalSites) * 100) : 0}%`} />
      </div>
    </div>
  );
}

type TimeseriesDay = { date: string; views: number; likes: number };

function AnalyticsChart() {
  const { t } = useTranslation();
  const [data, setData] = useState<TimeseriesDay[] | null>(null);
  const [range, setRange] = useState<7 | 14 | 30>(14);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/analytics/timeseries?days=${range}`, { cache: "no-store" });
        if (res.ok) {
          const d = await res.json();
          if (!cancelled && Array.isArray(d?.days)) setData(d.days);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const totalViews = data?.reduce((a, b) => a + b.views, 0) ?? 0;
  const totalLikes = data?.reduce((a, b) => a + b.likes, 0) ?? 0;
  const peakViews = data ? Math.max(...data.map((d) => d.views), 1) : 1;

  return (
    <Card className="mt-6 border-ef-line bg-ef-surface/40">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-ef-amber" />
            <CardTitle className="text-sm font-semibold text-ef-ink">{t("admin.engagement", { days: String(range) })}</CardTitle>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-ef-line p-0.5">
            {([7, 14, 30] as const).map((n) => (
              <button
                key={n}
                onClick={() => setRange(n)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  range === n ? "bg-ef-surface text-ef-ink" : "text-ef-muted hover:text-ef-ink"
                }`}
              >
                {n}d
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-ef-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-ef-amber" />
            {formatNumber(totalViews)} {t("dash.totalViews")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-ef-rose" />
            {formatNumber(totalLikes)} {t("dash.totalLikes")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {!data ? (
          <div className="flex h-[200px] items-center justify-center text-xs text-ef-muted">
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> {t("common.loading")}
          </div>
        ) : data.every((d) => d.views === 0 && d.likes === 0) ? (
          <div className="flex h-[200px] items-center justify-center text-xs text-ef-muted">
            No engagement in the last {range} days.
          </div>
        ) : (
          <div className="relative h-[200px] w-full">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="border-t border-ef-line/30" />
              ))}
            </div>
            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-between gap-1">
              {data.map((d) => {
                const vh = (d.views / peakViews) * 100;
                const lh = (d.likes / peakViews) * 100;
                return (
                  <div
                    key={d.date}
                    className="group relative flex h-full flex-1 flex-col-reverse items-stretch justify-end gap-0"
                    title={`${d.date} · ${d.views} views · ${d.likes} likes`}
                  >
                    {/* views bar (amber, stacked on top) */}
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-ef-amber/30 to-ef-amber transition-all duration-300 hover:from-ef-amber/60 hover:to-ef-amber"
                      style={{ height: `${vh}%`, minHeight: d.views > 0 ? "4px" : "0" }}
                    />
                    {/* likes bar (rose, overlaid as a thin bottom accent) */}
                    <div
                      className="absolute bottom-0 w-full rounded-b-sm bg-ef-rose/70 transition-all duration-300"
                      style={{ height: `${lh}%`, minHeight: d.likes > 0 ? "3px" : "0" }}
                    />
                    {/* hover tooltip */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-ef-line bg-ef-bg px-2 py-1 text-[10px] text-ef-ink opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {d.date.slice(5)} · {d.views}v · {d.likes}l
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Date axis */}
        {data && data.length > 0 && (
          <div className="mt-2 flex justify-between text-[9px] font-mono text-ef-muted">
            <span>{data[0].date.slice(5)}</span>
            <span>{data[Math.floor(data.length / 2)].date.slice(5)}</span>
            <span>{data[data.length - 1].date.slice(5)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
}) {
  return (
    <Card className="border-ef-line bg-ef-surface/40">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-ef-muted">{label}</p>
          <Icon className="h-3.5 w-3.5 text-ef-amber" />
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-ef-ink">{value}</p>
        {sub && <p className="mt-1 text-[10px] text-ef-muted">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ef-line bg-ef-surface/40 p-6 text-center">
      <p className="text-4xl font-semibold tracking-tight text-ef-ink">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-ef-muted">{label}</p>
    </div>
  );
}

type SortDir = "asc" | "desc" | null;

/**
 * A sortable table header cell. Clicking cycles: null → asc → desc → null.
 */
function SortableTh({
  label,
  sortKey,
  activeKey,
  activeDir,
  onSort,
  className,
  align = "left",
}: {
  label: string;
  sortKey: string;
  activeKey: string | null;
  activeDir: SortDir;
  onSort: (key: string) => void;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  const isActive = activeKey === sortKey;
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th className={`p-3 ${alignClass} ${className ?? ""}`}>
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-ef-ink ${
          isActive ? "text-ef-amber" : "text-ef-muted"
        }`}
      >
        <span>{label}</span>
        {isActive && activeDir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : isActive && activeDir === "desc" ? (
          <ArrowDown className="h-3 w-3" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

/** Generic sort comparator for strings (case-insensitive) and numbers. */
function compareValues(a: unknown, b: unknown, dir: "asc" | "desc"): number {
  const mult = dir === "asc" ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return (a - b) * mult;
  const aStr = String(a ?? "").toLowerCase();
  const bStr = String(b ?? "").toLowerCase();
  if (aStr < bStr) return -1 * mult;
  if (aStr > bStr) return 1 * mult;
  return 0;
}

/**
 * Reusable pagination footer for admin tables.
 * Shows: rows-per-page selector, "Showing X–Y of Z", prev/next buttons.
 */
function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ef-line/40 px-4 py-3 text-xs text-ef-muted">
      <div className="flex items-center gap-3">
        <span>
          {t("admin.showing")} <span className="font-medium text-ef-ink">{start}–{end}</span> {t("admin.of")}{" "}
          <span className="font-medium text-ef-ink">{total}</span>
        </span>
        <div className="flex items-center gap-1">
          <span className="hidden sm:inline">{t("admin.rows")}:</span>
          <div className="flex items-center gap-0.5 rounded-md border border-ef-line p-0.5">
            {[10, 25, 50].map((s) => (
              <button
                key={s}
                onClick={() => {
                  onPageSizeChange(s);
                  onPageChange(1);
                }}
                className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  pageSize === s ? "bg-ef-surface text-ef-ink" : "text-ef-muted hover:text-ef-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-md border border-ef-line px-2 py-1 text-[10px] font-medium text-ef-ink transition-colors hover:bg-ef-surface disabled:opacity-40 disabled:hover:bg-transparent"
        >
          {t("admin.prev")}
        </button>
        <span className="font-mono">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-md border border-ef-line px-2 py-1 text-[10px] font-medium text-ef-ink transition-colors hover:bg-ef-surface disabled:opacity-40 disabled:hover:bg-transparent"
        >
          {t("admin.next")}
        </button>
      </div>
    </div>
  );
}

function UsersTab({
  users,
  search,
  onSearch,
  onReload,
  onRoleChange,
  onPlanChange,
}: {
  users: AdminUser[];
  search: string;
  onSearch: (s: string) => void;
  onReload: () => void;
  onRoleChange: (u: AdminUser, role: string) => void;
  onPlanChange: (u: AdminUser, plan: string) => void;
}) {
  const { t } = useTranslation();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkBusy, setBulkBusy] = useState(false);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    } else {
      setSortDir("asc");
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return users;
    const getValue = (u: AdminUser): unknown => {
      switch (sortKey) {
        case "name": return u.name;
        case "email": return u.email;
        case "joined": return new Date(u.createdAt).getTime();
        case "sites": return u.siteCount;
        case "role": return u.role;
        case "plan": return u.plan;
        default: return u.name;
      }
    };
    return [...users].sort((a, b) => compareValues(getValue(a), getValue(b), sortDir));
  }, [users, sortKey, sortDir]);

  // Paginate the sorted results
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === paged.length && paged.length > 0) {
        return new Set();
      }
      return new Set(paged.map((u) => u.id));
    });
  };

  const allSelected = paged.length > 0 && selectedIds.size === paged.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setBulkBusy(true);
    try {
      const ids = Array.from(selectedIds);
      if (bulkAction === "role-user" || bulkAction === "role-admin") {
        const role = bulkAction === "role-admin" ? "admin" : "user";
        await Promise.all(
          ids.map((id) =>
            fetch(`/api/admin/users/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role }),
            })
          )
        );
      } else if (bulkAction === "plan-free" || bulkAction === "plan-pro" || bulkAction === "plan-studio") {
        const plan = bulkAction.replace("plan-", "");
        await Promise.all(
          ids.map((id) =>
            fetch(`/api/admin/users/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan }),
            })
          )
        );
      }
      await new Promise((r) => setTimeout(r, 100));
      onReload();
      setSelectedIds(new Set());
      setBulkAction("");
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ef-muted" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("admin.search")}
            className="bg-ef-surface border-ef-line pl-8"
          />
        </div>
        <Button onClick={onReload} variant="outline" size="sm" className="border-ef-line text-ef-ink hover:bg-ef-surface">
          {t("admin.refresh")}
        </Button>
        <span className="ml-auto text-xs text-ef-muted">
          {sorted.length} user{sorted.length === 1 ? "" : "s"}
          {sortKey && sortDir ? ` · ${t("admin.sortedBy")} ${sortKey} (${sortDir})` : ""}
        </span>
      </div>

      {/* Bulk action bar — visible when rows are selected */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-ef-amber/40 bg-ef-amber/5 px-3 py-2">
          <span className="text-xs font-medium text-ef-amber">
            {selectedIds.size} {t("admin.selected")}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="h-7 rounded-md border border-ef-line bg-ef-surface px-2 text-xs text-ef-ink"
            >
              <option value="">{t("admin.chooseAction")}</option>
              <option value="role-user">{t("admin.setRole", { role: "user" })}</option>
              <option value="role-admin">{t("admin.setRole", { role: "admin" })}</option>
              <option value="plan-free">{t("admin.setPlan", { plan: "free" })}</option>
              <option value="plan-pro">{t("admin.setPlan", { plan: "pro" })}</option>
              <option value="plan-studio">{t("admin.setPlan", { plan: "studio" })}</option>
            </select>
            <Button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkBusy}
              size="sm"
              className="h-7 bg-ef-ink text-ef-bg hover:bg-ef-ink/90"
            >
              {bulkBusy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              {t("admin.apply")}
            </Button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="rounded-md px-2 py-1 text-xs text-ef-muted hover:text-ef-ink"
            >
              {t("admin.clear")}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-ef-line bg-ef-bg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ef-line bg-ef-surface/40 text-[10px] uppercase tracking-wider text-ef-muted">
              <th className="w-10 p-3">
                <button
                  onClick={toggleSelectAll}
                  className="text-ef-muted hover:text-ef-ink"
                  aria-label={allSelected ? "Deselect all" : "Select all"}
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4 text-ef-amber" />
                  ) : someSelected ? (
                    <CheckSquare className="h-4 w-4 text-ef-amber/50" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <SortableTh label={t("admin.user")} sortKey="name" activeKey={sortKey} activeDir={sortDir} onSort={handleSort} />
              <SortableTh label={t("admin.joined")} sortKey="joined" activeKey={sortKey} activeDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
              <SortableTh label={t("admin.sitesCol")} sortKey="sites" activeKey={sortKey} activeDir={sortDir} onSort={handleSort} align="right" />
              <SortableTh label={t("dash.role")} sortKey="role" activeKey={sortKey} activeDir={sortDir} onSort={handleSort} />
              <SortableTh label={t("admin.plan")} sortKey="plan" activeKey={sortKey} activeDir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-ef-muted">
                  {t("admin.noUsers")}
                </td>
              </tr>
            )}
            {paged.map((u, i) => (
              <tr key={u.id} className={`border-b border-ef-line/40 last:border-0 hover:bg-ef-surface/60 ${i % 2 === 1 ? "bg-ef-surface/30" : ""} ${selectedIds.has(u.id) ? "bg-ef-amber/5" : ""}`}>
                <td className="w-10 p-3">
                  <button
                    onClick={() => toggleSelect(u.id)}
                    className="text-ef-muted hover:text-ef-ink"
                    aria-label={`Select ${u.name}`}
                  >
                    {selectedIds.has(u.id) ? (
                      <CheckSquare className="h-4 w-4 text-ef-amber" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#96a131] to-[#0d2818] text-[9px] font-semibold text-ef-bg">
                      {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ef-ink">{u.name}</p>
                      <p className="text-[10px] text-ef-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden p-3 text-xs text-ef-muted sm:table-cell">
                  {formatDate(u.createdAt)}
                </td>
                <td className="p-3 text-right text-xs text-ef-ink">{u.siteCount}</td>
                <td className="p-3">
                  <Select
                    value={u.role}
                    onValueChange={(v) => onRoleChange(u, v)}
                  >
                    <SelectTrigger className="h-7 w-[100px] bg-ef-surface border-ef-line text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ef-bg border-ef-line">
                      <SelectItem value="user">user</SelectItem>
                      <SelectItem value="admin">admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  <Select
                    value={u.plan}
                    onValueChange={(v) => onPlanChange(u, v)}
                  >
                    <SelectTrigger className="h-7 w-[100px] bg-ef-surface border-ef-line text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-ef-bg border-ef-line">
                      <SelectItem value="free">free</SelectItem>
                      <SelectItem value="pro">pro</SelectItem>
                      <SelectItem value="studio">studio</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length > 0 && (
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            total={sorted.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </div>
  );
}

function SitesTab({ sites, onReload }: { sites: AdminSite[]; onReload: () => void }) {
  const { t } = useTranslation();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkBusy, setBulkBusy] = useState(false);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    } else {
      setSortDir("asc");
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return sites;
    const getValue = (s: AdminSite): unknown => {
      switch (sortKey) {
        case "title": return s.title;
        case "owner": return s.ownerName;
        case "type": return s.type;
        case "status": return s.published ? "live" : "draft";
        case "views": return s.views;
        case "likes": return s.likes;
        case "created": return new Date(s.createdAt).getTime();
        default: return s.title;
      }
    };
    return [...sites].sort((a, b) => compareValues(getValue(a), getValue(b), sortDir));
  }, [sites, sortKey, sortDir]);

  // Paginate the sorted results
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const publishedCount = sites.filter((s) => s.published).length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === paged.length && paged.length > 0) {
        return new Set();
      }
      return new Set(paged.map((s) => s.id));
    });
  };

  const allSelected = paged.length > 0 && selectedIds.size === paged.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setBulkBusy(true);
    try {
      const ids = Array.from(selectedIds);
      if (bulkAction === "publish" || bulkAction === "unpublish") {
        const shouldPublish = bulkAction === "publish";
        await Promise.all(
          ids.map((id) =>
            fetch(`/api/sites/${id}/publish`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ published: shouldPublish }),
            })
          )
        );
      } else if (bulkAction === "delete") {
        await Promise.all(
          ids.map((id) => fetch(`/api/sites/${id}`, { method: "DELETE" }))
        );
      }
      await new Promise((r) => setTimeout(r, 100));
      onReload();
      setSelectedIds(new Set());
      setBulkAction("");
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <p className="text-sm text-ef-muted">
          {sites.length} {t("admin.sitesOnPlatform")} · {publishedCount} {t("admin.published")}
        </p>
        <span className="ml-auto text-xs text-ef-muted">
          {sortKey && sortDir ? `${t("admin.sortedBy")} ${sortKey} (${sortDir})` : ""}
        </span>
      </div>

      {/* Bulk action bar — visible when rows are selected */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-ef-amber/40 bg-ef-amber/5 px-3 py-2">
          <span className="text-xs font-medium text-ef-amber">
            {selectedIds.size} {t("admin.selected")}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="h-7 rounded-md border border-ef-line bg-ef-surface px-2 text-xs text-ef-ink"
            >
              <option value="">{t("admin.chooseAction")}</option>
              <option value="publish">{t("admin.publishAll")}</option>
              <option value="unpublish">{t("admin.unpublishAll")}</option>
              <option value="delete">{t("admin.deleteAll")}</option>
            </select>
            <Button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkBusy}
              size="sm"
              className={`h-7 hover:opacity-90 ${
                bulkAction === "delete"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-ef-ink text-ef-bg hover:bg-ef-ink/90"
              }`}
            >
              {bulkBusy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              {t("admin.apply")}
            </Button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="rounded-md px-2 py-1 text-xs text-ef-muted hover:text-ef-ink"
            >
              {t("admin.clear")}
            </button>
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-ef-line bg-ef-bg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ef-line bg-ef-surface/40 text-[10px] uppercase tracking-wider text-ef-muted">
              <th className="w-10 p-3">
                <button
                  onClick={toggleSelectAll}
                  className="text-ef-muted hover:text-ef-ink"
                  aria-label={allSelected ? "Deselect all" : "Select all"}
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4 text-ef-amber" />
                  ) : someSelected ? (
                    <CheckSquare className="h-4 w-4 text-ef-amber/50" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <SortableTh label={t("admin.titleCol")} sortKey="title" activeKey={sortKey} activeDir={sortDir} onSort={handleSort} />
              <SortableTh label={t("admin.owner")} sortKey="owner" activeKey={sortKey} activeDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
              <SortableTh label={t("admin.typeCol")} sortKey="type" activeKey={sortKey} activeDir={sortDir} onSort={handleSort} />
              <SortableTh label={t("admin.status")} sortKey="status" activeKey={sortKey} activeDir={sortDir} onSort={handleSort} />
              <SortableTh label={t("admin.viewsCol")} sortKey="views" activeKey={sortKey} activeDir={sortDir} onSort={handleSort} align="right" className="hidden sm:table-cell" />
              <SortableTh label={t("admin.likesCol")} sortKey="likes" activeKey={sortKey} activeDir={sortDir} onSort={handleSort} align="right" className="hidden sm:table-cell" />
              <SortableTh label={t("admin.created")} sortKey="created" activeKey={sortKey} activeDir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-sm text-ef-muted">
                  {t("admin.noSites")}
                </td>
              </tr>
            )}
            {paged.map((s, i) => (
              <tr key={s.id} className={`border-b border-ef-line/40 last:border-0 hover:bg-ef-surface/60 ${i % 2 === 1 ? "bg-ef-surface/30" : ""} ${selectedIds.has(s.id) ? "bg-ef-amber/5" : ""}`}>
                <td className="w-10 p-3">
                  <button
                    onClick={() => toggleSelect(s.id)}
                    className="text-ef-muted hover:text-ef-ink"
                    aria-label={`Select ${s.title}`}
                  >
                    {selectedIds.has(s.id) ? (
                      <CheckSquare className="h-4 w-4 text-ef-amber" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="p-3">
                  <p className="text-sm font-medium text-ef-ink">{s.title}</p>
                  <p className="text-[10px] text-ef-muted">/{s.slug}</p>
                </td>
                <td className="hidden p-3 text-xs text-ef-ink sm:table-cell">{s.ownerName}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                    s.type === "event"
                      ? "bg-ef-amber/15 text-ef-amber"
                      : "bg-ef-amber/15 text-ef-amber"
                  }`}>
                    {s.type}
                  </span>
                </td>
                <td className="p-3">
                  {s.published ? (
                    <span className="rounded-full bg-ef-amber/15 px-2 py-0.5 text-[9px] text-ef-amber">{t("admin.live")}</span>
                  ) : (
                    <span className="rounded-full bg-ef-muted/15 px-2 py-0.5 text-[9px] text-ef-muted">{t("admin.draft")}</span>
                  )}
                </td>
                <td className="hidden p-3 text-right text-xs text-ef-muted sm:table-cell">{formatNumber(s.views)}</td>
                <td className="hidden p-3 text-right text-xs text-ef-muted sm:table-cell">{formatNumber(s.likes)}</td>
                <td className="p-3 text-[10px] text-ef-muted">{timeAgo(s.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length > 0 && (
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            total={sorted.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </div>
  );
}
