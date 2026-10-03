import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ef-bg px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-ef-line bg-ef-surface/40">
        <span className="font-mono text-xl font-semibold text-ef-amber">404</span>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ef-ink sm:text-3xl">
          This page isn&apos;t published.
        </h1>
        <p className="mt-2 max-w-md text-sm text-ef-muted">
          The site you&apos;re looking for doesn&apos;t exist, was unpublished, or never made it live.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-md bg-ef-ink px-4 py-2 text-sm font-medium text-ef-bg hover:bg-ef-ink/90"
      >
        <ArrowLeft className="h-4 w-4" /> Back to EventFolio
      </Link>
    </div>
  );
}
