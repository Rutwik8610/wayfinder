# Wayfinder Frontend

Interactive web frontend for the Tourism & Travel management platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**.

## Features

- **App Router Navigation**: Multi-page routing (`/`, `/explore`, `/plan-trip`, `/live-info`, `/ai-assistant`, `/community`, `/profile`, `/settings`, `/tourism-auth`).
- **Interactive Maps**: Leaflet-powered maps for exploring destinations and real-time tourist spots.
- **AI Assistant**: Conversational travel assistant integration via Vercel AI SDK.
- **Internationalization (i18n)**: English and Hindi localized content with dynamic switching.
- **Theme Support**: Seamless light/dark mode support with persistent user preferences.
- **Authentication**: JWT authentication with protected routes.

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- `pnpm` (or `npm`)

## Getting Started

1. **Environment Configuration**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   # or: npm install
   ```

3. **Run Development Server**:
   ```bash
   pnpm dev
   # or: npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Type Check & Build**:
   ```bash
   pnpm run build
   # or: npm run build
   ```

## Directory Structure

```text
frontend/
├── app/                  # Next.js App Router pages and API routes
├── components/           # Reusable UI & feature components
│   ├── auth/             # Authentication guards & providers
│   ├── live-info/        # Leaflet map components
│   ├── providers/        # Global context providers (settings, theme, i18n)
│   └── ui/               # Base UI primitives (button, etc.)
├── lib/                  # Utilities and session helpers
├── messages/             # Localization catalogs (en.json, hi.json)
└── public/               # Static assets (images, icons)
```
