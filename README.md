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


## HeyGen video generator

This project now includes a basic HeyGen video generation flow.

### Environment variables

Set this on the server (local env / Vercel env settings):

- `HEYGEN_API_KEY` — used only by backend routes.

Do **not** hard-code or expose this key in frontend code.

### Frontend

The app includes a simple form to submit:

- script
- title
- cta
- avatar_id
- voice_id

After submission, the frontend polls the backend until the video is `completed`, `failed`, or times out.

### Backend routes

- `POST /api/heygen-generate`
  - Starts a HeyGen generation request.
  - Expects JSON body: `{ script, title, cta, avatar_id, voice_id }`
  - Returns: `{ job_id }`

- `GET /api/heygen-status?job_id=...`
  - Checks HeyGen status for a submitted job/video.
  - Returns: `{ status, video_url, message }`

### Result display

When completed, the UI shows:

- final video URL
- optional in-page `<video>` preview player
