import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  const trendColor = trend
    ? trend.isPositive === false
      ? "text-danger"
      : "text-success"
    : "";
  const trendPrefix = trend?.isPositive === false ? "▼" : "▲";

  return (
    <article className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-outline/60 bg-surface px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-4">
        {icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-base)] bg-primary/10 text-primary">
            {icon}
          </div>
        ) : null}
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
            {label}
          </p>
          <p className="text-3xl font-semibold text-foreground">{value}</p>
        </div>
      </div>
      {trend ? (
        <p
          className={`mt-4 flex items-center gap-2 text-sm font-medium ${trendColor}`.trim()}
        >
          <span>{trendPrefix}</span>
          <span>{trend.value}</span>
        </p>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 transition-opacity group-hover:opacity-100" />
    </article>
  );
}
