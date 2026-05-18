import { NextResponse } from 'next/server';
import { generateMockReport, generateReportFromResults } from '@/lib/mockAuditData';
import { buildResultsFromManualEvidence } from '@/lib/manualEvidence';
import { SnapshotInput } from '@/lib/types';

export async function POST(req: Request) {
  const input = (await req.json()) as SnapshotInput;
  const hasManualEvidence = Boolean(input.evidenceEntries?.some((e) => e.response?.trim()));

  if (hasManualEvidence) {
    const { queryResults, competitorDiscoveries } = buildResultsFromManualEvidence(input);
    const manualReport = generateReportFromResults(input, queryResults, competitorDiscoveries, 'manual');
    manualReport.dataSourceStatus = 'Manual evidence mode: report built from pasted platform outputs';
    return NextResponse.json(manualReport);
  }

  const demoReport = generateMockReport(input, 'demo');
  demoReport.dataSourceStatus = 'Demo Mode: Simulated data used (add manual evidence to use real pasted results)';
  return NextResponse.json(demoReport);
}
