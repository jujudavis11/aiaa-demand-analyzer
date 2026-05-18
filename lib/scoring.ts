const weights = {
  brandRecognition: 20,
  aiAnswerPresence: 25,
  localMarketVisibility: 20,
  competitorPositioning: 15,
  websiteAiReadiness: 10,
  trustReputationSignals: 10
};

export function labelScore(score: number): string {
  if (score <= 30) return 'AI Invisible';
  if (score <= 50) return 'Low Visibility';
  if (score <= 70) return 'Emerging Presence';
  if (score <= 85) return 'Strong AI Presence';
  return 'AI Dominant';
}

export function computeScore(categoryScores: Record<string, number>) {
  const total = Math.round(Object.values(categoryScores).reduce((a, b) => a + b, 0));
  return { total, label: labelScore(total), weights };
}

export { weights };
