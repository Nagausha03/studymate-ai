# StudyMate AI

An AI-powered study companion. Students upload their notes and StudyMate uses AI to summarize them, generate a quiz, build flashcards, and answer questions about the material — turning raw notes into active-recall study tools in seconds.

**Business value:** EdTech. Students spend significant time manually condensing notes and creating study materials. StudyMate automates that process, helping learners retain material faster and study more effectively — with zero setup cost, since it runs entirely on free-tier infrastructure (MongoDB Atlas, Google Gemini API, Vercel).

**Live demo:** https://studymate-ai-xi.vercel.app/
**Repository:** https://github.com/Nagausha03/studymate-ai

---

## Features

- **Authentication** — user registration and login (passwords hashed with bcrypt)
- **Upload notes** — add study material by title and content
- **AI Summary** — condenses notes into key concepts, important points, and quick revision notes
- **AI Quiz** — generates 5 multiple-choice questions with explanations and instant scoring
- **AI Flashcards** — generates 8 flip-to-reveal flashcards for active recall
- **Ask AI Tutor** — chat interface to ask questions about a specific note and get plain-language, pedagogical explanations
- **Graceful AI fallback** — if the AI model is temporarily overloaded, the app generates reasonable fallback study content from the note itself rather than failing outright

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Express (Node.js) |
| Database | MongoDB Atlas |
| AI | Google Gemini API |
| Auth | bcrypt password hashing |
| CI/CD | GitHub Actions |
| Hosting | Vercel |

## Project structure

```
studymate-ai/
├── src/                          # React frontend
│   ├── components/                # UI components (Dashboard, auth, quiz, flashcards, chat, etc.)
│   ├── App.tsx
│   └── index.css
├── server.ts                      # Express API server, AI integration, MongoDB persistence
├── data/                          # Local fallback data (dev use only)
├── vercel.json                    # Vercel deployment configuration
├── .github/workflows/ci-cd.yml    # CI/CD pipeline (lint → build → deploy)
└── package.json
```

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/notes` | List notes for a user |
| POST | `/api/notes` | Create a note |
| PUT | `/api/notes/:id` | Update a note |
| PATCH | `/api/notes/:id/pin` | Toggle pin status |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/api/ai-results/:noteId` | Get saved AI results for a note |
| POST | `/api/ai/summary` | Generate an AI summary |
| POST | `/api/ai/quiz` | Generate an AI quiz |
| POST | `/api/ai/flashcards` | Generate AI flashcards |
| POST | `/api/ai/chat` | Ask the AI tutor a question |

## Running locally

1. Install dependencies:
   ```
   npm install
   ```

2. Create a free MongoDB database via [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register). Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) so both local development and Vercel can connect.

3. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

4. Create a `.env` file in the project root:
   ```
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. Run the dev server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## CI/CD pipeline

Every push to `main` triggers an automated GitHub Actions workflow (`.github/workflows/ci-cd.yml`) with two jobs:

1. **Lint & Build** — installs dependencies, type-checks the codebase (`tsc --noEmit`), and builds the frontend to catch errors before anything is deployed.
2. **Deploy to Vercel** — runs only if Lint & Build passes; uses the Vercel CLI to deploy the app to production automatically.

### One-time setup used to enable this pipeline

1. Linked the project locally with `vercel link` to obtain the Org ID and Project ID.
2. Generated a Vercel access token from [vercel.com/account/tokens](https://vercel.com/account/tokens).
3. Added three repository secrets under **GitHub → Settings → Secrets and variables → Actions**:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
4. Added `MONGODB_URI` and `GEMINI_API_KEY` as environment variables directly in the Vercel project settings (used at runtime by the deployed app).

## Deployment architecture

- The **frontend** is built as static assets (`vite build`) and served directly by Vercel's CDN for speed.
- The **backend** (`server.ts`) runs as a single Vercel serverless function.
- `vercel.json` routes requests: anything under `/api/*` goes to the Express function; everything else is served as a static file, with a fallback to `index.html` for client-side routing.
- **MongoDB Atlas** is used for persistent storage rather than a local file, since serverless functions don't have a persistent writable filesystem — data must survive between separate, stateless function invocations.

## Design notes / trade-offs

- **No email verification** on registration — a production version would add email confirmation and password reset flows.
- **No automated tests yet** — a production version would add unit/integration tests for the API routes and end-to-end tests for the core study flows (upload → summarize → quiz → flashcards → chat).
- **Single MongoDB collection** (`appdata`) holding all users/notes/AI results as one document — fine at small scale for a demo; a production version would use separate collections with proper indexing as usage grows.
- **AI fallback content**: if Gemini is temporarily unavailable, the app still returns usable (if generic) study content derived from the note text, rather than showing an error — prioritizing a working user experience over a hard failure.

## AI tools used in this project
Built with Google AI Studio (Gemini) for scaffolding, UI, and backend logic, with additional AI assistance for deployment configuration.

The finished product's core learning features (AI Summary, Quiz, Flashcards, and Ask AI Tutor) are themselves powered live by the Google Gemini API — fulfilling the assessment's goal of building a genuinely AI-powered application.