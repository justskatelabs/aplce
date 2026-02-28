# APLE MVP - Appliance Repair Lead Platform

Two-sided platform connecting appliance owners with qualified repair technicians.

## Local Setup

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

1. **Clone & Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set Up Supabase**
   - Create a Supabase project at https://supabase.com
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and Anon Key
   - Run the migration:
     ```bash
     # Via Supabase Dashboard: SQL Editor → paste content from supabase/migrations/0001_create_tables.sql
     ```
   - Generate TypeScript types:
     ```bash
     npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
     ```

3. **Set Up OpenAI (or Anthropic)**
   - Get an API key from OpenAI/Anthropic
   - Add to `.env.local`:
     ```
     LLM_API_KEY=sk-xxx
     ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

## Project Structure

- `/app` — Next.js 15 App Router pages
- `/components` — Reusable React components
- `/actions` — Server actions for mutations
- `/lib` — Utilities (Supabase, matching, estimate)
- `/supabase/migrations` — Database schema

## Key Features

### Customer Flow
1. Sign up / Log in
2. Visit `/diagnose` to chat with AI diagnostic assistant
3. Get instant repair estimate
4. Submit lead with contact info
5. Matched with best available technician

### Company Flow
1. Sign up / Log in with company role
2. Access `/dashboard` to view assigned leads
3. Accept or reject leads
4. Track metrics and capacity

### Matching Algorithm
Scores companies (0-100%) on:
- Specialization (40%) — Brand & symptom match
- Proximity (20%) — Zip code match
- Response time (15%)
- Rating (15%)
- Load balance (10%)

## Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Import to v0
# 1. Go to v0.app
# 2. Click "+" → "Import from GitHub"
# 3. Select repo
# 4. v0 will preview and deploy

# Or deploy directly:
vercel
```

## Handoff to v0

1. Create GitHub repo: `git remote add origin https://github.com/YOUR_ORG/aple-mvp`
2. Push code: `git push -u origin main`
3. Go to https://v0.app → "+" → "Import from GitHub"
4. Select the repo to import
5. In v0 chat, refine UI:
   - "Modernize diagnostic chat with typing indicators"
   - "Make dashboard responsive with charts"
   - "Add testimonials section to landing page"
6. When ready, click "Publish" to deploy to Vercel or create PR

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
LLM_API_KEY=sk-xxx
```

## Notes

- Use `npm run dev` for local development with hot reload
- All mutations use server actions for security
- RLS policies protect customer & company data
- Streaming chat for responsive UX
- Zod for input validation

For support, check Supabase docs at https://supabase.com/docs or OpenAI at https://platform.openai.com/docs
