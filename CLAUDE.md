# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

ketoLog — a therapeutic ketogenic diet tracker built with React + Vite + TypeScript, connected to a Supabase backend.

## Commands

- `npm run dev` — start dev server with HMR
- `npm run build` — type-check and production build to `dist/`
- `npm run lint` — ESLint
- `npm run preview` — preview production build locally

## Architecture

- **Frontend**: React 19 + Vite + TypeScript. Single-page dashboard (no routing). All state lives in `App.tsx` using `useState`/`useEffect`. Six stateless components in `src/components/`.
- **Backend**: Supabase (hosted Postgres + REST API). Two tables:
  - `foods` — id, name, unit, fat, protein, net_carbs, calories
  - `daily_logs` — date, servings, logged_at, plus FK to `foods`
- **Styling**: Single `App.css` with CSS custom properties. Dark theme. Fonts: DM Mono + Fraunces (loaded via Google Fonts in `index.html`).
- **Supabase client**: Singleton in `src/supabase.ts`, reads credentials from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars.

## Macro targets

Hardcoded in `src/components/MacroCards.tsx` as the `T` constant and displayed in `ProtocolPanel.tsx`:
Calories: 3,100 kcal · Fat: 275g · Protein: 135g · Net carbs: 20g limit.
