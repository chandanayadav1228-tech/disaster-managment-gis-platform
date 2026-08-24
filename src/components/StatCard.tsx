import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: 'red' | 'amber' | 'blue' | 'emerald';
}

const toneStyles = {
  red: 'border-red-400/20 bg-red-400/[0.07] text-red-200',
  amber: 'border-amber-400/20 bg-amber-400/[0.07] text-amber-200',
  blue: 'border-sky-400/20 bg-sky-400/[0.07] text-sky-200',
  emerald: 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200',
};

export function StatCard({ label, value, detail, icon: Icon, tone }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.06] ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-400">{detail}</p>
        </div>
        <div className="rounded-xl bg-white/[0.08] p-2.5"><Icon size={19} /></div>
      </div>
    </div>
  );
}
