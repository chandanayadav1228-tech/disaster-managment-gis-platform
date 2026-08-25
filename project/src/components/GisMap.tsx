import { useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  LayerGroup,
  Polygon,
  Polyline,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  HABITATIONS,
  RELOCATION_SITES,
  HOSPITALS,
  SHELTERS,
  ROADS,
  RIVERS,
  INFRASTRUCTURE,
  HAZARD_POLYGONS,
  RED_ZONES,
  HISTORICAL_DISASTERS,
  MAP_CENTER,
  riskClassFromScore,
  riskDotColor,
  priorityTierFromScore,
  siteSuitability,
  siteAvailableCapacity,
  recommendedPopulation,
  habitationNameById,
  type Habitation,
  type RelocationSite,
} from "@/data/gisData";
import { effectiveRisk, populationAtRisk, vulnerablePopulation, type ScenarioParams } from "@/lib/simulation";
import type { LayerState } from "@/components/LayerControl";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function makeIcon(color: string, glyph: string) {
  return L.divIcon({
    className: "gis-div-icon",
    html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;font-family:Inter,system-ui,sans-serif">${glyph}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 14, { duration: 0.8 });
  }, [target, map]);
  return null;
}

function HabitationPopup({ h, scenario }: { h: Habitation; scenario: ScenarioParams }) {
  const risk = effectiveRisk(h, scenario);
  const cls = riskClassFromScore(risk);
  const popAtRisk = populationAtRisk(h, scenario);
  const vulnerable = vulnerablePopulation(h);
  const priority = priorityTierFromScore(risk);
  const recSite = habitationNameById(h.recommendedRelocationId);

  return (
    <div className="w-60 font-sans">
      <div className="text-sm font-bold text-slate-800 mb-1">{h.name}</div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
          cls === "Severe" ? "bg-red-100 text-red-700 border-red-300" :
          cls === "High" ? "bg-orange-100 text-orange-700 border-orange-300" :
          cls === "Moderate" ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
          "bg-green-100 text-green-700 border-green-300"
        }`}>{cls}</span>
        <span className="text-[10px] text-slate-500">Risk {risk}/100</span>
      </div>
      <dl className="text-[11px] text-slate-700 space-y-1">
        <div className="flex justify-between"><dt>Population</dt><dd className="font-semibold">{h.population.toLocaleString()}</dd></div>
        <div className="flex justify-between"><dt>Vulnerability</dt><dd className="font-semibold">{h.vulnerability}/100</dd></div>
        <div className="flex justify-between"><dt>Historical Events</dt><dd className="font-semibold">{h.historicalEvents}</dd></div>
        <div className="flex justify-between"><dt>Population at Risk</dt><dd className="font-semibold">{popAtRisk.toLocaleString()}</dd></div>
        <div className="flex justify-between"><dt>Vulnerable Pop.</dt><dd className="font-semibold">{vulnerable.toLocaleString()}</dd></div>
        <div className="flex justify-between"><dt>Relocation Priority</dt><dd className="font-semibold">{priority}</dd></div>
        <div className="flex justify-between"><dt>Recommended Site</dt><dd className="font-semibold text-right">{recSite ?? "In-place"}</dd></div>
      </dl>
    </div>
  );
}

function RelocationPopup({ site }: { site: RelocationSite }) {
  const avail = siteAvailableCapacity(site);
  const suitability = siteSuitability(site);
  const recPop = recommendedPopulation(site);

  return (
    <div className="w-60 font-sans">
      <div className="text-sm font-bold text-slate-800 mb-1">{site.name}</div>
      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold border bg-blue-100 text-blue-700 border-blue-300 mb-2">
        Suitability {suitability}/100
      </span>
      <dl className="text-[11px] text-slate-700 space-y-1">
        <div className="flex justify-between"><dt>Total Capacity</dt><dd className="font-semibold">{site.totalCapacity.toLocaleString()}</dd></div>
        <div className="flex justify-between"><dt>Existing Population</dt><dd className="font-semibold">{site.existingPopulation.toLocaleString()}</dd></div>
        <div className="flex justify-between"><dt>Available Capacity</dt><dd className="font-semibold">{avail.toLocaleString()}</dd></div>
        <div className="flex justify-between"><dt>Hazard Safety</dt><dd className="font-semibold">{site.hazardSafety}/100</dd></div>
        <div className="flex justify-between"><dt>Road Accessibility</dt><dd className="font-semibold">{site.roadAccess}/100</dd></div>
        <div className="flex justify-between"><dt>Healthcare Access</dt><dd className="font-semibold">{site.healthcareAccess}/100</dd></div>
        <div className="flex justify-between"><dt>Water Availability</dt><dd className="font-semibold">{site.waterAvailability}/100</dd></div>
        <div className="flex justify-between"><dt>Infrastructure</dt><dd className="font-semibold">{site.infrastructure}/100</dd></div>
        <div className="flex justify-between"><dt>Recommended Pop.</dt><dd className="font-semibold">{recPop.toLocaleString()}</dd></div>
      </dl>
    </div>
  );
}

const ROAD_COLOR: Record<string, string> = { highway: "#1d4ed8", major: "#3b82f6", minor: "#94a3b8" };
const HAZARD_STYLE: Record<string, { color: string; fill: string }> = {
  flood: { color: "#2563eb", fill: "#3b82f6" },
  landslide: { color: "#c2410c", fill: "#ea580c" },
  cloudburst: { color: "#6d28d9", fill: "#7c3aed" },
  coastal: { color: "#0e7490", fill: "#0891b2" },
};

export interface GisMapProps {
  scenario: ScenarioParams;
  layers: LayerState;
  flyTo?: [number, number] | null;
  height?: string;
}

export default function GisMap({ scenario, layers, flyTo, height = "640px" }: GisMapProps) {
  const habitations = useMemo(() => HABITATIONS, []);
  const sites = useMemo(() => RELOCATION_SITES, []);

  return (
    <MapContainer center={MAP_CENTER} zoom={12} scrollWheelZoom className="w-full z-0" style={{ height, background: "#e5e7eb" }}>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite (Esri)">
          <TileLayer attribution='&copy; Esri, Maxar, Earthstar Geographics' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Terrain (OpenTopoMap)">
          <TileLayer attribution='&copy; OpenTopoMap (CC-BY-SA)' url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
        </LayersControl.BaseLayer>

        {layers.redZones && (
          <LayersControl.Overlay checked name="Red Zones">
            <LayerGroup>
              {RED_ZONES.map((rz) => (
                <Polygon key={rz.id} positions={rz.coords} pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.28, weight: 2, dashArray: "4 2" }}>
                  <Popup><div className="text-xs font-semibold text-red-700">{rz.name}</div><div className="text-[11px] text-slate-600 mt-1">Hazards: {rz.hazardTypes.join(", ")}</div></Popup>
                </Polygon>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.flood && (
          <LayersControl.Overlay checked name="Flood Risk">
            <LayerGroup>
              {HAZARD_POLYGONS.filter((p) => p.type === "flood").map((p) => (
                <Polygon key={p.id} positions={p.coords} pathOptions={{ color: HAZARD_STYLE.flood.color, fillColor: HAZARD_STYLE.flood.fill, fillOpacity: 0.25, weight: 1 }}>
                  <Popup><div className="text-xs font-semibold text-blue-700">{p.name}</div><div className="text-[11px] text-slate-600">Flood — severity {p.severity}/5</div></Popup>
                </Polygon>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.landslide && (
          <LayersControl.Overlay checked name="Landslide Risk">
            <LayerGroup>
              {HAZARD_POLYGONS.filter((p) => p.type === "landslide").map((p) => (
                <Polygon key={p.id} positions={p.coords} pathOptions={{ color: HAZARD_STYLE.landslide.color, fillColor: HAZARD_STYLE.landslide.fill, fillOpacity: 0.25, weight: 1 }}>
                  <Popup><div className="text-xs font-semibold text-orange-700">{p.name}</div><div className="text-[11px] text-slate-600">Landslide — severity {p.severity}/5</div></Popup>
                </Polygon>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.cloudburst && (
          <LayersControl.Overlay checked name="Cloudburst Risk">
            <LayerGroup>
              {HAZARD_POLYGONS.filter((p) => p.type === "cloudburst").map((p) => (
                <Polygon key={p.id} positions={p.coords} pathOptions={{ color: HAZARD_STYLE.cloudburst.color, fillColor: HAZARD_STYLE.cloudburst.fill, fillOpacity: 0.22, weight: 1 }}>
                  <Popup><div className="text-xs font-semibold text-violet-700">{p.name}</div><div className="text-[11px] text-slate-600">Cloudburst — severity {p.severity}/5</div></Popup>
                </Polygon>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.coastal && (
          <LayersControl.Overlay checked name="Coastal Erosion">
            <LayerGroup>
              {HAZARD_POLYGONS.filter((p) => p.type === "coastal").map((p) => (
                <Polygon key={p.id} positions={p.coords} pathOptions={{ color: HAZARD_STYLE.coastal.color, fillColor: HAZARD_STYLE.coastal.fill, fillOpacity: 0.25, weight: 1 }}>
                  <Popup><div className="text-xs font-semibold text-cyan-700">{p.name}</div><div className="text-[11px] text-slate-600">Erosion — severity {p.severity}/5</div></Popup>
                </Polygon>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.historical && (
          <LayersControl.Overlay checked name="Historical Disasters">
            <LayerGroup>
              {HISTORICAL_DISASTERS.map((d) => (
                <CircleMarker key={d.id} center={[d.lat, d.lng]} radius={6 + d.severity} pathOptions={{ color: "#7c2d12", fillColor: "#b91c1c", fillOpacity: 0.7, weight: 1 }}>
                  <Popup><div className="text-xs font-bold text-slate-800">{d.name}</div><div className="text-[11px] text-slate-600 mt-1">{d.type} • {d.year} • Severity {d.severity}/5</div></Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.habitations && (
          <LayersControl.Overlay checked name="Habitations">
            <LayerGroup>
              {habitations.map((h) => {
                const risk = effectiveRisk(h, scenario);
                const color = riskDotColor(risk);
                return <Marker key={h.id} position={[h.lat, h.lng]} icon={makeIcon(color, "H")}><Popup><HabitationPopup h={h} scenario={scenario} /></Popup></Marker>;
              })}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.vulnerable && (
          <LayersControl.Overlay checked name="Vulnerable Habitations">
            <LayerGroup>
              {habitations.filter((h) => h.vulnerability >= 70).map((h) => (
                <CircleMarker key={h.id} center={[h.lat, h.lng]} radius={10} pathOptions={{ color: "#be185d", fillColor: "#f43f5e", fillOpacity: 0.5, weight: 2 }}>
                  <Popup><div className="text-xs font-bold text-slate-800">{h.name}</div><div className="text-[11px] text-slate-600 mt-1">Vulnerability {h.vulnerability}/100</div></Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.relocation && (
          <LayersControl.Overlay checked name="Safe Relocation Sites">
            <LayerGroup>
              {sites.map((s) => (
                <Marker key={s.id} position={[s.lat, s.lng]} icon={makeIcon("#2563eb", "R")}><Popup><RelocationPopup site={s} /></Popup></Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.shelters && (
          <LayersControl.Overlay checked name="Shelters">
            <LayerGroup>
              {SHELTERS.map((sh) => (
                <Marker key={sh.id} position={[sh.lat, sh.lng]} icon={makeIcon("#475569", "S")}><Popup><div className="text-xs font-bold text-slate-800">{sh.name}</div><div className="text-[11px] text-slate-600 mt-1">Capacity: {sh.capacity}</div></Popup></Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.hospitals && (
          <LayersControl.Overlay checked name="Hospitals">
            <LayerGroup>
              {HOSPITALS.map((hp) => (
                <Marker key={hp.id} position={[hp.lat, hp.lng]} icon={makeIcon("#0d9488", "+")}><Popup><div className="text-xs font-bold text-slate-800">{hp.name}</div><div className="text-[11px] text-slate-600 mt-1">Beds: {hp.beds}</div></Popup></Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.roads && (
          <LayersControl.Overlay checked name="Roads">
            <LayerGroup>
              {ROADS.map((r) => (
                <Polyline key={r.id} positions={r.points} pathOptions={{ color: ROAD_COLOR[r.type], weight: r.type === "highway" ? 4 : r.type === "major" ? 3 : 2, opacity: 0.9 }}>
                  <Popup><div className="text-xs font-semibold text-slate-800">{r.name}</div></Popup>
                </Polyline>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.rivers && (
          <LayersControl.Overlay checked name="Rivers">
            <LayerGroup>
              {RIVERS.map((r) => (
                <Polyline key={r.id} positions={r.points} pathOptions={{ color: "#0ea5e9", weight: 3, opacity: 0.8 }}>
                  <Popup><div className="text-xs font-semibold text-sky-700">{r.name}</div></Popup>
                </Polyline>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}

        {layers.infrastructure && (
          <LayersControl.Overlay checked name="Infrastructure">
            <LayerGroup>
              {INFRASTRUCTURE.map((i) => (
                <Marker key={i.id} position={[i.lat, i.lng]} icon={makeIcon("#7c3aed", "I")}>
                  <Popup><div className="text-xs font-bold text-slate-800">{i.name}</div><div className="text-[11px] text-slate-600 mt-1 capitalize">{i.type}</div></Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        )}
      </LayersControl>

      <FlyTo target={flyTo ?? null} />
    </MapContainer>
  );
}
