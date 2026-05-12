import { buildQueries } from './prompts';
import { computeScore, weights } from './scoring';
import { ReportData, SnapshotInput } from './types';

export function generateMockReport(input: SnapshotInput): ReportData {
  const competitors = input.competitors?.split(',').map((c) => c.trim()).filter(Boolean) || ['Local Leader Co', 'Prime Choice Group'];
  const queries = buildQueries(input);

  const queryResults = queries.map((query, i) => ({
    query,
    businessMentioned: i % 2 === 0,
    websiteReferenced: i % 3 === 0,
    competitorsMentioned: competitors.slice(0, (i % competitors.length) + 1),
    rankingPosition: Math.min(10, 2 + i),
    sentiment: (i % 3 === 0 ? 'Positive' : i % 3 === 1 ? 'Neutral' : 'Negative') as 'Positive' | 'Neutral' | 'Negative',
    trustSignals: i % 2 === 0 ? ['Review volume', 'Authority mentions'] : ['Basic citations']
  }));

  const categoryScores = {
    'Brand Recognition': Math.round(weights.brandRecognition * 0.58),
    'AI Answer Presence': Math.round(weights.aiAnswerPresence * 0.52),
    'Local Market Visibility': Math.round(weights.localMarketVisibility * 0.6),
    'Competitor Positioning': Math.round(weights.competitorPositioning * 0.5),
    'Website AI Readiness': Math.round(weights.websiteAiReadiness * 0.7),
    'Trust / Reputation Signals': Math.round(weights.trustReputationSignals * 0.65)
  };

  const { total, label } = computeScore(categoryScores);

  return {
    input,
    score: total,
    label,
    categoryScores,
    summary: `Your business is currently underrepresented in AI-generated answers for high-intent local searches. Potential customers using ChatGPT, Perplexity, Gemini, and other answer engines may be seeing competitor names before ${input.businessName}.`,
    strengths: ['Credible website baseline and clear service intent.', 'Positive sentiment appears in review-driven prompts.', 'Opportunity to win more citations with schema and authority mentions.'],
    weaknesses: ['Inconsistent mention coverage in local intent prompts.', 'Competitors appear more often in comparison-style responses.', 'Limited trust signal depth in AI answer summaries.'],
    queryResults,
    competitorTable: competitors.map((name, i) => ({ name, mentionRate: `${70 - i * 12}%`, avgPosition: i + 1, sentiment: i === 0 ? 'Positive' : 'Neutral' })),
    missedOpportunities: ['No consistent top-3 appearance for “best in city” prompts.', 'Insufficient structured reputation signals across indexed profiles.', 'Weak comparative framing versus named local competitors.'],
    actionPlan: [
      { phase: 'Days 1–30', actions: ['Deploy AI-readable service/location pages.', 'Add structured data (Organization, LocalBusiness, FAQ).', 'Standardize NAP and citation consistency.'] },
      { phase: 'Days 31–60', actions: ['Publish authority content answering buying questions.', 'Launch review velocity campaign and testimonial snippets.', 'Improve internal linking to service intent pages.'] },
      { phase: 'Days 61–90', actions: ['Run prompt-level visibility re-audit and compare trendlines.', 'Create competitor-gap pages and proof-backed differentiators.', 'Implement AI lead capture workflows and conversion tracking.'] }
    ],
    cta: 'Want us to improve this score for you? AI Arsenal Activators can help build your AI visibility, automate lead capture, and position your business to appear in more AI-powered recommendations.'
  };
}
