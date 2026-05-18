# AAA Visibility Snapshot™ (AI Arsenal Activators)

Next.js + TypeScript MVP for AI visibility audits with deterministic demo mode and Perplexity-powered live mode.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`

## Environment variables

Set these in Vercel: **Project → Settings → Environment Variables**.

### Required for live mode

- `PERPLEXITY_API_KEY`

If `PERPLEXITY_API_KEY` is missing, the API route automatically falls back to deterministic demo mode.

### Optional future providers (placeholders in code)

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_CSE_API_KEY`
- `SERPAPI_API_KEY`

## Vercel setup

- Framework preset: `Next.js`
- Build command: `npm run build`
- Output directory: leave empty (use Next.js default)

## Main flow

1. Submit business details on `/`.
2. Backend route `POST /api/generate-report` runs:
   - live Perplexity query set when `PERPLEXITY_API_KEY` is present.
   - deterministic simulated audit when key is missing or live call fails.
3. Report is shown on `/report` with score, competitor discovery, and data source status.

## Notes

- Live mode is resilient: Perplexity failures are caught and converted to demo-mode output.
- Competitors are auto-discovered from AI/search-style answers; no competitor field is required.
