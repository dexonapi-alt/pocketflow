<div align="center">

# 💸 PocketFlow

**Your salary hits. Bills come out. Where did the rest go?**

PocketFlow is a personal finance app built for people who earn a paycheck and want to finally *see* where their money goes — and where it's headed.

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 🧠 The idea

I built this because every budgeting app I tried either felt too corporate or assumed I had a finance degree. I just wanted something that answers three questions:

1. **How much money do I actually have right now?**
2. **When can I afford to buy that thing I want?**
3. **Am I okay this month, or should I chill on spending?**

PocketFlow does exactly that — and it has an AI that talks to you like a friend who happens to be good with money.

---

## ✨ What it does

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Real-time balance, spending chart, cycle health, and an AI savings forecast (optimistic, realistic, conservative) |
| 💰 **Transactions** | Log expenses, income, and savings. Search, filter, categorize. Schedule future transactions |
| 📅 **Calendar** | Visual overview of paydays, bills, goals, and scheduled transactions. Click any future date to see your projected balance |
| 🎯 **Purchase Goals** | Add something you want (laptop, phone, etc.) and PocketFlow tells you exactly when you can buy it based on your salary and expenses |
| ✅ **Tasks** | Financial to-dos with a savings journey tracker — *Planned → Saving for it → Bought it!* |
| 🤖 **AI Chat** | Ask anything about your finances. The AI knows your actual balance, bills, goals, and projections — no generic advice |
| 💵 **Salary Receive** | Payday shows up in the calendar. One tap to log your paycheck as income |
| 🔔 **Weekly Pulse** | A quick AI-generated tip each week based on your real spending patterns |

---

## 🖥️ Tech stack

```
Frontend        Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · TanStack Query
Backend         NestJS · Fastify · Prisma ORM · PostgreSQL · JWT Authentication
AI              OpenRouter (GPT-4o-mini default, configurable)
Tooling         pnpm workspaces · Turborepo
```

---

## 📁 Project structure

This is a **monorepo** — frontend and backend live side by side.

```
apps/
├── web/          → Next.js frontend (what you see)
└── api/          → NestJS backend (handles everything)

packages/
├── types/        → Shared TypeScript types
└── config/       → Shared configs
```

<details>
<summary>🔍 Detailed structure</summary>

```
apps/api/src/
├── auth/             Sign in, sign up, JWT tokens
├── users/            User profiles
├── onboarding/       Salary setup wizard
├── transactions/     Income, expenses, savings
├── categories/       Spending categories (auto-seeded)
├── budgets/          Monthly budgets
├── fixed-expenses/   Recurring bills (monthly or bi-weekly)
├── goals/            Purchase goal tracking with timeline
├── dashboard/        Balance, charts, cycle stats
├── ai/               Chat, insights, forecast, weekly pulse
├── planner/          Calendar events
├── user-tasks/       Task manager with savings journey
├── subscriptions/    Plan management
├── notifications/    Alerts and reminders
├── prisma/           Database connection
└── common/           Guards, filters, decorators

apps/web/src/
├── app/              Next.js app router
├── components/
│   ├── landing/      Landing page
│   ├── auth/         Sign in / Sign up
│   ├── onboarding/   Salary setup wizard
│   ├── dashboard/    Dashboard cards and charts
│   ├── transactions/ Transaction list and forms
│   ├── calendar/     Calendar with projected balance
│   ├── task-manager/ Tasks with savings journey UI
│   ├── chatbot/      AI chat interface
│   ├── subscription/ Plan selection
│   ├── more/         Settings, goals, fixed expenses
│   ├── layout/       Sidebar, header, shell
│   ├── shared/       Reusable components
│   └── ui/           Design system (button, card, etc.)
├── hooks/            API data fetching (TanStack Query)
├── lib/              Utilities, API client, auth helpers
├── providers/        React context providers
└── styles/           Global CSS and theme
```

</details>

---

## 🚀 Getting started

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org) |
| **pnpm** | Latest | `npm install -g pnpm` |
| **PostgreSQL** | 14+ | [postgresql.org](https://www.postgresql.org/download/) or Docker ↓ |

**Quick Postgres with Docker:**

```bash
docker run -d --name pocketflow-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pocketflow \
  -p 5432:5432 postgres:16
```

### Setup

**1.** Clone and install

```bash
git clone https://github.com/dexonapi-alt/pocketflow.git
cd pocketflow
pnpm install
```

**2.** Configure environment

```bash
cp .env.example apps/api/.env
```

Open `apps/api/.env` and fill in:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pocketflow
JWT_ACCESS_SECRET=any-random-string
JWT_REFRESH_SECRET=another-random-string
OPENROUTER_API_KEY=your-key-from-openrouter
```

> 💡 **AI is optional.** The app works fine without an OpenRouter key — you just won't get AI chat, forecasts, or weekly tips. Get a free key at [openrouter.ai](https://openrouter.ai).

**3.** Set up the database

```bash
pnpm db:migrate
```

**4.** Run it

```bash
pnpm dev
```

| Service | URL |
|---|---|
| 🌐 Frontend | [localhost:3000](http://localhost:3000) |
| ⚡ API | [localhost:4000](http://localhost:4000) |

---

## 🎮 Using the app

1. Open [localhost:3000](http://localhost:3000) and create an account
2. The **onboarding wizard** asks for your salary, pay frequency, last payday, and current balance
3. That's it — your **dashboard** is ready with your balance, spending chart, and AI tips
4. From there, explore:
   - Add expenses and income in **Transactions**
   - View your month in the **Calendar** — paydays, bills, and projected balance on any date
   - Set a **Purchase Goal** and watch PocketFlow calculate when you can afford it
   - Ask the **AI Chat** anything — it knows your real numbers

---

## 📋 Available commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start frontend + backend |
| `pnpm build` | Build for production |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:studio` | Open Prisma Studio (visual DB browser) |
| `pnpm --filter @plannerflow/api dev` | Start only the backend |
| `pnpm --filter @plannerflow/web dev` | Start only the frontend |

---

## 💳 Subscription tiers

| Plan | Price | Transactions | Tasks | AI |
|---|---|---|---|---|
| **Free** | ₱0 | 10/month | 2 | Weekly pulse only |
| **Lite** | ₱99/mo | 50/month | 10 | 5 messages/day |
| **Plus** | ₱249/mo | Unlimited | Unlimited | 50 messages/day + forecast |
| **Pro+** | ₱499/mo | Unlimited | Unlimited | Unlimited + priority |

---

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| **Can't connect to database** | Make sure PostgreSQL is running. Check `DATABASE_URL` in `apps/api/.env` |
| **AI features not working** | Set `OPENROUTER_API_KEY` in `.env`. The app works without it, but AI features show fallback data |
| **`bcrypt` module error** | Run `pnpm --filter @plannerflow/api remove bcrypt && pnpm --filter @plannerflow/api add bcryptjs` |
| **Port already in use** | Kill whatever's on port 3000 or 4000, then retry |
| **Onboarding keeps showing** | Clear browser localStorage (F12 → Application → Local Storage → Clear) |

---

<div align="center">

Built with late nights and too much coffee ☕

</div>
