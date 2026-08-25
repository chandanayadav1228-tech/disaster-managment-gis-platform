/*
# Disaster Management GIS Platform — Seed Data (Uttarakhand Himalayan Region)

## Purpose
Seeds the database with realistic geographic data for the Uttarakhand Himalayan region,
focused on the disaster-prone districts of Rudraprayag, Chamoli, and Pauri Garhwal.
This region is historically affected by floods (2013 Kedarnath disaster), landslides,
and earthquakes (1991 Uttarkashi, 1999 Chamoli).

## Data Seeded
1. **Habitations** (12 villages) — with realistic population and vulnerable-group counts
   based on typical Himalayan village demographics (children ~25%, elderly ~12%, disabled ~3%)
2. **Hazard Zones** (8 zones) — flood zones along Alaknanda/Mandakini rivers,
   landslide zones on steep slopes, earthquake zones along fault lines
3. **Roads** (5 routes) — NH-58 highway, main district roads, local mountain roads
4. **Hospitals** (4 facilities) — district hospitals and CHCs
5. **Shelters** (5 sites) — school buildings and community halls used as emergency shelters
6. **Relocation Sites** (4 sites) — designated safe grounds for evacuation

## Notes
1. All coordinates are real locations in Uttarakhand, India (lat ~30.2-30.9, lng ~78.8-79.3)
2. Hazard zone polygons are approximate representations of known risk areas
3. After seeding, refresh_risk() is called to populate the materialized view
4. Uses ON CONFLICT DO NOTHING for idempotency (re-runnable)
*/

-- ============================================================
-- 1. HABITATIONS (12 villages)
-- ============================================================
INSERT INTO habitations (name, district, population, children, elderly, disabled, location) VALUES
('Kedarnath',         'Rudraprayag', 612,  150, 78, 18, ST_SetSRID(ST_MakePoint(79.0669, 30.7345), 4326)::geography),
('Gaurikund',         'Rudraprayag', 845,  210, 102, 25, ST_SetSRID(ST_MakePoint(78.9742, 30.6590), 4326)::geography),
('Sonprayag',         'Rudraprayag', 420,  105, 50, 12, ST_SetSRID(ST_MakePoint(78.9350, 30.6230), 4326)::geography),
('Guptkashi',         'Rudraprayag', 1280, 320, 154, 38, ST_SetSRID(ST_MakePoint(79.0840, 30.5320), 4326)::geography),
('Phata',             'Rudraprayag', 380,  95, 46, 11, ST_SetSRID(ST_MakePoint(79.0340, 30.4860), 4326)::geography),
('Rudraprayag Town',  'Rudraprayag', 3200, 800, 384, 96, ST_SetSRID(ST_MakePoint(78.9810, 30.2840), 4326)::geography),
('Agastyamuni',       'Rudraprayag', 1850, 462, 222, 55, ST_SetSRID(ST_MakePoint(79.0120, 30.3760), 4326)::geography),
('Ukhimath',          'Rudraprayag', 1520, 380, 182, 45, ST_SetSRID(ST_MakePoint(79.0950, 30.4300), 4326)::geography),
('Chamoli Town',      'Chamoli',     2100, 525, 252, 63, ST_SetSRID(ST_MakePoint(79.3230, 30.4150), 4326)::geography),
('Gopeshwar',         'Chamoli',     2450, 612, 294, 73, ST_SetSRID(ST_MakePoint(79.3280, 30.4180), 4326)::geography),
('Joshimath',         'Chamoli',     3800, 950, 456, 114, ST_SetSRID(ST_MakePoint(79.5630, 30.5720), 4326)::geography),
('Pauri',             'Pauri Garhwal', 5200, 1300, 624, 156, ST_SetSRID(ST_MakePoint(78.7790, 30.1460), 4326)::geography)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. HAZARD ZONES (8 zones)
-- ============================================================
INSERT INTO hazard_zones (name, hazard_type, severity, description, boundary) VALUES
-- Flood zones along Alaknanda & Mandakini rivers
('Mandakini Flood Zone', 'flood', 5, 'High-risk flood zone along the Mandakini river, site of the 2013 Kedarnath disaster flash floods',
 ST_GeomFromText('POLYGON((79.00 30.60, 79.10 30.60, 79.10 30.75, 79.00 30.75, 79.00 30.60))', 4326)::geography),
('Alaknanda Flood Zone', 'flood', 4, 'Flood-prone area along the Alaknanda river near Rudraprayag confluence',
 ST_GeomFromText('POLYGON((78.90 30.20, 79.05 30.20, 79.05 30.35, 78.90 30.35, 78.90 30.20))', 4326)::geography),
('Alaknanda Upper Flood Zone', 'flood', 3, 'Seasonal flood zone along upper Alaknanda near Chamoli and Joshimath',
 ST_GeomFromText('POLYGON((79.25 30.35, 79.60 30.35, 79.60 30.60, 79.25 30.60, 79.25 30.35))', 4326)::geography),

