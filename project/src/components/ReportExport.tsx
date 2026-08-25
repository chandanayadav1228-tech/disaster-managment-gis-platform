import type { SimResults, SimParams } from '@/sim/types';
import { labelForLevel } from '@/sim/types';
import { ZONES, SHELTERS } from '@/sim/regions';
import { RED_ZONE_THRESHOLD } from '@/sim/engine';
import { FileDown } from 'lucide-react';

interface ReportExportProps {
  results: SimResults;
  params: SimParams;
  baseline: SimParams;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function paramsString(p: SimParams): string {
  return `Rainfall: ${p.rainfall} | Hazard Severity: ${p.hazardSeverity} | Available Capacity: ${p.availableCapacityPct}% | Accessibility: ${p.accessibilityPct}%`;
}

function generateReport(results: SimResults, params: SimParams, baseline: SimParams): string {
  const lines: string[] = [];
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('  DISASTER GIS — SCENARIO SIMULATION REPORT');
  lines.push('  SIMULATION ONLY — NOT REAL-TIME DISASTER PREDICTION');
  lines.push(`  Generated: ${new Date().toLocaleString('en-US')}`);
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  lines.push('BASELINE PARAMETERS:');
  lines.push(`  ${paramsString(baseline)}`);
  lines.push('');
  lines.push('CURRENT SCENARIO PARAMETERS:');
  lines.push(`  ${paramsString(params)}`);
  lines.push('');
  lines.push('─'.repeat(63));
  lines.push('SUMMARY METRICS');
  lines.push('─'.repeat(63));
  lines.push(`  Average Risk Score:     ${results.avgRisk}/100`);
  lines.push(`  Red Zone Threshold:     ≥ ${RED_ZONE_THRESHOLD}`);
  lines.push(`  Red Zones:              ${results.redZoneCount} / ${results.zones.length}`);
  lines.push(`  Red Zone Population:    ${fmt(results.redZonePopulation)}`);
  lines.push(`  People to Relocate:     ${fmt(results.totalEvacNeeded)}`);
  lines.push(`  Total Shelter Capacity: ${fmt(results.totalCapacity)}`);
  lines.push(`  Allocated:              ${fmt(results.totalAllocated)}`);
  lines.push(`  Unsheltered:            ${fmt(results.unallocated)}`);
  const coverage = results.totalEvacNeeded > 0 ? Math.round((results.totalAllocated / results.totalEvacNeeded) * 100) : 100;
  lines.push(`  Coverage:               ${coverage}%`);
  lines.push('');
  lines.push('─'.repeat(63));
  lines.push('RELOCATION PRIORITY (by risk score, descending)');
  lines.push('─'.repeat(63));
  if (results.priorityZones.length === 0) {
    lines.push('  No zones require relocation.');
  } else {
    results.priorityZones.forEach((z, i) => {
      const zone = ZONES.find((x) => x.id === z.id);
      lines.push(
        `  ${String(i + 1).padStart(2)}. ${zone?.name ?? z.name} (${z.id})` +
          `  Risk: ${z.riskScore} (${labelForLevel(z.riskLevel)})` +
          `  Evac: ${fmt(z.evacNeeded)}/${fmt(zone?.population ?? 0)}` +
          `  ${z.redZone ? '[RED ZONE]' : ''}`,
      );
    });
  }
  lines.push('');
  lines.push('─'.repeat(63));
  lines.push('SHELTER ALLOCATION');
  lines.push('─'.repeat(63));
  results.shelters.forEach((s) => {
    const shelter = SHELTERS.find((x) => x.id === s.id);
    lines.push(`  ${shelter?.name ?? s.name} (${s.id})`);
    lines.push(`    Capacity: ${fmt(s.capacity)}  Allocated: ${fmt(s.allocated)}  Utilization: ${s.utilization}%`);
    if (s.incomingFrom.length > 0) {
      s.incomingFrom.forEach((inc) => {
        const zone = ZONES.find((z) => z.id === inc.zoneId);
        lines.push(`    ← ${fmt(inc.people)} from ${zone?.name ?? inc.zoneId} (${inc.zoneId})`);
      });
    } else {
      lines.push('    (no arrivals)');
    }
  });
  lines.push('');
  lines.push('─'.repeat(63));
  lines.push('ZONE RISK DETAIL');
  lines.push('─'.repeat(63));
  results.zones.forEach((z) => {
    const zone = ZONES.find((x) => x.id === z.id);
    lines.push(
      `  ${z.id}  ${(zone?.name ?? z.name).padEnd(22)} Risk: ${String(z.riskScore).padStart(3)} (${labelForLevel(z.riskLevel).padEnd(8)})` +
        `  Evac: ${fmt(z.evacNeeded).padStart(6)}  ${z.redZone ? '[RED]' : ''}`,
    );
  });
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('  END OF REPORT — SIMULATION ONLY, NOT FOR LIVE EMERGENCY USE');
  lines.push('═══════════════════════════════════════════════════════════════');
  return lines.join('\n');
}

export function ReportExport({ results, params, baseline }: ReportExportProps) {
  const handleDownload = () => {
    const report = generateReport(results, params, baseline);
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disaster-sim-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-slate-100 px-3 py-2 rounded-lg border border-ink-700 hover:border-ink-500 bg-ink-900/50 transition-colors"
    >
      <FileDown size={14} />
      Export Report
    </button>
  );
}
