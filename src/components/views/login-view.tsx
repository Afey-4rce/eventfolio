"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { ArrowRight, Loader2, Mail, Lock, ArrowLeft } from "lucide-react";

export function LoginView() {
  const { t } = useTranslation();
  const goLanding = useAppStore((s) => s.goLanding);
  const goAuth = useAppStore((s) => s.goAuth);
  const setUser = useAppStore((s) => s.setUser);
  const goDashboard = useAppStore((s) => s.goDashboard);
  const pushToast = useAppStore((s) => s.pushToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      pushToast({ title: t("auth.emailRequired"), variant: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast({ title: t("login.loginFailed"), description: data?.error, variant: "error" });
        return;
      }
      setUser(data.user);
      pushToast({ title: t("login.welcomeBack"), description: data.user.email, variant: "success" });
      goDashboard();
    } catch {
      pushToast({ title: t("auth.networkError"), variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [email, password, setUser, goDashboard, pushToast, t]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-ef-bg px-4 py-8">
      {/* Back to site button — top-left */}
      <button
        onClick={goLanding}
        className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg border border-ef-line px-3 py-2 text-xs font-medium text-ef-muted transition-colors hover:text-ef-ink hover:bg-ef-surface sm:left-8 sm:top-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t("auth.backToSite")}
      </button>

      {/* Logo */}
      <button
        onClick={goLanding}
        className="mb-8 flex items-center gap-2"
        aria-label="EventFolio home"
      >
        <img src="/icon-limemoss.svg" alt="EventFolio" className="h-9 w-9 object-contain" />
        <span className="font-mono text-lg font-semibold tracking-tight text-ef-ink">
          EventFolio<span className="text-ef-amber">.</span>
        </span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-ef-ink">{t("login.welcome")}</h1>
          <p className="mt-2 text-sm text-ef-muted">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="group">
            <label className="mb-1.5 block text-xs font-medium text-ef-muted">{t("auth.email")}</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ef-muted/60" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full border-b border-ef-line bg-transparent py-2.5 pl-7 text-sm text-ef-ink placeholder:text-ef-muted/50 transition-colors focus:border-ef-amber focus:outline-none"
              />
            </div>
          </div>

          <div className="group">
            <label className="mb-1.5 block text-xs font-medium text-ef-muted">{t("auth.password")}</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ef-muted/60" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full border-b border-ef-line bg-transparent py-2.5 pl-7 text-sm text-ef-ink placeholder:text-ef-muted/50 transition-colors focus:border-ef-amber focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ef-amber px-4 py-3 text-sm font-medium text-ef-bg transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? t("login.signingIn") : t("login.continue")}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="mt-8 rounded-lg border border-ef-line bg-ef-surface/40 p-4 text-xs text-ef-muted">
          <p className="font-medium text-ef-ink">{t("login.demoAccounts")}</p>
          <div className="mt-2 space-y-1">
            <button
              onClick={() => { setEmail("demo@eventfolio.app"); setPassword("demo12345"); }}
              className="block w-full text-left font-mono hover:text-ef-amber"
            >
              demo@eventfolio.app / demo12345
            </button>
            <button
              onClick={() => { setEmail("admin@eventfolio.app"); setPassword("admin12345"); }}
              className="block w-full text-left font-mono hover:text-ef-amber"
            >
              admin@eventfolio.app / admin12345
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ef-muted">
          {t("login.newToEventFolio")}{" "}
          <button
            onClick={() => goAuth("signup")}
            className="font-medium text-ef-amber hover:underline"
          >
            {t("login.createAccount")}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
