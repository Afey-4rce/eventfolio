import { create } from "zustand";

export type View =
  | { name: "landing" }
  | { name: "auth-signup" }
  | { name: "auth-login" }
  | { name: "dashboard"; tab?: "sites" | "templates" | "analytics" | "settings" }
  | { name: "editor"; siteId?: string; type: "event" | "portfolio"; templateId?: string }
  | { name: "preview"; siteId: string }
  | { name: "admin"; tab?: "overview" | "users" | "sites" | "analytics" };

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  plan: "free" | "pro" | "studio";
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
};

type AppState = {
  // Routing
  view: View;
  setView: (v: View) => void;
  goLanding: () => void;
  goAuth: (mode: "login" | "signup") => void;
  goDashboard: (tab?: "sites" | "templates" | "analytics" | "settings") => void;
  goEditor: (params: { siteId?: string; type: "event" | "portfolio"; templateId?: string }) => void;
  goPreview: (siteId: string) => void;
  goAdmin: (tab?: "overview" | "users" | "sites" | "analytics") => void;

  // Auth
  user: CurrentUser | null;
  setUser: (u: CurrentUser | null) => void;
  logout: () => void;

  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;

  // Language
  language: "en" | "fr";
  setLanguage: (lang: "en" | "fr") => void;

  // Toast notifications (lightweight, in-store)
  toasts: Array<{ id: string; title: string; description?: string; variant: "default" | "success" | "error" }>;
  pushToast: (t: { title: string; description?: string; variant?: "default" | "success" | "error" }) => void;
  dismissToast: (id: string) => void;
};

let toastSeq = 0;

export const useAppStore = create<AppState>((set, get) => ({
  view: { name: "landing" },
  setView: (v) => set({ view: v }),
  goLanding: () => set({ view: { name: "landing" } }),
  goAuth: (mode) => set({ view: mode === "signup" ? { name: "auth-signup" } : { name: "auth-login" } }),
  goDashboard: (tab) => set({ view: { name: "dashboard", tab: tab ?? "sites" } }),
  goEditor: ({ siteId, type, templateId }) =>
    set({ view: { name: "editor", siteId, type, templateId } }),
  goPreview: (siteId) => set({ view: { name: "preview", siteId } }),
  goAdmin: (tab) => set({ view: { name: "admin", tab: tab ?? "overview" } }),

  user: null,
  setUser: (u) => set({ user: u }),
  logout: () => {
    set({ user: null, view: { name: "landing" } });
  },

  theme: "dark",
  toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),

  language: "en",
  setLanguage: (lang) => set({ language: lang }),

  toasts: [],
  pushToast: ({ title, description, variant = "default" }) => {
    toastSeq += 1;
    const id = `t-${Date.now()}-${toastSeq}`;
    set((s) => ({ toasts: [...s.toasts, { id, title, description, variant }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