-- Landslide zones on steep Himalayan slopes
('Kedarnath Landslide Zone', 'landslide', 5, 'Severe landslide-prone area on the Kedarnath valley slopes, triggered by cloudbursts',
 ST_GeomFromText('POLYGON((79.02 30.68, 79.12 30.68, 79.12 30.80, 79.02 30.80, 79.02 30.68))', 4326)::geography),
('Guptkashi-Mandakani Landslide Zone', 'landslide', 4, 'Active landslide zone on the road between Guptkashi and Kedarnath',
 ST_GeomFromText('POLYGON((78.95 30.48, 79.10 30.48, 79.10 30.60, 78.95 30.60, 78.95 30.48))', 4326)::geography),
('Joshimath Landslide Zone', 'landslide', 4, 'Sinking town zone — Joshimath area with active land subsidence and landslide risk',
 ST_GeomFromText('POLYGON((79.52 30.55, 79.60 30.55, 79.60 30.60, 79.52 30.60, 79.52 30.55))', 4326)::geography),

-- Earthquake zones along fault lines
('Chamoli Earthquake Zone', 'earthquake', 4, 'Seismic zone V area affected by the 1999 Chamoli earthquake (M6.8)',
 ST_GeomFromText('POLYGON((79.20 30.30, 79.40 30.30, 79.40 30.50, 79.20 30.50, 79.20 30.30))', 4326)::geography),
('Uttarkashi Earthquake Zone', 'earthquake', 3, 'Seismic zone V area, affected by the 1991 Uttarkashi earthquake (M6.6)',
 ST_GeomFromText('POLYGON((78.30 30.60, 78.70 30.60, 78.70 30.80, 78.30 30.80, 78.30 30.60))', 4326)::geography)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. ROADS (5 routes)
-- ============================================================
INSERT INTO roads (name, road_type, path) VALUES
('NH-107 Rishikesh-Kedarnath Highway', 'highway',
 ST_GeomFromText('LINESTRING(78.30 30.10, 78.77 30.14, 78.98 30.28, 79.01 30.37, 79.03 30.48, 79.08 30.53, 78.97 30.65, 79.06 30.73)', 4326)::geography),
('Rudraprayag-Guptkashi Road', 'main',
 ST_GeomFromText('LINESTRING(78.98 30.28, 79.01 30.37, 79.08 30.53)', 4326)::geography),
('Gaurikund-Kedarnath Trek Route', 'local',
 ST_GeomFromText('LINESTRING(78.97 30.65, 79.06 30.73)', 4326)::geography),
('Chamoli-Joshimath Road (NH-7)', 'highway',
 ST_GeomFromText('LINESTRING(79.32 30.41, 79.56 30.57)', 4326)::geography),
('Pauri-Rudraprayag Road', 'main',
 ST_GeomFromText('LINESTRING(78.77 30.14, 78.98 30.28)', 4326)::geography)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. HOSPITALS (4 facilities)
-- ============================================================
INSERT INTO hospitals (name, capacity, location) VALUES
('Rudraprayag District Hospital',  150, ST_SetSRID(ST_MakePoint(78.9820, 30.2850), 4326)::geography),
('Gopeshwar Base Hospital',         120, ST_SetSRID(ST_MakePoint(79.3290, 30.4190), 4326)::geography),
('Joshimath Army Medical Center',   80, ST_SetSRID(ST_MakePoint(79.5640, 30.5730), 4326)::geography),
('Pauri Base Hospital',             200, ST_SetSRID(ST_MakePoint(78.7800, 30.1470), 4326)::geography)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. SHELTERS (5 sites)
-- ============================================================
INSERT INTO shelters (name, capacity, location) VALUES
('Guptkashi School Shelter',       300, ST_SetSRID(ST_MakePoint(79.0850, 30.5330), 4326)::geography),
('Agastyamuni Community Hall',      250, ST_SetSRID(ST_MakePoint(79.0130, 30.3770), 4326)::geography),
('Ukhimath School Shelter',         200, ST_SetSRID(ST_MakePoint(79.0960, 30.4310), 4326)::geography),
('Chamoli Government Shelter',      350, ST_SetSRID(ST_MakePoint(79.3240, 30.4160), 4326)::geography),
('Pauri College Shelter',           400, ST_SetSRID(ST_MakePoint(78.7810, 30.1480), 4326)::geography)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. RELOCATION SITES (4 sites)
-- ============================================================
INSERT INTO relocation_sites (name, capacity, location) VALUES
('Guptkashi Relocation Ground',     500, ST_SetSRID(ST_MakePoint(79.0870, 30.5340), 4326)::geography),
('Rudraprayag Sports Ground',       600, ST_SetSRID(ST_MakePoint(78.9830, 30.2860), 4326)::geography),
('Chamoli Relocation Site',         450, ST_SetSRID(ST_MakePoint(79.3250, 30.4170), 4326)::geography),
('Pauri Relocation Ground',         700, ST_SetSRID(ST_MakePoint(78.7820, 30.1490), 4326)::geography)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Refresh the risk materialized view
-- ============================================================
SELECT refresh_risk();
