export type SnapshotInput = {
  businessName: string;
  websiteUrl: string;
  city: string;
  state: string;
  industry: string;
  mainKeyword: string;
  contactEmail?: string;
  evidenceEntries?: Array<{ platform: string; prompt: string; response: string }>;
};

export type QueryResult = {
  query: string;
  businessMentioned: boolean;
  websiteReferenced: boolean;
  competitorsMentioned: string[];
  rankingPosition: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  trustSignals: string[];
  source: string;
};

export type CompetitorDiscovery = {
  name: string;
  mentions: number;
  estimatedRank: number;
  appearedInQueries: string[];
  targetBusinessAppeared: boolean;
  confidenceScore: number;
  confidenceReasons: string[];
  locationMatch: boolean;
  serviceMatch: boolean;
  websiteKeywordOverlap: number;
  directoryConsistency: number;
};

export type ReportData = {
  input: SnapshotInput;
  dataMode: 'demo' | 'live' | 'manual';
  dataSourceStatus: string;
  score: number;
  label: string;
  categoryScores: Record<string, number>;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  queryResults: QueryResult[];
  competitorDiscoveries: CompetitorDiscovery[];
  competitorTable: Array<{ name: string; mentionRate: string; avgPosition: number; sentiment: string; confidenceScore: number }>;
  missedOpportunities: string[];
  actionPlan: Array<{ phase: string; actions: string[] }>;
  cta: string;
};
