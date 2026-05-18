import { buildQueries } from './prompts';
import { computeScore, labelScore, weights } from './scoring';
import { CompetitorDiscovery, QueryResult, ReportData, SnapshotInput } from './types';

const NAME_POOL = ['Summit', 'Prime', 'Velocity', 'Pinnacle', 'Metro', 'Catalyst', 'NorthStar', 'Elite', 'Trusted', 'BluePeak'];

const hash = (str: string) => Array.from(str).reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 0);
const norm = (v: number, max: number) => Math.min(max, Math.max(0, v));

function discoverCompetitors(input: SnapshotInput, queries: string[], seed: number): CompetitorDiscovery[] {
  const core = input.mainKeyword.split(' ')[0] || input.industry;
  const generated = Array.from({ length: 4 }).map((_, i) => `${NAME_POOL[(seed + i) % NAME_POOL.length]} ${core} ${input.city}`);
  return generated.map((name, i) => ({
    name,
    mentions: 2 + ((seed + i * 3) % 6),
    estimatedRank: i + 1,
    appearedInQueries: queries.filter((_, qi) => (qi + i + seed) % 2 === 0),
    targetBusinessAppeared: (seed + i) % 3 !== 0,
    confidenceScore: 55 + ((seed + i * 11) % 40),
    confidenceReasons: ['Local query co-mentions', 'Service keyword overlap in simulated results'],
    locationMatch: true,
    serviceMatch: true,
    websiteKeywordOverlap: 0.45 + (((seed + i) % 30) / 100),
    directoryConsistency: 0.5 + (((seed + i * 2) % 35) / 100)
  }));
}

function buildQueryResults(input: SnapshotInput, queries: string[], competitors: CompetitorDiscovery[], seed: number): QueryResult[] {
  const domain = input.websiteUrl.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0].toLowerCase();
  return queries.map((query, i) => {
    const targetMentioned = (seed + i) % 4 !== 0;
    const websiteReferenced = (seed + i * 7 + domain.length) % 3 !== 1;
    const sentiment: QueryResult['sentiment'] = ['Negative', 'Neutral', 'Positive'][(seed + i) % 3] as QueryResult['sentiment'];
    return {
      query,
      businessMentioned: targetMentioned,
      websiteReferenced,
      competitorsMentioned: competitors.filter((c) => c.appearedInQueries.includes(query)).map((c) => c.name),
      rankingPosition: 1 + ((seed + i * 5) % 10),
      sentiment,
      trustSignals: targetMentioned ? ['Reviews present', 'Location relevance'] : ['Weak citation trail'],
      source: i % 2 === 0 ? 'Simulated Search Result' : 'Simulated AI Answer'
    };
  });
}

