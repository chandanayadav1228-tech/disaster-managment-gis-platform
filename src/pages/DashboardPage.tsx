import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, Database, MapPinned, ShieldAlert, UsersRound } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import type { DashboardStats, RiskAssessment } from '@/types/domain';
import { StatCard } from '@/components/StatCard';

const emptyStats: DashboardStats = { criticalHabitations: 0, populationAtRisk: 0, vulnerablePopulation: 0, immediateRelocation: 0, availableCapacity: 0, recommendedSites: 0, activeAlerts: 0, totalHabitations: 0 };

export function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [regionName, setRegionName] = useState('Demo region');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const [regionsResult, habitationsResult, riskResult, vulnerableResult, sitesResult, alertsResult] = await Promise.all([
        supabase.from('regions').select('id, name').eq('is_demo', true).limit(1).maybeSingle(),
        supabase.from('habitations').select('id, population_total'),
        supabase.from('risk_assessments').select('id, habitation_id, final_risk_score, risk_class').is('scenario_run_id', null),
        supabase.from('vulnerable_population').select('children_count, elderly_count, disability_count, medical_vulnerability_count'),
        supabase.from('relocation_sites').select('available_capacity, is_approved'),
        supabase.from('alerts').select('id').eq('is_acknowledged', false),
      ]);
      const results = [regionsResult, habitationsResult, riskResult, vulnerableResult, sitesResult, alertsResult];
      const failed = results.find((result) => result.error);
      if (failed?.error) {
        console.error('Dashboard data load failed', failed.error);
        setError('We could not load the regional picture. Please refresh and try again.');
        setLoading(false);
        return;
      }
      const habitations = habitationsResult.data ?? [];
      const risks = (riskResult.data ?? []) as RiskAssessment[];
      const vulnerable = vulnerableResult.data ?? [];
      const sites = sitesResult.data ?? [];
      setRegionName(regionsResult.data?.name ?? 'Demo region');
      setRiskAssessments(risks);
      setStats({
        criticalHabitations: risks.filter((item) => item.risk_class === 'Critical').length,
        populationAtRisk: habitations.filter((_, index) => (risks[index]?.final_risk_score ?? 0) >= 61).reduce((sum, habitation) => sum + (habitation.population_total ?? 0), 0),
        vulnerablePopulation: vulnerable.reduce((sum, item) => sum + item.children_count + item.elderly_count + item.disability_count + item.medical_vulnerability_count, 0),
        immediateRelocation: risks.filter((item) => item.risk_class === 'Critical').length,
        availableCapacity: sites.reduce((sum, site) => sum + (site.available_capacity ?? 0), 0),
        recommendedSites: sites.filter((site) => site.is_approved).length,
        activeAlerts: alertsResult.data?.length ?? 0,
        totalHabitations: habitations.length,
      });
      setLoading(false);
    };
    void loadDashboard();
  }, []);

  const riskChart = useMemo(() => [
    { name: 'Critical', value: riskAssessments.filter((item) => item.risk_class === 'Critical').length, fill: '#f87171' },
    { name: 'High', value: riskAssessments.filter((item) => item.risk_class === 'High').length, fill: '#fbbf24' },
    { name: 'Moderate', value: riskAssessments.filter((item) => item.risk_class === 'Moderate').length, fill: '#38bdf8' },
    { name: 'Low', value: riskAssessments.filter((item) => item.risk_class === 'Low').length, fill: '#34d399' },
  ], [riskAssessments]);

  const formatNumber = (value: number): string => new Intl.NumberFormat('en-IN').format(value);

  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Operational overview</div><h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Good morning, {profile?.full_name?.split(' ')[0] ?? 'Officer'}</h1><p className="mt-2 text-sm text-slate-400">Here is the latest risk and relocation picture for {regionName}.</p></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400"><Database size={14} className="text-emerald-300" />Last synced from demo dataset</div></div>
    {error && <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Critical habitations" value={loading ? '—' : formatNumber(stats.criticalHabitations)} detail={`of ${formatNumber(stats.totalHabitations)} assessed habitations`} icon={ShieldAlert} tone="red" /><StatCard label="Population at risk" value={loading ? '—' : formatNumber(stats.populationAtRisk)} detail="High and critical exposure" icon={UsersRound} tone="amber" /><StatCard label="Vulnerable population" value={loading ? '—' : formatNumber(stats.vulnerablePopulation)} detail="Priority groups identified" icon={AlertTriangle} tone="blue" /><StatCard label="Available safe capacity" value={loading ? '—' : formatNumber(stats.availableCapacity)} detail={`${formatNumber(stats.recommendedSites)} approved candidate sites`} icon={CheckCircle2} tone="emerald" /></div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-white">Risk classification overview</p><p className="mt-1 text-xs text-slate-500">Current baseline assessments · prototype methodology</p></div><button className="flex items-center gap-1 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200">Inspect map <ArrowUpRight size={14} /></button></div><div className="mt-7 h-64">{loading ? <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading risk distribution…</div> : <ResponsiveContainer width="100%" height="100%"><BarChart data={riskChart} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}><CartesianGrid stroke="#ffffff12" vertical={false} /><XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#ffffff08' }} contentStyle={{ background: '#0e1c2c', border: '1px solid #ffffff18', borderRadius: 12, color: '#fff' }} /><Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#34d399" /></BarChart></ResponsiveContainer>}</div></section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-white">Priority actions</p><p className="mt-1 text-xs text-slate-500">Items requiring attention</p></div><Clock3 size={17} className="text-slate-500" /></div><div className="mt-6 space-y-3"><div className="rounded-xl border border-red-400/15 bg-red-400/[0.06] p-4"><div className="flex gap-3"><div className="mt-0.5 rounded-lg bg-red-400/15 p-2 text-red-300"><ShieldAlert size={16} /></div><div><p className="text-sm font-semibold text-white">{stats.immediateRelocation} immediate relocation flags</p><p className="mt-1 text-xs leading-5 text-slate-400">Critical risk classifications need a site-level review.</p></div></div></div><div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.06] p-4"><div className="flex gap-3"><div className="mt-0.5 rounded-lg bg-amber-400/15 p-2 text-amber-300"><AlertTriangle size={16} /></div><div><p className="text-sm font-semibold text-white">{stats.activeAlerts} active alerts</p><p className="mt-1 text-xs leading-5 text-slate-400">Review unresolved operational warnings.</p></div></div></div><div className="rounded-xl border border-sky-400/15 bg-sky-400/[0.06] p-4"><div className="flex gap-3"><div className="mt-0.5 rounded-lg bg-sky-400/15 p-2 text-sky-300"><MapPinned size={16} /></div><div><p className="text-sm font-semibold text-white">Risk map ready</p><p className="mt-1 text-xs leading-5 text-slate-400">Four synthetic hazard layers are available for inspection.</p></div></div></div></div></section>
    </div>
    <div className="flex flex-col gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-300"><span className="rounded-full border border-emerald-300/20 px-2 py-1">DEMO / SIMULATED DATA</span></div><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">This workspace uses consistent synthetic data for demonstration. It is not real-time government data and does not replace an official decision.</p></div><div className="text-xs text-slate-500">Region code: DEMO-MCH-001</div></div>
  </div>;
}
