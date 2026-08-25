import { type ReactNode } from "react";
import { CardProps } from "@/components/ui/types";

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>{children}</div>
  );
}

export function CardHeader({ title, icon, action }: { title: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function StatCard({ label, value, icon, color, bg, border }: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div className={`rounded-lg border ${border} ${bg} p-3`}>
      <div className="flex items-center justify-between mb-1">{icon}</div>
      <div className={`text-xl font-bold ${color} tabular-nums`}>{typeof value === "number" ? value.toLocaleString() : value}</div>
      <div className="text-[10px] text-slate-600 font-medium uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${className}`}>{children}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cls =
    priority === "IMMEDIATE" ? "bg-red-600 text-white" :
    priority === "SHORT-TERM" ? "bg-orange-500 text-white" :
    priority === "MEDIUM-TERM" ? "bg-yellow-400 text-yellow-900" :
    "bg-green-500 text-white";
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${cls}`}>{priority}</span>;
}

export function RiskBadge({ score }: { score: number }) {
  const cls =
    score >= 80 ? "bg-red-100 text-red-700 border-red-300" :
    score >= 60 ? "bg-orange-100 text-orange-700 border-orange-300" :
    score >= 40 ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
    "bg-green-100 text-green-700 border-green-300";
  const label = score >= 80 ? "Severe" : score >= 60 ? "High" : score >= 40 ? "Moderate" : "Safe";
  return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${cls}`}>{label}</span>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
      <div>
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Search…"}
      className="text-[12px] px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 w-full"
    />
  );
}

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-[12px] px-2 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function emptyState(message: string) {
  return <div className="text-center text-[12px] text-slate-400 py-6">{message}</div>;
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
