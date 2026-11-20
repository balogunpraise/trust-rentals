import Link from "next/link";
import { AlertTriangle, CircleCheck, Info, RefreshCw } from "lucide-react";
import clsx from "clsx";
import type { Tone } from "@/lib/rental-state";

const toneClass: Record<Tone, string> = {
  neutral: "bg-canvas text-ink-soft border-line",
  info: "bg-brand-soft text-brand-dark border-brand/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  success: "bg-success-soft text-success border-success/20",
  danger: "bg-danger-soft text-danger border-danger/20",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", toneClass[tone], className)}>
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      {icon && <div className="mb-4 grid size-12 place-items-center rounded-full bg-brand-soft text-brand">{icon}</div>}
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
      {action && (
        <Link href={action.href} className="btn-primary mt-5">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function ErrorPanel({ title = "Something went wrong", message, requestId, retryHref }: { title?: string; message: string; requestId?: string; retryHref?: string }) {
  return (
    <div role="alert" className="card border-danger/30 bg-danger-soft/40 p-5">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" />
        <div>
          <p className="font-semibold text-danger">{title}</p>
          <p className="mt-1 text-sm text-ink-soft">{message}</p>
          {requestId && <p className="mt-2 font-mono text-xs text-muted">Reference: {requestId}</p>}
          <div className="mt-3 flex gap-2">
            {retryHref && (
              <Link href={retryHref} className="btn-secondary py-1.5">
                <RefreshCw className="size-4" /> Retry
              </Link>
            )}
            <Link href="/help" className="btn-ghost py-1.5">Contact support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InlineAlert({ tone = "info", title, children }: { tone?: "info" | "warning" | "success" | "danger"; title?: string; children: React.ReactNode }) {
  const Icon = tone === "success" ? CircleCheck : tone === "info" ? Info : AlertTriangle;
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={clsx("flex gap-3 rounded-[var(--radius-control)] border p-3.5 text-sm", toneClass[tone])}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="text-ink-soft">
        {title && <p className="font-semibold text-ink">{title}</p>}
        {children}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-[var(--radius-control)] bg-line/70", className)} />;
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/3] w-full rounded-[var(--radius-card)]" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: string; actions?: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  return (
    <span className={clsx("inline-flex items-center gap-0.5", size === "sm" ? "text-xs" : "text-sm")} aria-label={`${rating} out of 5`}>
      <svg viewBox="0 0 20 20" className={size === "sm" ? "size-3.5" : "size-4"} fill="#f5a524" aria-hidden>
        <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
      </svg>
      <span className="font-semibold text-ink">{rating.toFixed(rating % 1 ? 2 : 1).replace(/0$/, "")}</span>
    </span>
  );
}
