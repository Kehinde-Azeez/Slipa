 # SLIPA
**AI-powered invoice generation for Nigerian freelancers.**
Generate a professional PDF invoice in under 2 minutes through conversation — no forms, no accounting knowledge required.

---

## Stack
- **Framework** — Next.js 14 (App Router)
- **Language** — TypeScript (strict)
- **Database** — PostgreSQL
- **AI** — OpenAI API (GPT-4o) via `lib/ai`
- **PDF** — Puppeteer with embedded Inter font
- **Auth** — JWT in HttpOnly cookies
- **Styling** — Tailwind CSS + CSS custom properties (`tokens/`)
- **Deploy** — Vercel

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
```
Open `.env.local` and fill in every value. The app will not start without `DATABASE_URL`, `JWT_SECRET`, `BANK_ENCRYPTION_KEY`, and `OPENAI_API_KEY`.

To generate a valid `BANK_ENCRYPTION_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Set up the database
Run migrations in order:
```bash
psql $DATABASE_URL -f migrations/001_create_freelancers.sql
psql $DATABASE_URL -f migrations/002_create_clients.sql
psql $DATABASE_URL -f migrations/003_create_invoices.sql
psql $DATABASE_URL -f migrations/004_create_line_items.sql
psql $DATABASE_URL -f migrations/005_add_updated_at_trigger.sql
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure
```
AGENTS.md                  # AI agent entry point — read this first
.agents/rules/             # Agent rules — loaded on every task
skills/                    # Agent skills — loaded when relevant
workflows/                 # Agent workflows — step-by-step checklists
tokens/                    # CSS design tokens — import tokens/index.css
migrations/                # PostgreSQL migrations — run in order
app/                       # Next.js App Router pages and API routes
components/                # React components
lib/                       # Core logic — ai, db, pdf, auth, validation
```

---

## Architecture Decisions

### Authentication
Login is required. Users register with email and password. JWT is stored in an HttpOnly, Secure, SameSite=Strict cookie. All `/api/*` routes except `/api/auth/*` require a valid JWT.

Rationale: the PRD requires invoice data to be associated with an authenticated user session (§5.4), and the Freelancer entity is explicitly defined as one record per registered user (§6.1). Storing encrypted bank details in an anonymous session is not acceptable.

### Invoice History
No invoice history UI in v1.0. The `invoices` table is written to on every generation (required for the invoice counter and data integrity), but no list or history screen is built. This is a deliberate scope decision — the PRD excludes analytics and dashboards (§2.3), and the entire product is optimised for speed, not record-keeping. History is the foundation for v1.2.

### PDF Generation
Puppeteer with an HTML template. Inter font embedded as base64. PDF generation is async — it does not block the chat response. The download link is polled until ready.

### Bank Account Encryption
AES-256-GCM. Encryption happens in `lib/db` before writing. Decryption happens only in `lib/pdf` at generation time. The key is never logged, never returned in API responses, never exposed to the client.

---

## Open Questions (resolve before building these features)
- Invoice history UI — deferred to v1.2. Table exists; UI does not.
- Email delivery of PDF — optional in v1.0. Scaffold exists in notification-handler skill; activate when email provider is confirmed.

---

## Key Constraints (never violate)
1. Never invent, guess, or pre-fill amounts, bank details, or invoice numbers.
2. Never apply VAT without explicit user confirmation.
3. Never expose bank account numbers in logs, errors, or API responses.
4. All monetary calculations are server-side only.
5. PDF is the only invoice output format in v1.0.
6. Supported currencies: NGN, USD, GBP, EUR only.

---

## Agent Context
This project is built with the Antigravity AI agent. The agent reads `AGENTS.md` on every task. All rules, skills, and workflows are in `.agents/`, `skills/`, and `workflows/`. Do not delete or rename these directories.
