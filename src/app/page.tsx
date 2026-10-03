"use client";

import { useAppStore } from "@/lib/store";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { LandingView } from "@/components/views/landing-view";
import { AuthWizardView } from "@/components/views/auth-wizard-view";
import { LoginView } from "@/components/views/login-view";
import { DashboardView } from "@/components/views/dashboard-view";
import { EditorView } from "@/components/views/editor-view";
import { PreviewView } from "@/components/views/preview-view";
import { AdminView } from "@/components/views/admin-view";

export default function Home() {
  const view = useAppStore((s) => s.view);

  // Scroll to top when view changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [view.name]);

  // Scroll to hash if present (landing anchors)
  useEffect(() => {
    if (view.name === "landing" && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  }, [view.name]);

  // Auth views are full-screen — no navbar, no footer
  const isAuthView = view.name === "auth-signup" || view.name === "auth-login";
  const showChrome = view.name === "landing";

  if (isAuthView) {
    return (
      <div className="flex min-h-screen flex-col bg-ef-bg text-ef-ink">
        {view.name === "auth-signup" && <AuthWizardView />}
        {view.name === "auth-login" && <LoginView />}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ef-bg text-ef-ink">
      <Navbar />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view.name + (view.name === "dashboard" ? view.tab ?? "sites" : view.name === "admin" ? view.tab ?? "overview" : view.name === "editor" ? view.siteId ?? "new" : view.name === "preview" ? view.siteId : "")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {view.name === "landing" && <LandingView />}
            {view.name === "dashboard" && <DashboardView />}
            {view.name === "editor" && <EditorView />}
            {view.name === "preview" && <PreviewView />}
            {view.name === "admin" && <AdminView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {showChrome && <Footer />}
    </div>
  );
}
