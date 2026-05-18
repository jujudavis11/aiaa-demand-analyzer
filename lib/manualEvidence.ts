import { CompetitorDiscovery, QueryResult, SnapshotInput } from './types';

type EvidenceInput = { platform: string; prompt: string; response: string };

const STOPWORDS = new Set(['The', 'And', 'Best', 'Top', 'Near', 'In', 'For', 'With', 'From', 'Your', 'This', 'That']);

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

function titleCase(s: string) {
  return s.toLowerCase().split(' ').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

function extractBusinessNames(text: string, targetName: string): string[] {
  const targetNorm = normalize(targetName);
  const matches = text.match(/\b[A-Z][A-Za-z0-9&'.-]+(?:\s+[A-Z][A-Za-z0-9&'.-]+){0,3}\b/g) || [];
  const out = new Set<string>();
  for (const raw of matches) {
    const t = raw.trim();
    if (t.length < 4) continue;
    if (t.split(' ').every((w) => STOPWORDS.has(w))) continue;
    if (normalize(t) === targetNorm) continue;
    out.add(titleCase(t));
  }
  return Array.from(out);
}

function sentiment(response: string): QueryResult['sentiment'] {
  const t = response.toLowerCase();
  const pos = ['best', 'top', 'recommended', 'trusted', 'great'];
  const neg = ['bad', 'poor', 'complaint', 'lawsuit', 'negative'];
  const p = pos.filter((w) => t.includes(w)).length;
  const n = neg.filter((w) => t.includes(w)).length;
  if (n > p) return 'Negative';
  if (p > n) return 'Positive';
  return 'Neutral';
}

export function buildResultsFromManualEvidence(input: SnapshotInput) {
  const evidence = input.evidenceEntries || [];
  const domain = input.websiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  const targetNorm = normalize(input.businessName);

  const queryResults: QueryResult[] = evidence
    .filter((e) => e.response.trim())
    .map((e) => {
      const responseNorm = normalize(e.response);
      const businessMentioned = responseNorm.includes(targetNorm);
      const websiteReferenced = responseNorm.includes(domain);
      const competitors = extractBusinessNames(e.response, input.businessName);
      return {
        query: e.prompt || `${e.platform} evidence`,
        businessMentioned,
        websiteReferenced,
        competitorsMentioned: competitors,
        rankingPosition: businessMentioned ? 3 : 10,
        sentiment: sentiment(e.response),
        trustSignals: ['Manual evidence reviewed'],
        source: e.platform
      };
    });

  const compMap = new Map<string, CompetitorDiscovery>();
  queryResults.forEach((qr) => {
    qr.competitorsMentioned.forEach((name, i) => {
      const prev = compMap.get(name) || {
        name,
        mentions: 0,
        estimatedRank: 0,
        appearedInQueries: [],
        targetBusinessAppeared: false,
        confidenceScore: 0,
        confidenceReasons: [],
        locationMatch: false,
        serviceMatch: false,
        websiteKeywordOverlap: 0,
        directoryConsistency: 0
      };
      prev.mentions += 1;
      prev.estimatedRank += i + 1;
      prev.appearedInQueries.push(qr.query);
      prev.targetBusinessAppeared = prev.targetBusinessAppeared || qr.businessMentioned;
      const loc = normalize(qr.query + ' ' + (evidence.find((e) => (e.prompt || `${e.platform} evidence`) === qr.query)?.response || '')).includes(normalize(input.city));
      const service = normalize(qr.query).includes(normalize(input.mainKeyword)) || normalize(qr.query).includes(normalize(input.industry));
      prev.locationMatch = prev.locationMatch || loc;
      prev.serviceMatch = prev.serviceMatch || service;
      prev.directoryConsistency = /yelp|google|bbb|angi|healthgrades/i.test(qr.query) ? 1 : prev.directoryConsistency;
      prev.confidenceScore = Math.min(100, 35 + (prev.locationMatch ? 25 : 0) + (prev.serviceMatch ? 25 : 0) + (prev.mentions * 5) + (prev.directoryConsistency * 10));
      prev.confidenceReasons = [
        prev.locationMatch ? 'Geographic proximity matched' : 'Location match weak',
        prev.serviceMatch ? 'Service/category match found' : 'Service/category match weak'
      ];
      compMap.set(name, prev);
    });
  });

  const competitorDiscoveries = Array.from(compMap.values()).map((c) => ({
    ...c,
    estimatedRank: Math.max(1, Math.round(c.estimatedRank / Math.max(1, c.mentions))),
    appearedInQueries: Array.from(new Set(c.appearedInQueries))
  }));

  return { queryResults, competitorDiscoveries };
}
