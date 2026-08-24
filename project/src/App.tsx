import { useState, useEffect, useCallback } from 'react';
import { Mountain, Loader2, AlertCircle, MapPin } from 'lucide-react';
import DisasterMap from '@/components/DisasterMap';
import DetailPanel from '@/components/DetailPanel';
import LayerControl, { type LayerVisibility } from '@/components/LayerControl';
import Legend from '@/components/Legend';
import SummaryBar from '@/components/SummaryBar';
import {
  fetchHabitationRisk,
  fetchHazardZones,
  fetchRoads,
  fetchHospitals,
  fetchShelters,
  fetchRelocationSites,
  computeRiskSummary,
} from '@/lib/data';
import type { HabitationRisk, HazardZone, RoadFeature, Facility, RiskSummary } from '@/lib/types';

const DEFAULT_LAYERS: LayerVisibility = {
  habitations: true,
  hazardZones: true,
  redZones: true,
  roads: true,
  hospitals: true,
  shelters: true,
  relocationSites: true,
};

export default function App() {
  const [habitations, setHabitations] = useState<HabitationRisk[]>([]);
  const [hazardZones, setHazardZones] = useState<HazardZone[]>([]);
  const [roads, setRoads] = useState<RoadFeature[]>([]);
  const [hospitals, setHospitals] = useState<Facility[]>([]);
  const [shelters, setShelters] = useState<Facility[]>([]);
  const [relocationSites, setRelocationSites] = useState<Facility[]>([]);
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [selectedHabitation, setSelectedHabitation] = useState<HabitationRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [
          habData,
          zoneData,
          roadData,
          hospData,
          shelterData,
          relocData,
        ] = await Promise.all([
          fetchHabitationRisk(),
          fetchHazardZones(),
          fetchRoads(),
          fetchHospitals(),
          fetchShelters(),
          fetchRelocationSites(),
        ]);
        setHabitations(habData);
        setHazardZones(zoneData);
        setRoads(roadData);
        setHospitals(hospData);
        setShelters(shelterData);
        setRelocationSites(relocData);
        setSummary(computeRiskSummary(habData));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleLayer = useCallback((key: keyof LayerVisibility) => {
    setLayerVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSelectHabitation = useCallback((hab: HabitationRisk) => {
    setSelectedHabitation(hab);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading GIS data from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-400 font-semibold">Error Loading Data</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg">
            <Mountain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">Disaster Management GIS Platform</h1>
            <p className="text-xs text-slate-400">Uttarakhand Himalayan Region — Risk &amp; Vulnerability Assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-700/30 text-xs text-emerald-400 font-medium">
            Live Data
          </span>
        </div>
      </header>

      {/* Summary bar */}
      {summary && (
        <div className="bg-slate-800/40 border-b border-slate-700/30 px-6 py-3">
          <SummaryBar summary={summary} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <DisasterMap
            habitations={habitations}
            hazardZones={hazardZones}
            roads={roads}
            hospitals={hospitals}
            shelters={shelters}
            relocationSites={relocationSites}
            layerVisibility={layerVisibility}
            selectedHabitation={selectedHabitation}
            onSelectHabitation={handleSelectHabitation}
          />

          {/* Layer control overlay */}
          <div className="absolute top-4 left-4 z-[1000] w-56">
            <LayerControl visibility={layerVisibility} onToggle={handleToggleLayer} />
          </div>

          {/* Legend overlay */}
          <div className="absolute top-4 right-4 z-[1000] w-52">
            <Legend />
          </div>
        </div>

        {/* Detail panel */}
        <aside className="w-80 bg-slate-800/95 border-l border-slate-700/50 flex-shrink-0">
          <DetailPanel
            habitation={selectedHabitation}
            onClose={() => setSelectedHabitation(null)}
          />
        </aside>
      </div>
    </div>
  );
}
