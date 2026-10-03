"use client";

import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthView() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const setUser = useAppStore((s) => s.setUser);
  const goDashboard = useAppStore((s) => s.goDashboard);
  const goLanding = useAppStore((s) => s.goLanding);
  const pushToast = useAppStore((s) => s.pushToast);

  const mode = view.name === "auth" ? view.mode : "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const close = () => goLanding();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, name };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast({
          title: "Authentication failed",
          description: data?.error || "Please try again.",
          variant: "error",
        });
        return;
      }
      setUser(data.user);
      pushToast({
        title: mode === "login" ? "Welcome back" : "Account created",
        description: `Signed in as ${data.user.email}`,
        variant: "success",
      });
      goDashboard();
    } catch (err) {
      pushToast({
        title: "Network error",
        description: String(err),
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-ef-line bg-ef-bg shadow-2xl"
      >
        <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-ef-amber/20 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-ef-violet/20 blur-[80px]" />

        <div className="relative p-8">
          <button
            onClick={close}
            className="absolute right-4 top-4 rounded-md p-1.5 text-ef-muted hover:bg-ef-surface hover:text-ef-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ef-amber via-ef-rose to-ef-violet text-ef-bg">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-mono text-sm font-semibold tracking-tight text-ef-ink">
              EventFolio<span className="text-ef-amber">.</span>
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ef-ink">
            {mode === "login" ? "Welcome back." : "Start free in 30 seconds."}
          </h1>
          <p className="mt-1 text-sm text-ef-muted">
            {mode === "login"
              ? "Log in to keep building your event & portfolio pages."
              : "Create an account — no credit card, free forever for one project."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-ef-ink">
                  Display name
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maya Lin"
                  className="bg-ef-surface border-ef-line"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-ef-ink">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="bg-ef-surface border-ef-line"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-ef-ink">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="bg-ef-surface border-ef-line"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-ef-ink text-ef-bg hover:bg-ef-ink/90"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-1.5 h-4 w-4" />
              )}
              {mode === "login" ? "Log in" : "Create account"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-ef-line bg-ef-surface/40 p-3 text-xs text-ef-muted">
            <p className="font-medium text-ef-ink">Demo accounts</p>
            <p className="mt-1 font-mono">demo@eventfolio.app / demo12345</p>
            <p className="font-mono">admin@eventfolio.app / admin12345</p>
          </div>

          <p className="mt-6 text-center text-xs text-ef-muted">
            {mode === "login" ? "New to EventFolio?" : "Already have an account?"}{" "}
            <button
              onClick={() => setView({ name: "auth", mode: mode === "login" ? "signup" : "login" })}
              className="font-medium text-ef-amber hover:underline"
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
