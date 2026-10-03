"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Check,
  User,
  Mail,
  Lock,
  ImageIcon,
} from "lucide-react";

type Step = 0 | 1 | 2 | 3 | 4;

export function AuthWizardView() {
  const goLanding = useAppStore((s) => s.goLanding);
  const goDashboard = useAppStore((s) => s.goDashboard);
  const goAuth = useAppStore((s) => s.goAuth);
  const setUser = useAppStore((s) => s.setUser);
  const pushToast = useAppStore((s) => s.pushToast);
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);

  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 + 3 fields
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const handleRegister = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim()) {
      pushToast({ title: t("auth.firstNameRequired"), variant: "error" });
      return;
    }
    if (!email.trim() || !password) {
      pushToast({ title: t("auth.emailRequired"), variant: "error" });
      return;
    }
    if (password.length < 6) {
      pushToast({ title: t("auth.passwordShort"), variant: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: `${firstName.trim()} ${lastName.trim()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast({ title: t("auth.registrationFailed"), description: data?.error, variant: "error" });
        return;
      }
      setUser(data.user);
      setStep(2);
    } catch {
      pushToast({ title: t("auth.networkError"), variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, email, password, setUser, pushToast, t]);

  const uploadImage = useCallback(async (file: File, kind: "avatar" | "cover") => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        if (kind === "avatar") setAvatarUrl(dataUrl);
        else setCoverUrl(dataUrl);
        // Persist to the user profile
        try {
          await fetch("/api/users/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(kind === "avatar" ? { avatarUrl: dataUrl } : { coverUrl: dataUrl }),
          });
        } catch {
          /* non-fatal — the local state is already set */
        }
        setLoading(false);
      };
      reader.onerror = () => {
        pushToast({ title: "Failed to read file", variant: "error" });
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setLoading(false);
    }
  }, [pushToast]);

  const steps = ["Welcome", "Account", "Profile", "Cover", "Done"];

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

      {/* Progress indicator */}
      <div className="mb-10 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-ef-amber"
                  : i < step
                    ? "w-8 bg-ef-amber/50"
                    : "w-1.5 bg-ef-line"
              }`}
            />
            {i < steps.length - 1 && (
              <div className="h-px w-4 bg-ef-line" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <StepWelcome onContinue={() => setStep(1)} onLogin={() => goAuth("login")} />
            )}
            {step === 1 && (
              <StepAccount
                firstName={firstName}
                lastName={lastName}
                email={email}
                password={password}
                setFirstName={setFirstName}
                setLastName={setLastName}
                setEmail={setEmail}
                setPassword={setPassword}
                loading={loading}
                onBack={() => setStep(0)}
                onContinue={handleRegister}
              />
            )}
            {step === 2 && (
              <StepImageUpload
                title={t("auth.profilePic")}
                description={t("auth.profileDesc")}
                imageUrl={avatarUrl}
                loading={loading}
                isProfile={true}
                onUpload={(f) => uploadImage(f, "avatar")}
                onClear={() => setAvatarUrl(null)}
                onBack={() => setStep(1)}
                onContinue={() => setStep(3)}
                skipLabel={t("auth.skip")}
              />
            )}
            {step === 3 && (
              <StepImageUpload
                title={t("auth.coverPic")}
                description={t("auth.coverDesc")}
                imageUrl={coverUrl}
                loading={loading}
                isProfile={false}
                onUpload={(f) => uploadImage(f, "cover")}
                onClear={() => setCoverUrl(null)}
                onBack={() => setStep(2)}
                onContinue={() => setStep(4)}
                skipLabel={t("auth.skip")}
              />
            )}
            {step === 4 && (
              <StepSuccess
                name={firstName}
                onContinue={() => goDashboard()}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------- Step 0: Welcome ----------
function StepWelcome({ onContinue, onLogin }: { onContinue: () => void; onLogin: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-ef-ink">{t("auth.createAccount")}</h1>
      <p className="mt-2 text-sm text-ef-muted">
        {t("auth.startFree")}
      </p>
      <div className="mt-8 space-y-3">
        <button
          onClick={onContinue}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-ef-amber px-4 py-3 text-sm font-medium text-ef-bg transition-colors hover:opacity-90"
        >
          {t("auth.getStarted")}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={onLogin}
          className="w-full rounded-lg border border-ef-line px-4 py-3 text-sm font-medium text-ef-ink transition-colors hover:bg-ef-surface"
        >
          {t("auth.haveAccount")}
        </button>
      </div>
    </div>
  );
}

// ---------- Step 1: Account ----------
function StepAccount({
  firstName,
  lastName,
  email,
  password,
  setFirstName,
  setLastName,
  setEmail,
  setPassword,
  loading,
  onBack,
  onContinue,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  loading: boolean;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-ef-ink">{t("auth.accountInfo")}</h2>
      <p className="mt-1 text-sm text-ef-muted">{t("auth.tellUs")}</p>

      <div className="mt-8 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <WizardInput
            label={t("auth.firstName")}
            value={firstName}
            onChange={setFirstName}
            placeholder="Maya"
            icon={User}
          />
          <WizardInput
            label={t("auth.lastName")}
            value={lastName}
            onChange={setLastName}
            placeholder="Lin"
            icon={User}
          />
        </div>
        <WizardInput
          label={t("auth.email")}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@studio.com"
          icon={Mail}
        />
        <WizardInput
          label={t("auth.password")}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 6 characters"
          icon={Lock}
        />
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg border border-ef-line px-4 py-2.5 text-sm font-medium text-ef-muted transition-colors hover:text-ef-ink"
        >
          <ArrowLeft className="h-4 w-4" /> {t("auth.back")}
        </button>
        <button
          onClick={onContinue}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-ef-amber px-4 py-2.5 text-sm font-medium text-ef-bg transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? t("auth.creating") : t("auth.continue")}
        </button>
      </div>
    </div>
  );
}

// ---------- Step 2/3: Image upload ----------
function StepImageUpload({
  title,
  description,
  imageUrl,
  loading,
  onUpload,
  onClear,
  onBack,
  onContinue,
  skipLabel,
  isProfile,
}: {
  title: string;
  description: string;
  imageUrl: string | null;
  loading: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
  onBack: () => void;
  onContinue: () => void;
  skipLabel: string;
  isProfile: boolean;
}) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onUpload(file);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-ef-ink">{title}</h2>
      <p className="mt-1 text-sm text-ef-muted">{description}</p>

      <div className="mt-6">
        {imageUrl ? (
          <div className="relative overflow-hidden rounded-2xl border border-ef-line">
            <img
              src={imageUrl}
              alt={title}
              className={`w-full ${isProfile ? "aspect-square object-cover" : "aspect-[16/9] object-cover"}`}
            />
            <button
              onClick={onClear}
              className="absolute right-2 top-2 rounded-md bg-ef-bg/80 p-1.5 text-ef-ink backdrop-blur hover:bg-ef-bg"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
              dragging ? "border-ef-amber bg-ef-amber/5" : "border-ef-line hover:border-ef-muted/60"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ef-surface">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-ef-amber" />
              ) : (
                <Upload className="h-5 w-5 text-ef-amber" />
              )}
            </div>
            <p className="mt-3 text-sm font-medium text-ef-ink">
              {loading ? t("auth.uploading") : t("auth.dragDrop")}
            </p>
            <p className="mt-1 text-xs text-ef-muted">{t("auth.fileHint")}</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
              }}
            />
          </label>
        )}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg border border-ef-line px-4 py-2.5 text-sm font-medium text-ef-muted transition-colors hover:text-ef-ink"
        >
          <ArrowLeft className="h-4 w-4" /> {t("auth.back")}
        </button>
        <button
          onClick={onContinue}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-ef-amber px-4 py-2.5 text-sm font-medium text-ef-bg transition-colors hover:opacity-90"
        >
          {imageUrl ? (
            <>
              <Check className="h-4 w-4" /> {t("auth.continue")}
            </>
          ) : (
            <>
              {skipLabel} <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------- Step 4: Success ----------
function StepSuccess({ name, onContinue }: { name: string; onContinue: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ef-amber"
      >
        <Check className="h-8 w-8 text-ef-bg" strokeWidth={3} />
      </motion.div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ef-ink">
        {t("auth.welcome")}{name ? `, ${name}` : ""}!
      </h1>
      <p className="mt-2 text-sm text-ef-muted">
        {t("auth.accountReady")}
      </p>

      <button
        onClick={onContinue}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-ef-amber px-4 py-3 text-sm font-medium text-ef-bg transition-colors hover:opacity-90"
      >
        {t("auth.goToDashboard")}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------- Underline-style input (per the reference design) ----------
function WizardInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="group">
      <label className="mb-1.5 block text-xs font-medium text-ef-muted">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ef-muted/60" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full border-b border-ef-line bg-transparent py-2.5 text-sm text-ef-ink placeholder:text-ef-muted/50 transition-colors focus:border-ef-amber focus:outline-none ${
            Icon ? "pl-7" : ""
          }`}
        />
      </div>
    </div>
  );
}
