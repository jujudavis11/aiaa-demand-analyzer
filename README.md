# AIAA Demand Analyzer (Vite + React)

This repository is now configured as a deployable **Vite + React** application for GitHub + Vercel.

## Project structure

- `package.json`
- `index.html`
- `vite.config.js`
- `src/main.jsx`
- `src/App.jsx`
- `src/index.css`
- `src/components/DemandLetterReviewer.jsx`

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

## API key safety

The frontend does **not** contain any hardcoded API keys. The analyzer calls a backend endpoint:

- `POST /api/analyze-demand-letter`

For production on Vercel, implement this endpoint as a serverless function and keep provider keys in Vercel Environment Variables.