export function generateReportFromResults(
  input: SnapshotInput,
  queryResults: QueryResult[],
  competitorDiscoveries: CompetitorDiscovery[],
  dataMode: 'demo' | 'live' = 'demo'
): ReportData {
  const seed = hash(`${input.businessName}|${input.websiteUrl}|${input.city}|${input.state}|${input.industry}|${input.mainKeyword}`);
  const mentionRate = queryResults.filter((q) => q.businessMentioned).length / Math.max(1, queryResults.length);
  const websiteRate = queryResults.filter((q) => q.websiteReferenced).length / Math.max(1, queryResults.length);
  const competitorPressure = competitorDiscoveries.length
    ? competitorDiscoveries.reduce((a, c) => a + c.mentions, 0) / (competitorDiscoveries.length * 8)
    : 0;
  const reviewSignal = queryResults.filter((q) => q.trustSignals.some((s) => /review|rating|credential|experience/i.test(s))).length / Math.max(1, queryResults.length);
  const localRelevance = queryResults.filter((q) => q.query.toLowerCase().includes(input.city.toLowerCase())).length / Math.max(1, queryResults.length);
  const industryMatch = queryResults.filter((q) => q.query.toLowerCase().includes(input.industry.toLowerCase()) || q.query.toLowerCase().includes(input.mainKeyword.toLowerCase())).length / Math.max(1, queryResults.length);
  const websiteReadiness = ((input.websiteUrl.length + seed) % 100) / 100;

  const categoryScores = {
    'Brand Recognition': norm(Math.round(weights.brandRecognition * (0.25 + mentionRate * 0.75)), weights.brandRecognition),
    'AI Answer Presence': norm(Math.round(weights.aiAnswerPresence * (0.2 + mentionRate * 0.5 + websiteRate * 0.3)), weights.aiAnswerPresence),
    'Local Market Visibility': norm(Math.round(weights.localMarketVisibility * (0.2 + localRelevance * 0.8)), weights.localMarketVisibility),
    'Competitor Positioning': norm(Math.round(weights.competitorPositioning * (1 - competitorPressure * 0.75)), weights.competitorPositioning),
    'Website AI Readiness': norm(Math.round(weights.websiteAiReadiness * (0.3 + websiteReadiness * 0.7)), weights.websiteAiReadiness),
    'Trust / Reputation Signals': norm(Math.round(weights.trustReputationSignals * (0.15 + reviewSignal * 0.55 + industryMatch * 0.3)), weights.trustReputationSignals)
  };

  const { total } = computeScore(categoryScores);
  return {
    input,
    dataMode,
    dataSourceStatus: dataMode === 'live' ? 'Live AI/search data used' : 'Demo mode: simulated data used until APIs are connected',
    score: total,
    label: labelScore(total),
    categoryScores,
    summary: `Competitors were discovered automatically based on AI/search-style queries for your market. ${input.businessName} currently appears in ${Math.round(
      mentionRate * 100
    )}% of analyzed responses in ${input.city}, ${input.state}.`,
    strengths: [
      'Targeted local query coverage can be improved quickly.',
      `Current website citation rate is ${Math.round(websiteRate * 100)}%.`,
      'A structured trust-signal strategy can improve AI recommendation frequency.'
    ],
    weaknesses: [
      'Competitor mentions are still dominant in key buyer-intent prompts.',
      'Ranking consistency across query types is uneven.',
      'Reputation signals are not yet optimized for AI answer engines.'
    ],
    queryResults,
    competitorDiscoveries,
    competitorTable: competitorDiscoveries.map((c) => ({ name: c.name, mentionRate: `${Math.round((c.mentions / Math.max(1, queryResults.length)) * 100)}%`, avgPosition: c.estimatedRank, sentiment: c.estimatedRank < 3 ? 'Positive' : 'Neutral', confidenceScore: c.confidenceScore })),
    missedOpportunities: ['Increase brand mentions in “best in city” prompts.', 'Strengthen website entity signals and service-page relevance.', 'Close competitor gap in comparison and reputation queries.'],
    actionPlan: [
      { phase: 'Days 1–30', actions: ['Add location + service entities with schema.', 'Refine title/meta for service and market terms.', 'Expand trust content with real proof snippets.'] },
      { phase: 'Days 31–60', actions: ['Publish query-targeted authority content.', 'Increase review velocity and response consistency.', 'Build comparison pages aligned to discovered competitors.'] },
      { phase: 'Days 61–90', actions: ['Re-run snapshot and track mention-rate gains.', 'Prioritize prompts where target is currently absent.', 'Activate lead-capture automation for AI-driven traffic.'] }
    ],
    cta: 'Want us to improve this score for you? AI Arsenal Activators can help build your AI visibility, automate lead capture, and position your business to appear in more AI-powered recommendations.'
  };
}

export function generateMockReport(input: SnapshotInput, dataMode: 'demo' | 'live' = 'demo'): ReportData {
  const queries = buildQueries(input);
  const seed = hash(`${input.businessName}|${input.websiteUrl}|${input.city}|${input.state}|${input.industry}|${input.mainKeyword}`);
  const competitorDiscoveries = discoverCompetitors(input, queries, seed);
  const queryResults = buildQueryResults(input, queries, competitorDiscoveries, seed);
  return generateReportFromResults(input, queryResults, competitorDiscoveries, dataMode);
}
