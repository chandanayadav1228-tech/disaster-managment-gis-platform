import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Map, AlertOctagon, Home, History, ListOrdered, MapPin,
  Gauge, Brain, SlidersHorizontal, FileBarChart, ShieldAlert, Database,
  Menu, X, MapPinned,
} from "lucide-react";
import { useScenario } from "@/context/ScenarioContext";
import { computeMetrics } from "@/lib/simulation";
import { REGION_NAME } from "@/data/gisData";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/gis-map", label: "GIS Risk Map", icon: Map },
  { to: "/red-zone", label: "Red Zone Analysis", icon: AlertOctagon },
  { to: "/habitations", label: "Habitation & Vulnerability", icon: Home },
  { to: "/disaster-history", label: "Disaster History", icon: History },
  { to: "/relocation-priority", label: "Relocation Priority", icon: ListOrdered },
  { to: "/safe-sites", label: "Safe Relocation Sites", icon: MapPin },
  { to: "/carrying-capacity", label: "Carrying Capacity", icon: Gauge },
  { to: "/ai-planner", label: "AI Relocation Planner", icon: Brain },
  { to: "/scenario", label: "Scenario Simulation", icon: SlidersHorizontal },
  { to: "/reports", label: "Reports & Analytics", icon: FileBarChart },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-3 py-3 border-b border-slate-100">
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
        <ShieldAlert className="w-4.5 h-4.5 text-white" />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-bold text-slate-800 leading-tight">DISASTER GIS</div>
        <div className="text-[9px] text-slate-500 leading-tight">Decision Support Platform</div>
      </div>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scenario } = useScenario();
  const metrics = computeMetrics(scenario);
  const now = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <Brand />
        <div className="flex-1 px-2 py-3">
          <NavList />
        </div>
        <div className="px-3 py-2 border-t border-slate-100 text-[9px] text-slate-400">
          v2.0 • SIH Prototype
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[1100] flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white border-r border-slate-200 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setMobileOpen(false)} className="p-2 mr-2 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 px-2 py-3 overflow-y-auto">
              <NavList onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-[1000]">
          <div className="px-3 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded">
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <MapPinned className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold text-slate-700">{REGION_NAME}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="px-1.5 py-0.5 bg-slate-100 rounded">Alerts: {metrics.activeAlerts}</span>
                <span className="px-1.5 py-0.5 bg-slate-100 rounded">Updated: {now}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-200">
                <Database className="w-3 h-3 text-amber-600" />
                <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Demo Data</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 overflow-x-hidden">{children}</main>

        <footer className="px-4 py-2.5 border-t border-slate-200 bg-white text-[10px] text-slate-400 flex justify-between">
          <span>Disaster GIS — Multi-Module Decision Support Platform</span>
          <span>Simulated Data • Not for operational use</span>
        </footer>
      </div>
    </div>
  );
}
