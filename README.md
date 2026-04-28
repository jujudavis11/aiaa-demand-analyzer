# AIAA Demand Analyzer (Vite + React + Vercel API)

This repository contains a deployable **Vite + React** frontend and a **Vercel serverless backend route** for AI-powered demand letter analysis.

## Project structure

- `package.json`
- `index.html`
- `vite.config.js`
- `src/main.jsx`
- `src/App.jsx`
- `src/index.css`
- `src/components/DemandLetterReviewer.jsx`
- `api/analyze-demand-letter.js`

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Build output is generated in `dist/`.

## Vercel configuration

Set the project to use:

- **Build Command:** `npm run build`
- **Output Directory:** `dist`

The frontend posts uploaded PDFs to:

- `POST /api/analyze-demand-letter`

## Required environment variable

Set this in Vercel (Project Settings → Environment Variables):

- `ANTHROPIC_API_KEY` — API key used by the server-side `/api/analyze-demand-letter` route.

> The browser never sends requests directly to Anthropic/OpenAI. The AI request is made only from the backend route.

## Backend error codes returned by `/api/analyze-demand-letter`

- `INVALID_PDF` → uploaded file is missing/invalid/not a real PDF.
- `MISSING_ENV` → `ANTHROPIC_API_KEY` is not configured.
- `AI_PROVIDER_ERROR` → Anthropic returned an error or malformed response.
- `METHOD_NOT_ALLOWED` → non-POST request.
- `INTERNAL_ERROR` → unexpected backend failure.

The frontend maps these to user-friendly errors, including a dedicated message if the backend route is not found (`404`).
