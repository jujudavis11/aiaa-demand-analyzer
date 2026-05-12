import { CompetitorDiscovery, QueryResult, SnapshotInput } from './types';

type PerplexityMessage = { role: 'system' | 'user'; content: string };

type PerplexityResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  citations?: string[];
};

function normalizeBusinessName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function titleCase(raw: string): string {
  return raw
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join(' ');
}

function estimateSentiment(text: string): QueryResult['sentiment'] {
  const t = text.toLowerCase();
  const positive = ['best', 'top', 'trusted', 'excellent', 'highly rated', 'award'];
  const negative = ['complaint', 'lawsuit', 'bad', 'poor', 'negative', 'scam'];
  const posHits = positive.filter((w) => t.includes(w)).length;
  const negHits = negative.filter((w) => t.includes(w)).length;
  if (negHits > posHits) return 'Negative';
  if (posHits > negHits) return 'Positive';
  return 'Neutral';
}

function extractTrustSignals(text: string): string[] {
  const signals: string[] = [];
  const t = text.toLowerCase();
  if (t.includes('review')) signals.push('Reviews referenced');
  if (t.includes('rating') || t.includes('star')) signals.push('Ratings mentioned');
  if (t.includes('award') || t.includes('certified')) signals.push('Credentials mentioned');
  if (t.includes('years') || t.includes('experience')) signals.push('Experience signals included');
  return signals.length ? signals : ['No strong trust signals detected'];
}

function extractCompetitors(text: string, targetName: string): string[] {
  const pattern = /\b([A-Z][A-Za-z0-9&'.-]+(?:\s+[A-Z][A-Za-z0-9&'.-]+){0,3})\b/g;
  const names = new Map<string, number>();
  const targetNorm = normalizeBusinessName(targetName);
  for (const match of text.matchAll(pattern)) {
    const candidate = match[1].trim();
    if (candidate.length < 4) continue;
    const normalized = normalizeBusinessName(candidate);
    if (!normalized || normalized === targetNorm) continue;
    if (['Who Are The', 'Top Businesses', 'Which Company', 'Based On'].includes(candidate)) continue;
    names.set(titleCase(candidate), (names.get(titleCase(candidate)) || 0) + 1);
  }
  return Array.from(names.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name]) => name);
}

async function queryPerplexity(apiKey: string, query: string): Promise<{ content: string; citations: string[] }> {
  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content:
        'You are an AI visibility analyst. Return concise market-aware answers that include business names, rankings when possible, and citation URLs.'
    },
    { role: 'user', content: query }
  ];

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar',
      messages,
      temperature: 0.1
    })
  });

  if (!response.ok) throw new Error(`Perplexity request failed: ${response.status}`);
  const json = (await response.json()) as PerplexityResponse;
  const content = json.choices?.[0]?.message?.content || '';
  return { content, citations: json.citations || [] };
}

export async function runPerplexityVisibilityAudit(input: SnapshotInput): Promise<{ queryResults: QueryResult[]; competitorDiscoveries: CompetitorDiscovery[] }> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error('PERPLEXITY_API_KEY missing');

  const queries = [
    `Who are the best ${input.mainKeyword} providers in ${input.city}, ${input.state}?`,
    `Top ${input.industry} businesses in ${input.city}, ${input.state}.`,
    `Which ${input.mainKeyword} company should I hire in ${input.city}, ${input.state}?`,
    `${input.businessName} reviews and reputation.`,
    `${input.businessName} compared to competitors in ${input.city}, ${input.state}.`
  ];

  const domain = input.websiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  const targetNorm = normalizeBusinessName(input.businessName);

  const queryResults: QueryResult[] = [];
  const competitorMap = new Map<string, { mentions: number; appearedInQueries: string[]; rankTotal: number; count: number; targetAppeared: number }>();

  for (const [idx, query] of queries.entries()) {
    const { content, citations } = await queryPerplexity(apiKey, query);
    const lower = content.toLowerCase();
    const businessMentioned = lower.includes(targetNorm);
    const websiteReferenced = lower.includes(domain) || citations.some((url) => url.toLowerCase().includes(domain));
    const competitors = extractCompetitors(content, input.businessName);

    competitors.forEach((name, i) => {
      const prev = competitorMap.get(name) || { mentions: 0, appearedInQueries: [], rankTotal: 0, count: 0, targetAppeared: 0 };
      prev.mentions += 1;
      prev.appearedInQueries.push(query);
      prev.rankTotal += i + 1;
      prev.count += 1;
      if (businessMentioned) prev.targetAppeared += 1;
      competitorMap.set(name, prev);
    });

    queryResults.push({
      query,
      businessMentioned,
      websiteReferenced,
      competitorsMentioned: competitors,
      rankingPosition: businessMentioned ? Math.max(1, competitors.length ? competitors.length : 1) : 10,
      sentiment: estimateSentiment(content),
      trustSignals: extractTrustSignals(content),
      source: citations[0] || 'Perplexity Sonar'
    });

    // avoid provider rate limits for quick consecutive calls in some environments
    if (idx < queries.length - 1) await new Promise((r) => setTimeout(r, 150));
  }

  const competitorDiscoveries: CompetitorDiscovery[] = Array.from(competitorMap.entries())
    .map(([name, val]) => ({
      name,
      mentions: val.mentions,
      estimatedRank: Math.max(1, Math.round(val.rankTotal / Math.max(1, val.count))),
      appearedInQueries: Array.from(new Set(val.appearedInQueries)),
      targetBusinessAppeared: val.targetAppeared > 0
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 8);

  return { queryResults, competitorDiscoveries };
}
