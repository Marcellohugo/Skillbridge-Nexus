import * as React from "react";

type Cn = (...c: Array<string | undefined | false | null>) => string;
const cn: Cn = (...c) => c.filter(Boolean).join(" ");

// ──────────────── Button ────────────────
type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "btn",
        variant === "primary" && "btn-primary",
        variant === "secondary" && "btn-secondary",
        variant === "ghost" && "btn-ghost",
        size === "sm" && "btn-sm",
        size === "lg" && "btn-lg",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

// ──────────────── Card ────────────────
export function Card({ className, children, elevated = false, hover = false, ...rest }: React.HTMLAttributes<HTMLDivElement> & { elevated?: boolean; hover?: boolean }) {
  return (
    <div className={cn("card", elevated && "card-elevated", hover && "card-hover", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h3 className="text-lg font-display font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-foreground-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div className="w-full sm:w-auto sm:shrink-0">{action}</div>}
    </div>
  );
}

// ──────────────── Badge ────────────────
type BadgeTone = "brand" | "accent" | "success" | "warning" | "danger" | "info" | "muted";
export function Badge({ children, tone = "muted", className }: { children: React.ReactNode; tone?: BadgeTone; className?: string }) {
  return <span className={cn("badge", `badge-${tone}`, className)}>{children}</span>;
}

// ──────────────── Progress ────────────────
export function Progress({ value, max = 100, tone = "brand", className }: { value: number; max?: number; tone?: Exclude<BadgeTone, "muted">; className?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("progress", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div
        className={cn(
          "progress-bar",
          tone === "accent" && "progress-bar-accent",
          tone === "success" && "progress-bar-success",
          tone === "danger" && "progress-bar-danger",
          tone === "warning" && "progress-bar-warning",
          tone === "info" && "progress-bar-info",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ──────────────── Input ────────────────
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn("input", className)} {...props} />,
);
Input.displayName = "Input";

export function Label({ htmlFor, children, required }: { htmlFor?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium mb-2 text-foreground">
      {children} {required && <span className="text-danger">*</span>}
    </label>
  );
}

// ──────────────── Stat ────────────────
export function StatCard({
  label, value, delta, tone = "brand", icon, hint,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  tone?: BadgeTone;
  icon?: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-foreground-muted">{label}</span>
        {icon && <span className="text-foreground-muted">{icon}</span>}
      </div>
      <div className="text-3xl font-display font-bold text-foreground mb-1">{value}</div>
      {delta && <Badge tone={tone}>{delta}</Badge>}
      {hint && <p className="text-xs text-foreground-muted mt-2">{hint}</p>}
    </div>
  );
}

// ──────────────── Section heading ────────────────
export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div className="max-w-2xl">
        {eyebrow && <span className="eyebrow mb-2 block">{eyebrow}</span>}
        <h2 className="text-2xl sm:text-3xl font-display font-bold">{title}</h2>
        {description && <p className="mt-2 text-foreground-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ──────────────── Empty state ────────────────
export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12 px-6">
      {icon && <div className="text-5xl mb-4 opacity-60">{icon}</div>}
      <h3 className="text-lg font-display font-bold mb-2">{title}</h3>
      {description && <p className="text-sm text-foreground-muted max-w-sm mx-auto mb-6">{description}</p>}
      {action}
    </div>
  );
}

// ──────────────── Ring metric ────────────────
export function RingMetric({ value, label, sublabel, size = 140 }: { value: number; label: string; sublabel?: string; size?: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const style = {
    "--pct": pct,
    "--size": `${size}px`,
  } as React.CSSProperties & Record<"--pct" | "--size", string | number>;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="ring-metric" style={style}>
        <div className="text-center">
          <div className="text-3xl font-display font-bold">{Math.round(value)}</div>
          {sublabel && <div className="text-[10px] uppercase tracking-wider text-foreground-muted">{sublabel}</div>}
        </div>
      </div>
      <span className="text-sm font-medium text-foreground-secondary">{label}</span>
    </div>
  );
}

// ──────────────── Alert / Callout ────────────────
export function Callout({ tone = "info", title, children, icon, className }: { tone?: BadgeTone; title?: string; children: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-lg p-4 border flex gap-3",
      tone === "success" && "bg-success-soft border-success/30",
      tone === "warning" && "bg-warning-soft border-warning/30",
      tone === "danger" && "bg-danger-soft border-danger/30",
      tone === "info" && "bg-info-soft border-info/30",
      tone === "brand" && "bg-primary-soft border-primary/30",
      tone === "accent" && "bg-accent-soft border-accent/30",
      tone === "muted" && "bg-background-tertiary border-border",
      className,
    )}>
      {icon && <div className="mt-0.5">{icon}</div>}
      <div>
        {title && <p className="font-semibold text-foreground mb-1">{title}</p>}
        <div className="text-sm text-foreground-secondary">{children}</div>
      </div>
    </div>
  );
}

// ──────────────── Tabs ────────────────
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div role="tablist" className="flex gap-1 p-1 bg-background-secondary border border-border rounded-lg w-fit">
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.id)}
            className={cn(
              "px-4 h-9 text-sm font-medium rounded-md transition-colors",
              on ? "bg-background-tertiary text-foreground" : "text-foreground-muted hover:text-foreground",
            )}
          >
            {t.label}
            {typeof t.count === "number" && <span className="ml-2 opacity-60">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
