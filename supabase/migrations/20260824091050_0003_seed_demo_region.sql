/*
# SafeHabitat AI — Synthetic Demo Dataset

1. Purpose
   Seeds a coherent fictional Indian-region dataset for the first working application flow.

2. Coverage
   One DEMO REGION, 32 habitations, population and vulnerable groups, four hazard layers,
   hazard events, disaster history, roads, hospitals, shelters, infrastructure, eight safe
   relocation sites, risk assessments, red zones, alerts, and risk configuration.

3. Safety
   All records are synthetic. Available capacity is total capacity minus existing population.
*/
DO $$
DECLARE
  v_region_id uuid;
  v_habitation_id uuid;
  v_flood uuid;
  v_landslide uuid;
  v_cloudburst uuid;
  v_coastal uuid;
  v_event_hazard uuid;
  i integer;
  v_lat numeric;
  v_lon numeric;
  v_pop integer;
  v_risk numeric;
  v_vulnerability numeric;
  v_class text;
BEGIN
  INSERT INTO regions(name,state_name,district_name,code,boundary,is_demo)
  VALUES('Malabar Coastal & Hills Demo Region','Kerala (Synthetic)','Demo District','DEMO-MCH-001',ST_GeomFromText('POLYGON((76.42 11.02,76.98 11.02,76.98 11.56,76.42 11.56,76.42 11.02))',4326),true)
  ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name RETURNING id INTO v_region_id;
  IF v_region_id IS NULL THEN SELECT id INTO v_region_id FROM regions WHERE code='DEMO-MCH-001'; END IF;

  INSERT INTO risk_configuration(region_id,flood_weight,landslide_weight,cloudburst_weight,coastal_erosion_weight,historical_impact_weight,population_exposure_weight,geographic_vulnerability_weight,red_zone_threshold,low_threshold,moderate_threshold,high_threshold,config_version)
  SELECT v_region_id,.25,.20,.15,.10,.10,.10,.10,80,30,60,80,'demo-v1'
  WHERE NOT EXISTS(SELECT 1 FROM risk_configuration rc WHERE rc.region_id=v_region_id);

  INSERT INTO hazards(region_id,hazard_type,name,severity,geometry,source_type)
  SELECT v_region_id,'flood','Demo Floodplain Exposure',78,ST_GeomFromText('MULTIPOLYGON(((76.43 11.04,76.68 11.04,76.68 11.25,76.43 11.25,76.43 11.04)))',4326),'synthetic'
  WHERE NOT EXISTS(SELECT 1 FROM hazards WHERE region_id=v_region_id AND hazard_type='flood');
  SELECT id INTO v_flood FROM hazards WHERE region_id=v_region_id AND hazard_type='flood' LIMIT 1;
  INSERT INTO hazards(region_id,hazard_type,name,severity,geometry,source_type)
  SELECT v_region_id,'landslide','Demo Western Ghats Slope Zone',82,ST_GeomFromText('MULTIPOLYGON(((76.70 11.24,76.96 11.24,76.96 11.55,76.70 11.55,76.70 11.24)))',4326),'synthetic'
  WHERE NOT EXISTS(SELECT 1 FROM hazards WHERE region_id=v_region_id AND hazard_type='landslide');
  SELECT id INTO v_landslide FROM hazards WHERE region_id=v_region_id AND hazard_type='landslide' LIMIT 1;
  INSERT INTO hazards(region_id,hazard_type,name,severity,geometry,source_type)
  SELECT v_region_id,'cloudburst','Demo High-Rainfall Corridor',70,ST_GeomFromText('MULTIPOLYGON(((76.56 11.14,76.80 11.14,76.80 11.40,76.56 11.40,76.56 11.14)))',4326),'synthetic'
  WHERE NOT EXISTS(SELECT 1 FROM hazards WHERE region_id=v_region_id AND hazard_type='cloudburst');
  SELECT id INTO v_cloudburst FROM hazards WHERE region_id=v_region_id AND hazard_type='cloudburst' LIMIT 1;
  INSERT INTO hazards(region_id,hazard_type,name,severity,geometry,source_type)
  SELECT v_region_id,'coastal_erosion','Demo Coastal Erosion Belt',64,ST_GeomFromText('MULTIPOLYGON(((76.42 11.02,76.56 11.02,76.56 11.12,76.42 11.12,76.42 11.02)))',4326),'synthetic'
  WHERE NOT EXISTS(SELECT 1 FROM hazards WHERE region_id=v_region_id AND hazard_type='coastal_erosion');
  SELECT id INTO v_coastal FROM hazards WHERE region_id=v_region_id AND hazard_type='coastal_erosion' LIMIT 1;

  FOR i IN 1..32 LOOP
    v_lat:=11.06+((i-1)%8)*.062; v_lon:=76.46+floor((i-1)/8)*.118; v_pop:=420+((i*317)%4200); v_risk:=LEAST(96,28+((i*19)%67)); v_vulnerability:=LEAST(94,24+((i*13)%67));
    v_class:=CASE WHEN v_risk>=80 THEN 'Critical' WHEN v_risk>=61 THEN 'High' WHEN v_risk>=31 THEN 'Moderate' ELSE 'Low' END;
    INSERT INTO habitations(region_id,name,habitation_code,location,boundary,elevation_m,population_total)
    VALUES(v_region_id,'Demo Habitation '||LPAD(i::text,2,'0'),'DEMO-HAB-'||LPAD(i::text,3,'0'),ST_SetSRID(ST_MakePoint(v_lon,v_lat),4326),ST_GeomFromText(format('POLYGON((%s %s,%s %s,%s %s,%s %s,%s %s))',v_lon-.018,v_lat-.018,v_lon+.018,v_lat-.018,v_lon+.018,v_lat+.018,v_lon-.018,v_lat+.018,v_lon-.018,v_lat-.018),4326),12+((i*23)%860),v_pop)
    ON CONFLICT DO NOTHING RETURNING id INTO v_habitation_id;
    IF v_habitation_id IS NULL THEN SELECT id INTO v_habitation_id FROM habitations WHERE habitation_code='DEMO-HAB-'||LPAD(i::text,3,'0'); END IF;
    INSERT INTO population(habitation_id,total_count,children_count,elderly_count,disability_count,medical_vulnerability_count,female_headed_household_count,density_per_sq_km,source_type)
    SELECT v_habitation_id,v_pop,floor(v_pop*(.18+(i%5)*.01)),floor(v_pop*(.08+(i%4)*.01)),floor(v_pop*(.025+(i%3)*.005)),floor(v_pop*(.035+(i%4)*.006)),floor(v_pop*.12),v_pop/.9,'synthetic'
    WHERE NOT EXISTS(SELECT 1 FROM population p WHERE p.habitation_id=v_habitation_id);
    INSERT INTO vulnerable_population(habitation_id,children_count,elderly_count,disability_count,medical_vulnerability_count,road_access_score,hospital_access_score,infrastructure_condition_score,vulnerability_score,calculation_version)
    SELECT v_habitation_id,floor(v_pop*.2),floor(v_pop*.1),floor(v_pop*.03),floor(v_pop*.05),36+((i*7)%55),30+((i*11)%64),34+((i*5)%56),v_vulnerability,'demo-v1'
    WHERE NOT EXISTS(SELECT 1 FROM vulnerable_population vp WHERE vp.habitation_id=v_habitation_id);
    INSERT INTO risk_assessments(habitation_id,flood_risk,landslide_risk,cloudburst_risk,coastal_erosion_risk,historical_impact,population_exposure,geographic_vulnerability,final_risk_score,risk_class,weight_configuration,calculation_version)
    SELECT v_habitation_id,35+((i*17)%62),28+((i*23)%68),32+((i*11)%58),20+((i*29)%65),18+((i*7)%74),30+((i*13)%67),v_vulnerability,v_risk,v_class,'{"flood":0.25,"landslide":0.20,"cloudburst":0.15,"coastal_erosion":0.10,"historical":0.10,"population":0.10,"geographic":0.10}'::jsonb,'demo-v1'
    WHERE NOT EXISTS(SELECT 1 FROM risk_assessments ra WHERE ra.habitation_id=v_habitation_id AND ra.scenario_run_id IS NULL);
    INSERT INTO red_zones(region_id,habitation_id,risk_assessment_id,threshold_used,risk_score,risk_class,geometry)
    SELECT v_region_id,v_habitation_id,ra.id,80,ra.final_risk_score,ra.risk_class,h.boundary FROM risk_assessments ra JOIN habitations h ON h.id=ra.habitation_id
    WHERE ra.habitation_id=v_habitation_id AND ra.final_risk_score>=80 AND NOT EXISTS(SELECT 1 FROM red_zones rz WHERE rz.habitation_id=v_habitation_id);
    IF i%2=0 THEN
      INSERT INTO disaster_history(region_id,habitation_id,event_type,event_date,deaths,injuries,houses_damaged,infrastructure_damage_score,impact_score,geometry)
      VALUES(v_region_id,v_habitation_id,CASE WHEN i%3=0 THEN 'flood' WHEN i%3=1 THEN 'landslide' ELSE 'cloudburst' END,('201'||(i%8)::text||'-08-20')::date,i%4,i%13,8+((i*17)%190),22+((i*9)%67),25+((i*11)%70),ST_SetSRID(ST_MakePoint(v_lon,v_lat),4326));
    END IF;
  END LOOP;

  FOR i IN 1..8 LOOP
    INSERT INTO relocation_sites(region_id,name,site_code,location,boundary,total_capacity,existing_population,available_capacity,hazard_exposure_score,road_access_score,healthcare_score,water_score,electricity_score,sanitation_score,emergency_services_score,existing_population_score,is_approved)
    VALUES(v_region_id,'Safe Site '||CHR(64+i)||' — Demo','DEMO-SITE-'||LPAD(i::text,2,'0'),ST_SetSRID(ST_MakePoint(76.50+((i-1)%4)*.12,11.10+floor((i-1)/4)*.28),4326),ST_GeomFromText(format('POLYGON((%s %s,%s %s,%s %s,%s %s,%s %s))',76.48+((i-1)%4)*.12,11.08+floor((i-1)/4)*.28,76.53+((i-1)%4)*.12,11.08+floor((i-1)/4)*.28,76.53+((i-1)%4)*.12,11.13+floor((i-1)/4)*.28,76.48+((i-1)%4)*.12,11.13+floor((i-1)/4)*.28,76.48+((i-1)%4)*.12,11.08+floor((i-1)/4)*.28),4326),2500+((i*911)%4300),180+((i*83)%700),0,7+((i*8)%30),62+((i*7)%34),58+((i*9)%39),70+((i*5)%28),68+((i*3)%31),59+((i*11)%35),66+((i*13)%30),18+((i*4)%38),true)
    ON CONFLICT DO NOTHING;
  END LOOP;
  UPDATE relocation_sites rs SET available_capacity=GREATEST(0,rs.total_capacity-rs.existing_population) WHERE rs.region_id=v_region_id;

  FOR i IN 1..7 LOOP
    INSERT INTO roads(region_id,name,road_class,condition_score,accessibility_score,geometry) VALUES(v_region_id,'Demo Corridor '||i,CASE WHEN i<=2 THEN 'national' WHEN i<=4 THEN 'state' ELSE 'district' END,48+((i*7)%45),52+((i*9)%43),ST_GeomFromText(format('LINESTRING(76.43 %s,76.96 %s)',11.04+i*.07,11.50-i*.05),4326));
  END LOOP;
  FOR i IN 1..4 LOOP
    INSERT INTO hospitals(region_id,name,location,bed_capacity,emergency_capacity,accessibility_score) VALUES(v_region_id,'Demo District Hospital '||i,ST_SetSRID(ST_MakePoint(76.50+i*.10,11.14+i*.08),4326),80+i*35,20+i*9,55+i*8);
  END LOOP;
  FOR i IN 1..8 LOOP
    INSERT INTO shelters(region_id,name,location,capacity,current_occupancy,condition_score) VALUES(v_region_id,'Demo Emergency Shelter '||i,ST_SetSRID(ST_MakePoint(76.47+((i-1)%4)*.13,11.10+floor((i-1)/4)*.25),4326),300+i*75,40+i*12,58+(i*4)%36);
  END LOOP;
  FOR i IN 1..12 LOOP
    INSERT INTO infrastructure(region_id,asset_type,name,condition_score,location,capacity) VALUES(v_region_id,CASE WHEN i%3=0 THEN 'water' WHEN i%3=1 THEN 'electricity' ELSE 'sanitation' END,'Demo Utility Asset '||i,46+((i*6)%49),ST_SetSRID(ST_MakePoint(76.45+((i-1)%6)*.09,11.08+floor((i-1)/6)*.32),4326),500+i*90);
  END LOOP;
  FOR i IN 1..10 LOOP
    v_event_hazard:=CASE WHEN i%4=0 THEN v_coastal WHEN i%3=0 THEN v_cloudburst WHEN i%2=0 THEN v_landslide ELSE v_flood END;
    INSERT INTO hazard_events(region_id,hazard_id,event_date,severity,affected_area_sq_km,rainfall_mm,estimated_affected_population,geometry) VALUES(v_region_id,v_event_hazard,('201'||(i%8)::text||'-08-20')::date,45+((i*7)%51),12+i*3,140+i*38,500+i*245,ST_GeomFromText(format('POLYGON((%s %s,%s %s,%s %s,%s %s,%s %s))',76.46+i*.02,11.05+i*.025,76.50+i*.02,11.05+i*.025,76.50+i*.02,11.09+i*.025,76.46+i*.02,11.09+i*.025,76.46+i*.02,11.05+i*.025),4326));
  END LOOP;

  INSERT INTO alerts(region_id,alert_type,severity,title,message,related_habitation_id)
  SELECT v_region_id,'red_zone','critical','Immediate relocation planning required','Critical risk score and high vulnerability require an immediate relocation plan.',h.id
  FROM habitations h JOIN risk_assessments ra ON ra.habitation_id=h.id
  WHERE h.region_id=v_region_id AND ra.risk_class='Critical' AND NOT EXISTS(SELECT 1 FROM alerts a WHERE a.related_habitation_id=h.id AND a.alert_type='red_zone');
  INSERT INTO alerts(region_id,alert_type,severity,title,message)
  SELECT v_region_id,'capacity','warning','Safe-site capacity review required','Available safe capacity is finite and allocations must remain within verified site limits.'
  WHERE NOT EXISTS(SELECT 1 FROM alerts a WHERE a.region_id=v_region_id AND a.alert_type='capacity');
END $$;
