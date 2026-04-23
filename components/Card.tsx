/**
 * Card — Medsys surface component.
 * Uses a diffuse shadow instead of generic `shadow-sm` so elevation
 * communicates hierarchy without boxing everything in.
 */
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-slate-200/70 rounded-2xl shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * SectionCard — a tighter surface for grouped form sections.
 */
export function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-slate-50 border border-slate-200/80 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

/**
 * MetricCard — clean metric row without card overuse.
 * Use inside a grid with `divide-x divide-slate-100`.
 */
export function MetricCard({
  label,
  value,
  icon: Icon,
  accent = "text-slate-700",
  iconBg = "bg-slate-100",
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-3.5 p-5">
      <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>
        <Icon className={`w-[18px] h-[18px] ${accent}`} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">
          {label}
        </p>
        <p className={`text-2xl font-bold tabular-nums leading-none font-mono ${accent}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
