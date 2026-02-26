# Gamma Guardian AI

Gamma Guardian AI is a clinical decision-support web application for Gamma Knife workflows. It provides AI-assisted imaging review, treatment planning support, risk analysis, and report generation with transparency and clinician-in-the-loop controls.

## Core features

- Dashboard with patient status, AI insights, planning timeline, and KPI cards
- Patient image analysis with:
  - Layer toggles for GTV/CTV/OAR
  - Interactive contour editing with audit logging
  - 2D and 3D visualization modes
- Planning assistant with:
  - Dose/collimator/fraction controls
  - Real-time OAR dose calculations
  - DVH visualization and plan quality metrics (CI/SI)
  - AI risk assessment via Supabase Edge Function
- AI Advisor chat (streaming responses)
- AI report generation (streaming markdown preview, PDF/print actions)
- Authentication and protected routes
- Audit logging for key planning/segmentation/report events

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui + Radix UI
- Framer Motion
- React Router
- TanStack Query
- Supabase (auth + edge functions)
- Vitest + Testing Library

## Project structure

- Frontend app: `src/`
- UI components: `src/components/`
- Feature pages: `src/pages/`
- Domain logic: `src/lib/`
- Supabase edge functions: `supabase/functions/`

## Prerequisites

- Node.js 18+
- npm 9+

## Local development

1. Install dependencies:

	npm install

2. Start the development server:

	npm run dev

3. Open in browser:

	http://localhost:8080

## Environment variables

Create a `.env` file (for frontend values) as needed:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

For Supabase edge functions, configure in your Supabase environment:

- `AI_GATEWAY_API_KEY`
- `AI_GATEWAY_URL` (example: `https://ai.gateway.example.com/v1/chat/completions`)

## Available scripts

- `npm run dev` – start development server
- `npm run build` – production build
- `npm run build:dev` – development-mode build
- `npm run preview` – preview production build
- `npm run lint` – run ESLint
- `npm run test` – run tests once
- `npm run test:watch` – run tests in watch mode

## Notes

- The application contains demo/mock data for UI and workflow simulation.
- AI outputs are designed as decision support and must be clinically reviewed before use.
