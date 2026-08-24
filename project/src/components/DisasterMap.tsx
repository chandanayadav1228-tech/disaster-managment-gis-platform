import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { HabitationRisk, HazardZone, RoadFeature, Facility } from '@/lib/types';
import {
  RISK_COLORS,
  HAZARD_FILL_COLORS,
  HAZARD_COLORS,
  ROAD_STYLES,
  formatDistance,
} from '@/lib/constants';

interface LayerVisibility {
  habitations: boolean;
  hazardZones: boolean;
  redZones: boolean;
  roads: boolean;
  hospitals: boolean;
  shelters: boolean;
  relocationSites: boolean;
}

interface DisasterMapProps {
  habitations: HabitationRisk[];
  hazardZones: HazardZone[];
  roads: RoadFeature[];
  hospitals: Facility[];
  shelters: Facility[];
  relocationSites: Facility[];
  layerVisibility: LayerVisibility;
  selectedHabitation: HabitationRisk | null;
  onSelectHabitation: (habitation: HabitationRisk) => void;
}

const MAP_CENTER: [number, number] = [30.45, 79.1];
const MAP_ZOOM = 9;

function createFacilityIcon(emoji: string, bgColor: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background:${bgColor};
      width:32px;height:32px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:18px;border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function createHabitationIcon(riskCategory: string, redZone: boolean): L.DivIcon {
  const color = RISK_COLORS[riskCategory as keyof typeof RISK_COLORS];
  const ring = redZone ? '0 0 0 3px #dc2626' : 'none';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background:${color};
      width:${redZone ? 16 : 12}px;
      height:${redZone ? 16 : 12}px;
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.4), ${ring};
    "></div>`,
    iconSize: [redZone ? 16 : 12, redZone ? 16 : 12],
    iconAnchor: [redZone ? 8 : 6, redZone ? 8 : 6],
  });
}

