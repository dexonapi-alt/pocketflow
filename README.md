<div align="center">

# 💸 PocketFlow

**Know what you can spend — before you spend it.**

A salary-based personal finance app that tracks your balance, projects future cash flow,
and tells you when a purchase is actually affordable.

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

Most budgeting apps are great at telling you where your money *went*. PocketFlow is built
for the question you actually ask mid-week: **"Can I buy this right now, or should I wait
until payday?"** It connects your salary schedule, recurring bills, and real spending into
one timeline — so you stop guessing and start knowing.

## ✨ Key Features

- 📊 **Dashboard** — balance, daily spend, pay-cycle stats, and a spending chart at a glance
- 📅 **Calendar projections** — see your projected balance on any future date
- 🎯 **Purchase goals** — find the earliest payday you can safely afford something
- 🤖 **AI chat & insights** — ask about affordability, savings timing, and weekly spending trends
- 🔁 **Recurring expenses** — bills and subscriptions factored into every projection
- ✅ **Tasks** — track savings milestones with a simple `Planned → Saving → Bought` journey
- 📈 **Savings forecast** — optimistic, realistic, and conservative scenarios
- 🔐 **Auth & onboarding** — account creation, salary setup wizard, and subscription tiers

## 🛠️ Tech Stack

```
Frontend        Next.js 15 · React 19 · TypeScript · Tailwind CSS v4
                Framer Motion · TanStack Query · shadcn/ui

Backend         NestJS · Fastify · Prisma ORM · PostgreSQL
                JWT authentication · bcryptjs

AI              OpenRouter integration for chat, tips, and forecasts

Tooling         pnpm workspaces · Turborepo
```

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org) |
| **pnpm** | Latest | `npm install -g pnpm` |
| **PostgreSQL** | 14+ | [postgresql.org](https://www.postgresql.org/download/) or Docker |

Need a quick database? Spin one up with Docker:

```bash
docker run -d --name pocketflow-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=plannerflow \
  -p 5432:5432 postgres:16
```

### 1. Clone & install

```bash
git clone https://github.com/dexonapi-alt/pocketflow.git
cd pocketflow
pnpm install
```

### 2. Configure environment

```bash
# PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Then update `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/plannerflow
JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
API_PORT=4000
WEB_URL=http://localhost:3000
API_URL=http://localhost:4000
```

> **Note:** `OPENROUTER_API_KEY` is optional — the app works fine without it, you just
> won't get AI chat, weekly pulse, or forecast features.

### 3. Set up the database

```bash
pnpm db:migrate
```

### 4. Start the app

```bash
pnpm dev
```

| Service | URL |
|---|---|
| 🌐 Web app | [localhost:3000](http://localhost:3000) |
| ⚡ API | [localhost:4000](http://localhost:4000) |

---

## 📋 Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start frontend and backend together |
| `pnpm build` | Build everything for production |
| `pnpm lint` | Run workspace lint/type checks |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:generate` | Regenerate Prisma client after schema changes |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm --filter @plannerflow/api dev` | Start only the backend |
| `pnpm --filter @plannerflow/web dev` | Start only the frontend |

---

## 🗂️ Project Structure

Monorepo managed with pnpm workspaces and Turborepo.

```text
apps/
├── web/          Next.js frontend
└── api/          NestJS backend

packages/
├── types/        Shared TypeScript types
└── config/       Shared configuration
```

<details>
<summary>Full directory breakdown</summary>

```text
apps/api/src/
├── auth/             Sign in, sign up, JWT token management
├── users/            User profiles
├── onboarding/       Salary setup wizard
├── transactions/     Income, expenses, savings transfers
├── categories/       Spending categories
├── budgets/          Monthly budgets
├── fixed-expenses/   Recurring bills
├── goals/            Purchase goal tracking
├── dashboard/        Balance calculation, charts, cycle stats
├── ai/               Chat, insights, forecast, weekly pulse
├── planner/          Calendar events
├── user-tasks/       Task manager with savings journey
├── subscriptions/    Plan management
├── notifications/    Alerts and reminders
├── prisma/           Database connection and service
└── common/           Shared guards, filters, decorators
```

```text
apps/web/src/
├── app/              Next.js app router pages
├── components/
│   ├── landing/      Landing page sections
│   ├── auth/         Sign in and sign up forms
│   ├── onboarding/   Salary setup wizard UI
│   ├── dashboard/    Dashboard cards, spending chart, forecast
│   ├── transactions/ Transaction list, forms, filters
│   ├── calendar/     Calendar grid, projected balance, goal drag-and-drop
│   ├── task-manager/ Tasks with savings journey progress tracker
│   ├── chatbot/      AI chat interface with conversation history
│   ├── subscription/ Plan selection and comparison
│   ├── more/         Settings, goals, fixed expense management
│   ├── layout/       Sidebar, header, app shell, floating toast
│   ├── shared/       Reusable shared components
│   └── ui/           Design system components
├── hooks/            API data fetching with TanStack Query
├── lib/              Utilities, API client, auth helpers
├── providers/        React context providers
└── styles/           Global CSS and theme
```

</details>

---

## 🧭 Using the App

1. Open [localhost:3000](http://localhost:3000) and create an account.
2. Complete onboarding — enter your salary, pay schedule, last payday, and current balance.
3. Add recurring expenses, transactions, and purchase goals.

From there:

- **Transactions** → log income and expenses with categories and filters
- **Calendar** → inspect projected balances for any date
- **Purchase Goals** → estimate when you can safely buy something
- **AI Chat** → ask questions about affordability, savings, and timing
- **Tasks** → track general work or savings-related milestones
- **More** → manage fixed expenses and settings

---

## 💳 Plans

| Plan | Price | Transactions | Tasks | AI |
|---|---|---|---|---|
| **Free** | PHP 0 | 10/month | 2 | Weekly pulse only |
| **Lite** | PHP 99/mo | 50/month | 10 | 5 messages/day |
| **Plus** | PHP 249/mo | Unlimited | Unlimited | 50 messages/day + forecast |
| **Pro+** | PHP 499/mo | Unlimited | Unlimited | Unlimited + priority support |

---

## 🔧 Troubleshooting

<details>
<summary><strong>Can't connect to the database</strong></summary>

Make sure PostgreSQL is running. If using Docker, check the container is up with `docker ps`.
Verify `DATABASE_URL` in `.env` matches your actual credentials.

</details>

<details>
<summary><strong>AI features are not working</strong></summary>

Set `OPENROUTER_API_KEY` in `.env`. Without it, AI chat, weekly pulse, and forecasts fall back
to empty or disabled states. The rest of the app works normally.

</details>

<details>
<summary><strong>bcrypt module error</strong></summary>

The project uses `bcryptjs` (pure JS, no native compilation). If you see bcrypt errors:

```bash
pnpm --filter @plannerflow/api remove bcrypt
pnpm --filter @plannerflow/api add bcryptjs
```

</details>

<details>
<summary><strong>Port already in use</strong></summary>

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
<summary><strong>Onboarding wizard keeps appearing</strong></summary>

Clear browser local storage for `localhost:3000`, then sign in again.

</details>

<details>
<summary><strong>Prisma migration fails with EPERM</strong></summary>

Stop the dev server first, then run the migration again:

```bash
pnpm db:migrate
pnpm dev
```

</details>

---

<div align="center">

*Built for the recurring question: "wait, can I actually afford this right now?"* 🤔

</div>
