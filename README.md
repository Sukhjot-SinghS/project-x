# Project X

A modern web application built with **Next.js 16**, **Supabase**, and **Tailwind CSS**. 

Project X is a full-stack platform designed to streamline team collaboration — featuring authentication, real-time data, and a clean responsive UI powered by Framer Motion and Recharts.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Backend / Database**: Supabase (Auth + Postgres)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Language**: TypeScript

---

## Getting Started

### 1. Clone the repo

`ash
git clone https://github.com/Sukhjot-SinghS/project-x.git
cd project-x
`

### 2. Install dependencies

`ash
npm install
`

### 3. Set up environment variables

Copy the example env file and fill in your Supabase credentials:

`ash
cp .env.example .env.local
`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | Base URL of your app (`http://localhost:3000` in dev) |

### 4. Run the development server

`ash
npm run dev
`

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

`
src/
  app/          # Next.js App Router pages and layouts
  components/   # Reusable UI components
  hooks/        # Custom React hooks
  lib/          # Supabase client, utilities
  types/        # TypeScript type definitions
`

---

## Security

- All secrets are stored in .env.local which is **gitignored** and never committed.
- Use .env.example as a reference for required environment variables.
- The SUPABASE_SERVICE_ROLE_KEY is only used server-side and never exposed to the client.

---

## License

Private — All rights reserved.
