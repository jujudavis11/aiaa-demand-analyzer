import { SnapshotInput } from './types';

export function buildQueries(input: SnapshotInput): string[] {
  return [
    `best ${input.mainKeyword} in ${input.city} ${input.state}`,
    `top ${input.industry} near ${input.city} ${input.state}`,
    `${input.mainKeyword} near me ${input.city}`,
    `recommended ${input.industry} in ${input.city}`,
    `${input.businessName} reviews`,
    `${input.businessName} reputation`,
    `${input.businessName} vs competitors`
  ];
}
