import { Link } from "react-router-dom";
import {
  AlertTriangle, Users, HeartPulse, MoveRight, ShieldCheck, MapPin,
  Zap, TrendingUp, ArrowRight, Clock,
} from "lucide-react";
import { useScenario } from "@/context/ScenarioContext";
import { computeMetrics, effectiveRisk, populationAtRisk, priorityScore, priorityTier } from "@/lib/simulation";
import { HABITATIONS, RELOCATION_SITES, siteSuitability, siteAvailableCapacity, riskBarColor } from "@/data/gisData";
import { Card, CardHeader, CardBody, StatCard, RiskBadge, PriorityBadge, PageHeader } from "@/components/ui";
import GisMap from "@/components/GisMap";
import { DEFAULT_LAYERS } from "@/components/LayerControl";

export default function DashboardPage() {
  const { scenario } = useScenario();
  const m = computeMetrics(scenario);

  const top5 = HABITATIONS.map((h) => ({
    id: h.id, name: h.name, risk: effectiveRisk(h, scenario),
    pop: h.population, atRisk: populationAtRisk(h, scenario),
    tier: priorityTier(h, scenario), pscore: priorityScore(h, scenario),
  })).sort((a, b) => b.pscore - a.pscore).slice(0, 5);

  const siteSummary = RELOCATION_SITES.map((s) => ({
    id: s.id, name: s.name, suitability: siteSuitability(s),
    available: siteAvailableCapacity(s), total: s.totalCapacity,
  })).sort((a, b) => b.suitability - a.suitability);

  const cards = [
    { label: "Critical Habitations", value: m.criticalHabitations, icon: <AlertTriangle className="w-4 h-4 text-red-600" />, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    { label: "Population at Risk", value: m.populationAtRisk, icon: <Users className="w-4 h-4 text-orange-600" />, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
    { label: "Vulnerable Population", value: m.vulnerablePopulation, icon: <HeartPulse className="w-4 h-4 text-rose-600" />, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
    { label: "Immediate Relocation", value: m.immediateRelocation, icon: <Zap className="w-4 h-4 text-red-600" />, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    { label: "Short-Term Relocation", value: m.shortTermRelocation, icon: <Clock className="w-4 h-4 text-orange-600" />, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
    { label: "Medium-Term Relocation", value: m.mediumTermRelocation, icon: <MoveRight className="w-4 h-4 text-yellow-600" />, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
    { label: "Available Safe Capacity", value: m.availableSafeCapacity, icon: <ShieldCheck className="w-4 h-4 text-green-600" />, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    { label: "Capacity Deficit", value: m.capacityDeficit, icon: <TrendingUp className="w-4 h-4 text-red-600" />, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    { label: "Recommended Sites", value: m.recommendedSites, icon: <MapPin className="w-4 h-4 text-blue-600" />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { label: "Active Alerts", value: m.activeAlerts, icon: <AlertTriangle className="w-4 h-4 text-amber-600" />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  ];

  return (
    <div>
      <PageHeader title="Executive Dashboard" subtitle="Regional overview of risk, vulnerability and relocation readiness." />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {cards.map((c) => <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} color={c.color} bg={c.bg} border={c.border} />)}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7">
          <Card>
            <CardHeader title="Regional Overview Map" icon={<MapPin className="w-4 h-4 text-blue-600" />} action={<Link to="/gis-map" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">Open full map <ArrowRight className="w-3 h-3" /></Link>} />
            <div className="h-[360px] overflow-hidden">
              <GisMap scenario={scenario} layers={DEFAULT_LAYERS} height="360px" />
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-4">
          <Card>
            <CardHeader title="Top 5 Highest-Risk Habitations" icon={<AlertTriangle className="w-4 h-4 text-red-600" />} />
            <CardBody className="space-y-2">
              {top5.map((h, i) => (
                <div key={h.id} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-slate-800 truncate">{h.name}</div>
                    <div className="h-1.5 bg-slate-100 rounded mt-0.5 overflow-hidden">
                      <div className={`h-full ${riskBarColor(h.risk)} rounded`} style={{ width: `${h.risk}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-bold text-slate-700 tabular-nums">{h.risk}</div>
                    <PriorityBadge priority={h.tier} />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Safe-Site Capacity Summary" icon={<ShieldCheck className="w-4 h-4 text-green-600" />} action={<Link to="/safe-sites" className="text-[11px] text-blue-600 hover:underline">Details</Link>} />
            <CardBody className="space-y-2">
              {siteSummary.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}</span>
                  <div className="flex-1 text-[12px] text-slate-800 truncate">{s.name}</div>
                  <div className="text-[11px] text-slate-500 tabular-nums">{s.available.toLocaleString()} avail</div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{s.suitability}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Top Relocation Priorities" icon={<MoveRight className="w-4 h-4 text-amber-600" />} action={<Link to="/relocation-priority" className="text-[11px] text-blue-600 hover:underline">All priorities</Link>} />
            <CardBody className="space-y-1.5">
              {top5.slice(0, 3).map((h) => (
                <Link key={h.id} to={`/habitations?id=${h.id}`} className="flex items-center justify-between text-[12px] py-1 hover:bg-slate-50 px-1 rounded">
                  <span className="text-slate-800">{h.name}</span>
                  <div className="flex items-center gap-2">
                    <RiskBadge score={h.risk} />
                    <PriorityBadge priority={h.tier} />
                  </div>
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
