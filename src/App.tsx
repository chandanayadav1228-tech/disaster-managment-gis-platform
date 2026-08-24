import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Bell, BookOpenCheck, ClipboardList, Database, FileBarChart, Gauge, LogOut, Map, Menu, Settings2, ShieldAlert, SlidersHorizontal, UsersRound, X } from 'lucide-react';
import { useState } from 'react';
import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LogoMark } from '@/components/LogoMark';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { IntelligencePage } from '@/pages/IntelligencePage';

const navigation = [
  { label: 'Dashboard', icon: Gauge, path: '/' },
  { label: 'Risk Map', icon: Map, path: '/risk-map' },
  { label: 'Red Zones', icon: ShieldAlert, path: '/red-zones' },
  { label: 'Habitations', icon: UsersRound, path: '/habitations' },
  { label: 'Vulnerability', icon: Activity, path: '/vulnerability' },
  { label: 'Relocation Priority', icon: ClipboardList, path: '/relocation-priority' },
  { label: 'Safe Sites', icon: Map, path: '/safe-sites' },
  { label: 'Capacity', icon: SlidersHorizontal, path: '/capacity' },
  { label: 'AI Relocation Planner', icon: BookOpenCheck, path: '/planner' },
  { label: 'Scenario Simulator', icon: Settings2, path: '/scenarios' },
  { label: 'Reports', icon: FileBarChart, path: '/reports' },
  { label: 'Alerts', icon: Bell, path: '/alerts' },
  { label: 'Data Management', icon: Database, path: '/data' },
  { label: 'Audit Logs', icon: ClipboardList, path: '/audit' },
];

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const sidebar = <aside className="flex h-full w-[268px] flex-col border-r border-white/10 bg-[#0a1726] px-4 py-5"><div className="px-2"><LogoMark /></div><div className="mt-8 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.07] px-3 py-3"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Demo region</div><p className="mt-2 text-xs font-medium text-slate-300">Malabar Coastal & Hills</p><p className="mt-1 text-[10px] text-slate-500">Kerala (Synthetic)</p></div><nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">{navigation.map((item) => { const Icon = item.icon; const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path); return <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }} className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition ${active ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'}`}><Icon size={16} className={active ? 'text-slate-950' : 'text-slate-500 group-hover:text-emerald-300'} />{item.label}</button>; })}</nav><div className="mt-4 border-t border-white/10 pt-4"><div className="flex items-center gap-3 rounded-xl px-2 py-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-emerald-300">{profile?.full_name?.slice(0, 2).toUpperCase() ?? 'OF'}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{profile?.full_name || 'Officer'}</p><p className="mt-0.5 truncate text-[10px] capitalize text-slate-500">{profile?.role?.replace('_', ' ') || 'viewer'}</p></div><button title="Sign out" onClick={() => void signOut()} className="text-slate-500 transition hover:text-red-300"><LogOut size={16} /></button></div></div></aside>;

  return <div className="min-h-screen bg-[#07121f] text-white"><div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>{mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/80 lg:hidden" onClick={() => setMobileOpen(false)}><div className="h-full" onClick={(event) => event.stopPropagation()}>{sidebar}</div></div>}<div className="lg:pl-[268px]"><header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/10 bg-[#07121f]/90 px-5 backdrop-blur-xl sm:px-8"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"><Menu size={20} /></button><div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/60" />System operational <span className="mx-1 text-slate-700">/</span> Prototype environment</div><div className="ml-auto flex items-center gap-3"><span className="hidden rounded-full border border-amber-300/15 bg-amber-300/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200 sm:inline-flex">DEMO / SIMULATED DATA</span><button className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"><Bell size={18} /></button><button onClick={() => void signOut()} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-400/10 hover:text-red-300 lg:hidden"><X size={18} /></button></div></header><main className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10"><Routes><Route index element={<DashboardPage />} /><Route path="/risk-map" element={<IntelligencePage mode="risk" />} /><Route path="/red-zones" element={<IntelligencePage mode="red-zones" />} /><Route path="/vulnerability" element={<IntelligencePage mode="vulnerability" />} /><Route path="/relocation-priority" element={<IntelligencePage mode="priority" />} /><Route path="*" element={<ComingSoon />} /></Routes></main></div></div>;
}

function ComingSoon() { return <div className="flex min-h-[60vh] items-center justify-center"><div className="max-w-md text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300"><Settings2 size={26} /></div><h1 className="mt-5 text-2xl font-semibold">Module foundation ready</h1><p className="mt-3 text-sm leading-6 text-slate-400">This section is connected to the secure workspace and will be activated in the next implementation phase.</p></div></div>; }

export default function App() { return <BrowserRouter><AuthProvider><Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute />}><Route path="/*" element={<AppShell />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></AuthProvider></BrowserRouter>; }
