import { Users, AlertTriangle, ShieldAlert, MapPin } from 'lucide-react';
import type { RiskSummary } from '@/lib/types';
import { RISK_COLORS } from '@/lib/constants';

interface SummaryBarProps {
  summary: RiskSummary;
}

export default function SummaryBar({ summary }: SummaryBarProps) {
  const stats = [
    {
      label: 'Total Habitations',
      value: summary.total,
      icon: MapPin,
      color: 'text-slate-300',
      bg: 'bg-slate-700/30',
    },
    {
      label: 'Red Zones',
      value: summary.redZones,
      icon: ShieldAlert,
      color: 'text-red-400',
      bg: 'bg-red-900/20',
    },
    {
      label: 'Severe Risk',
      value: summary.severe,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-900/20',
    },
    {
      label: 'High Risk',
      value: summary.high,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-900/20',
    },
    {
      label: 'Moderate Risk',
      value: summary.moderate,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/20',
    },
    {
      label: 'Low Risk',
      value: summary.low,
      icon: AlertTriangle,
      color: 'text-green-400',
      bg: 'bg-green-900/20',
    },
    {
      label: 'Total Population',
      value: summary.totalPopulation.toLocaleString(),
      icon: Users,
      color: 'text-slate-200',
      bg: 'bg-slate-700/30',
    },
    {
      label: 'Vulnerable People',
      value: summary.vulnerablePopulation.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-900/20',
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`flex items-center gap-3 ${stat.bg} rounded-xl px-4 py-2.5 border border-slate-700/30`}
          >
            <Icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
