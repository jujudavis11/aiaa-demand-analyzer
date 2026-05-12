export type SnapshotInput = {
  businessName: string;
  websiteUrl: string;
  city: string;
  state: string;
  industry: string;
  mainKeyword: string;
  competitors?: string;
  contactEmail?: string;
};

export type QueryResult = {
  query: string;
  businessMentioned: boolean;
  websiteReferenced: boolean;
  competitorsMentioned: string[];
  rankingPosition: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  trustSignals: string[];
};

export type ReportData = {
  input: SnapshotInput;
  score: number;
  label: string;
  categoryScores: Record<string, number>;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  queryResults: QueryResult[];
  competitorTable: Array<{ name: string; mentionRate: string; avgPosition: number; sentiment: string }>;
  missedOpportunities: string[];
  actionPlan: Array<{ phase: string; actions: string[] }>;
  cta: string;
};
