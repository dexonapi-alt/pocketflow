<div align="center">

# PocketFlow

**Salary-based personal finance for people who want clarity, not guesswork.**

Track your balance, project future cash flow, and see when a purchase is
actually affordable.

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

<!-- TODO: add a screenshot or GIF here -->

## Features

- **Dashboard** — current balance, daily spend, pay-cycle stats, and a spending chart
- **Calendar** — visual timeline of paydays, bills, transactions, and projected balances for any future date
- **Purchase Goals** — calculates the earliest realistic payday you can afford a purchase, shown on the calendar
- **AI Chat & Insights** — ask questions about affordability and timing using your real financial data (requires an OpenRouter key)
- **Savings Forecast** — optimistic, realistic, and conservative projections
- **Tasks** — general to-dos and goal-linked savings journeys (`Planned → Saving for it → Bought it`)
- **Subscriptions** — tiered plans with transaction, task, and AI limits

## Tech Stack

```
Frontend        Next.js 15 · React 19 · TypeScript · Tailwind CSS v4
                Framer Motion · TanStack Query · shadcn/ui

Backend         NestJS · Fastify · Prisma ORM · PostgreSQL
                JWT auth · bcryptjs

AI              OpenRouter (chat, tips, forecasts)

Tooling         pnpm workspaces · Turborepo
```

## Getting Started

### Requirements

| Tool | Version | Install |
|---|---|---|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org) |
| **pnpm** | Latest | `npm install -g pnpm` |
| **PostgreSQL** | 14+ | [postgresql.org](https://www.postgresql.org/download/) or Docker |

<details>
<summary>Quick Postgres via Docker</summary>

```bash
docker run -d --name pocketflow-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=plannerflow \
  -p 5432:5432 postgres:16
```

</details>

### Quick Start

```bash
git clone https://github.com/dexonapi-alt/pocketflow.git
cd pocketflow
pnpm install
```

Copy the env template and edit it:

```bash
# PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Key variables:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Default works with the Docker command above |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Use long random strings |
| `OPENROUTER_API_KEY` | Enables AI features; app works without it |

Run migrations and start:

```bash
pnpm db:migrate
pnpm dev
```

| Service | URL |
|---|---|
| Web app | [localhost:3000](http://localhost:3000) |
| API | [localhost:4000](http://localhost:4000) |

Sign up, complete the onboarding wizard (salary, pay schedule, current balance),
and start adding expenses and goals.

---

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start frontend and backend together |
| `pnpm build` | Production build |
| `pnpm lint` | Lint and type-check |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm --filter @plannerflow/api dev` | Backend only |
| `pnpm --filter @plannerflow/web dev` | Frontend only |

---

## Project Structure

Monorepo managed with pnpm workspaces and Turborepo.

```text
apps/
|-- web/          Next.js frontend
`-- api/          NestJS backend

packages/
|-- types/        Shared TypeScript types
`-- config/       Shared configuration
```

<details>
<summary>Full directory breakdown</summary>

```text
apps/api/src/
|-- auth/             Sign in, sign up, JWT token management
|-- users/            User profiles
|-- onboarding/       Salary setup wizard
|-- transactions/     Income, expenses, savings transfers
|-- categories/       Spending categories
|-- budgets/          Monthly budgets
|-- fixed-expenses/   Recurring bills
|-- goals/            Purchase goal tracking
|-- dashboard/        Balance calculation, charts, cycle stats
|-- ai/               Chat, insights, forecast, weekly pulse
|-- planner/          Calendar events
|-- user-tasks/       Task manager with savings journey
|-- subscriptions/    Plan management
|-- notifications/    Alerts and reminders
|-- prisma/           Database connection and service
`-- common/           Shared guards, filters, decorators
```

```text
apps/web/src/
|-- app/              Next.js app router pages
|-- components/
|   |-- landing/      Landing page sections
|   |-- auth/         Sign in and sign up forms
|   |-- onboarding/   Salary setup wizard UI
|   |-- dashboard/    Dashboard cards, spending chart, forecast
|   |-- transactions/ Transaction list, forms, filters
|   |-- calendar/     Calendar grid, projected balance, goal drag-and-drop
|   |-- task-manager/ Tasks with savings journey progress tracker
|   |-- chatbot/      AI chat interface with conversation history
|   |-- subscription/ Plan selection and comparison
|   |-- more/         Settings, goals, fixed expense management
|   |-- layout/       Sidebar, header, app shell, floating toast
|   |-- shared/       Reusable shared components
|   `-- ui/           Design system components
|-- hooks/            API data fetching with TanStack Query
|-- lib/              Utilities, API client, auth helpers
|-- providers/        React context providers
`-- styles/           Global CSS and theme
```

</details>

---

## Plans

| Plan | Price | Transactions | Tasks | AI |
|---|---|---|---|---|
| **Free** | PHP 0 | 10/month | 2 | Weekly pulse only |
| **Lite** | PHP 99/mo | 50/month | 10 | 5 messages/day |
| **Plus** | PHP 249/mo | Unlimited | Unlimited | 50 messages/day + forecast |
| **Pro+** | PHP 499/mo | Unlimited | Unlimited | Unlimited + priority support |

---

## Troubleshooting

<details>
<summary>Can't connect to the database</summary>

Make sure PostgreSQL is running. If using Docker, check `docker ps`. Verify
`DATABASE_URL` in `.env` matches your credentials.

</details>

<details>
<summary>AI features not working</summary>

Set `OPENROUTER_API_KEY` in `.env`. Without it the app works, but chat, pulse,
and forecasts are disabled.

</details>

<details>
<summary>bcrypt module error</summary>

The project uses `bcryptjs` (pure JS). If you see bcrypt errors:

```bash
pnpm --filter @plannerflow/api remove bcrypt
pnpm --filter @plannerflow/api add bcryptjs
```

</details>

<details>
<summary>Port already in use</summary>

Web runs on 3000, API on 4000.

```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <pid> /F

# macOS / Linux
lsof -i :4000
kill -9 <pid>
```

</details>

<details>
<summary>Onboarding wizard keeps appearing</summary>

Clear browser local storage for `localhost:3000`, then sign in again.

</details>

<details>
<summary>Prisma migration fails with EPERM</summary>

Stop the dev server first, then re-run:

```bash
pnpm db:migrate
pnpm dev
```

</details>

---

<div align="center">

*Built for the recurring question: "wait, where did my money go?"*

</div>
