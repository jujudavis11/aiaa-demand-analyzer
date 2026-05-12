import { NextResponse } from 'next/server';
import { generateMockReport, generateReportFromResults } from '@/lib/mockAuditData';
import { runPerplexityVisibilityAudit } from '@/lib/perplexity';
import { SnapshotInput } from '@/lib/types';

const hasLiveKeys = Boolean(process.env.PERPLEXITY_API_KEY);
const DATA_MODE: 'demo' | 'live' = hasLiveKeys ? 'live' : 'demo';

export async function POST(req: Request) {
  const input = (await req.json()) as SnapshotInput;

  if (DATA_MODE === 'live') {
    try {
      const { queryResults, competitorDiscoveries } = await runPerplexityVisibilityAudit(input);
      const liveReport = generateReportFromResults(input, queryResults, competitorDiscoveries, 'live');
      liveReport.dataSourceStatus = 'Live Mode: Perplexity data used';
      return NextResponse.json(liveReport);
    } catch (error) {
      console.error('Perplexity live mode failed, falling back to demo mode.', error);
    }
  }

  const demoReport = generateMockReport(input, 'demo');
  demoReport.dataSourceStatus = 'Demo Mode: Simulated data used';
  return NextResponse.json(demoReport);
}