export default function DisasterMap({
  habitations,
  hazardZones,
  roads,
  hospitals,
  shelters,
  relocationSites,
  layerVisibility,
  selectedHabitation,
  onSelectHabitation,
}: DisasterMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerGroupsRef = useRef<Record<string, L.LayerGroup>>({});
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    const layerNames = [
      'hazardZones',
      'redZones',
      'roads',
      'hospitals',
      'shelters',
      'relocationSites',
      'habitations',
    ];
    layerNames.forEach((name) => {
      layerGroupsRef.current[name] = L.layerGroup().addTo(map);
    });

    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupsRef.current = {};
      markersRef.current = {};
    };
  }, []);

  // Render hazard zones
  useEffect(() => {
    const group = layerGroupsRef.current.hazardZones;
    if (!group) return;
    group.clearLayers();

    if (!layerVisibility.hazardZones) return;

    hazardZones.forEach((zone) => {
      try {
        const geojson = JSON.parse(zone.geojson);
        const fillColor = HAZARD_FILL_COLORS[zone.hazard_type];
        const strokeColor = HAZARD_COLORS[zone.hazard_type];
        const polygon = L.geoJSON(geojson, {
          style: {
            color: strokeColor,
            weight: 2,
            fillColor: fillColor,
            fillOpacity: 0.15 + zone.severity * 0.08,
            opacity: 0.8,
          },
        });
        polygon.bindPopup(
          `<div style="font-family:system-ui;padding:4px;">
            <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${zone.name}</div>
            <div style="font-size:12px;color:#666;text-transform:capitalize;">${zone.hazard_type} &middot; Severity ${zone.severity}/5</div>
            ${zone.description ? `<div style="font-size:12px;margin-top:4px;">${zone.description}</div>` : ''}
          </div>`
        );
        polygon.addTo(group);
      } catch {
        // skip invalid geojson
      }
    });
  }, [hazardZones, layerVisibility.hazardZones]);

  // Render red zone outlines (high-severity areas only)
  useEffect(() => {
    const group = layerGroupsRef.current.redZones;
    if (!group) return;
    group.clearLayers();

    if (!layerVisibility.redZones) return;

    hazardZones
      .filter((z) => z.severity >= 4)
      .forEach((zone) => {
        try {
          const geojson = JSON.parse(zone.geojson);
          const polygon = L.geoJSON(geojson, {
            style: {
              color: '#dc2626',
              weight: 3,
              dashArray: '8 4',
              fillOpacity: 0,
              opacity: 0.9,
            },
          });
          polygon.bindPopup(
            `<div style="font-family:system-ui;padding:4px;">
              <div style="font-weight:700;font-size:14px;color:#dc2626;">RED ZONE</div>
              <div style="font-size:13px;margin-top:2px;">${zone.name}</div>
              <div style="font-size:12px;color:#666;margin-top:2px;">Severity ${zone.severity}/5 — Evacuation priority</div>
            </div>`
          );
          polygon.addTo(group);
        } catch {
          // skip
        }
      });
  }, [hazardZones, layerVisibility.redZones]);

  // Render roads
  useEffect(() => {
    const group = layerGroupsRef.current.roads;
    if (!group) return;
    group.clearLayers();

    if (!layerVisibility.roads) return;

    roads.forEach((road) => {
      try {
        const geojson = JSON.parse(road.geojson);
        const style = ROAD_STYLES[road.road_type];
        const line = L.geoJSON(geojson, {
          style: {
            color: style.color,
            weight: style.weight,
            dashArray: style.dashArray,
            opacity: 0.8,
          },
        });
        line.bindPopup(
          `<div style="font-family:system-ui;padding:4px;">
            <div style="font-weight:600;font-size:13px;">${road.name}</div>
            <div style="font-size:12px;color:#666;text-transform:capitalize;">${road.road_type} road</div>
          </div>`
        );
        line.addTo(group);
      } catch {
        // skip
      }
    });
  }, [roads, layerVisibility.roads]);

  // Render hospitals
  useEffect(() => {
    const group = layerGroupsRef.current.hospitals;
    if (!group) return;
    group.clearLayers();

    if (!layerVisibility.hospitals) return;

    hospitals.forEach((hosp) => {
      const marker = L.marker([hosp.lat, hosp.lng], {
        icon: createFacilityIcon('\u2695', '#dc2626'),
      });
      marker.bindPopup(
        `<div style="font-family:system-ui;padding:4px;">
          <div style="font-weight:600;font-size:14px;">${hosp.name}</div>
          <div style="font-size:12px;color:#666;">Hospital &middot; Capacity: ${hosp.capacity} beds</div>
        </div>`
      );
      marker.addTo(group);
    });
  }, [hospitals, layerVisibility.hospitals]);

  // Render shelters
  useEffect(() => {
    const group = layerGroupsRef.current.shelters;
    if (!group) return;
    group.clearLayers();

    if (!layerVisibility.shelters) return;

    shelters.forEach((sh) => {
      const marker = L.marker([sh.lat, sh.lng], {
        icon: createFacilityIcon('\u25E3', '#2563eb'),
      });
      marker.bindPopup(
        `<div style="font-family:system-ui;padding:4px;">
          <div style="font-weight:600;font-size:14px;">${sh.name}</div>
          <div style="font-size:12px;color:#666;">Emergency Shelter &middot; Capacity: ${sh.capacity}</div>
        </div>`
      );
      marker.addTo(group);
    });
  }, [shelters, layerVisibility.shelters]);

  // Render relocation sites
  useEffect(() => {
    const group = layerGroupsRef.current.relocationSites;
    if (!group) return;
    group.clearLayers();

    if (!layerVisibility.relocationSites) return;

    relocationSites.forEach((site) => {
      const marker = L.marker([site.lat, site.lng], {
        icon: createFacilityIcon('\u2191', '#16a34a'),
      });
      marker.bindPopup(
        `<div style="font-family:system-ui;padding:4px;">
          <div style="font-weight:600;font-size:14px;">${site.name}</div>
          <div style="font-size:12px;color:#666;">Relocation Site &middot; Capacity: ${site.capacity}</div>
        </div>`
      );
      marker.addTo(group);
    });
  }, [relocationSites, layerVisibility.relocationSites]);

  // Render habitations
  useEffect(() => {
    const group = layerGroupsRef.current.habitations;
    if (!group) return;
    group.clearLayers();
    markersRef.current = {};

    if (!layerVisibility.habitations) return;

    habitations.forEach((hab) => {
      const marker = L.marker([hab.lat, hab.lng], {
        icon: createHabitationIcon(hab.risk_category, hab.red_zone),
      });

      const hazardList =
        hab.affected_hazards.length > 0
          ? hab.affected_hazards.map((h) => h).join(', ')
          : 'None identified';

      marker.bindPopup(
        `<div style="font-family:system-ui;padding:4px;min-width:180px;">
          <div style="font-weight:700;font-size:14px;">${hab.name}</div>
          <div style="font-size:12px;color:#666;">${hab.district} District</div>
          <div style="margin-top:6px;font-size:13px;">
            <span style="font-weight:600;color:${RISK_COLORS[hab.risk_category]};">${hab.risk_category} Risk</span>
            <span style="color:#666;"> &middot; Score: ${hab.risk_score.toFixed(1)}/100</span>
          </div>
          ${hab.red_zone ? '<div style="font-size:12px;color:#dc2626;font-weight:600;margin-top:2px;">RED ZONE</div>' : ''}
          <div style="font-size:12px;color:#666;margin-top:4px;">Hazards: ${hazardList}</div>
          <div style="font-size:12px;color:#666;margin-top:2px;">Nearest hospital: ${formatDistance(hab.nearest_hospital_m)}</div>
          <div style="font-size:12px;color:#666;">Nearest shelter: ${formatDistance(hab.nearest_shelter_m)}</div>
        </div>`
      );

      marker.on('click', () => onSelectHabitation(hab));
      marker.addTo(group);
      markersRef.current[hab.id] = marker;
    });
  }, [habitations, layerVisibility.habitations, onSelectHabitation]);

  // Highlight selected habitation
  useEffect(() => {
    Object.values(markersRef.current).forEach((marker) => {
      const el = marker.getElement();
      if (el) el.style.zIndex = '1';
    });

    if (selectedHabitation) {
      const marker = markersRef.current[selectedHabitation.id];
      if (marker) {
        const el = marker.getElement();
        if (el) el.style.zIndex = '1000';
        marker.openPopup();
        if (mapRef.current) {
          mapRef.current.panTo([selectedHabitation.lat, selectedHabitation.lng], {
            animate: true,
            duration: 0.5,
          });
        }
      }
    }
  }, [selectedHabitation]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#1a1a2e' }}
    />
  );
}
