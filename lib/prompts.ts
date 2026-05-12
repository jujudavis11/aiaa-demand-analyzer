import { SnapshotInput } from './types';

export function buildQueries(input: SnapshotInput): string[] {
  const q = [
    `Who is the best ${input.industry} in ${input.city}, ${input.state}?`,
    `Top ${input.industry} near me in ${input.city}`,
    `Best ${input.mainKeyword} in ${input.city}`,
    `Which company should I hire for ${input.mainKeyword} in ${input.city}?`,
    `${input.businessName} reviews and reputation`,
    `${input.businessName} vs competitors`
  ];

  if (input.industry.toLowerCase().includes('ai') || input.industry.toLowerCase().includes('tech')) {
    q.push(`AI automation companies in ${input.city}`);
  }
  return q;
}
