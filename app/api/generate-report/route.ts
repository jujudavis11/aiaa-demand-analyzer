import { NextResponse } from 'next/server';
import { generateMockReport } from '@/lib/mockAuditData';

const hasLiveKeys = Boolean(
  process.env.OPENAI_API_KEY ||
  process.env.PERPLEXITY_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_CSE_API_KEY ||
  process.env.SERPAPI_API_KEY
);

const DATA_MODE: 'demo' | 'live' = hasLiveKeys ? 'live' : 'demo';

export async function POST(req: Request) {
  const input = await req.json();

  if (DATA_MODE === 'live') {
    // Placeholder: call Perplexity API for query-grounded web answers.
    // Placeholder: call OpenAI API for synthesis + sentiment/trust extraction.
    // Placeholder: call Gemini API for cross-model visibility comparison.
    // Placeholder: call Google CSE or SerpAPI for local competitor/result extraction.
    // Placeholder: run website scraping/metadata checks for AI readiness.
  }

  const report = generateMockReport(input, DATA_MODE);
  return NextResponse.json(report);
}
