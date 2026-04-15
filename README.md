<div align="center">

# PocketFlow

**A salary-based personal finance app.**

Track your money. See your future.
Buy the things you want — when you're actually ready.

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

This project came from a very simple problem.

Working, getting paid, trying to be responsible, and still ending up
asking the same question every month:
**why am I not saving as much as I thought I would?**

The salary would come in.
For a moment, everything looked fine.
Then a few days pass, then another week, and somehow the money is
already lower than expected.

Not because of one huge purchase.
Not because of some dramatic mistake.
Just food, small extra expenses, a few normal decisions during the week,
and then that quiet feeling that something is leaking from the budget
without being obvious enough to notice in real time.

That cycle kept repeating.
Paycheck by paycheck.
Month by month.

And the worst part was not even the spending itself.
It was the uncertainty.

It was looking at the remaining money and not being fully sure
what happened.
It was wanting to save, wanting to plan ahead,
wanting to buy something eventually,
but not trusting the math in my head anymore.

That is really where PocketFlow started.

---

### 👻 The invisible spending problem

After a while, the pattern became obvious:
the problem was not always big expenses.
It was the invisible ones.

The kind of spending that feels harmless when it happens.
Food.
Extra small purchases.
Things that do not look serious one by one,
but become serious when they keep repeating.

That is what this app tries to solve.

Not by judging spending.
Not by pretending every small purchase is a bad choice.
But by making the flow of money visible enough
that nothing feels vague anymore.

Because once spending stops being invisible,
it becomes manageable.

---

### 💡 Why this exists

PocketFlow was built around a very human need:
to stop guessing.

To know how much money is actually left.
To know what future dates will look like.
To know whether a goal is realistic or just emotionally exciting.
To know if a purchase is safe,
or if it will quietly mess up the next few weeks.

That is the purpose of this project.

Not to make money feel complicated.
Not to turn budgeting into homework.
Not to impress you with financial language.

Just to make your money easier to understand,
so your decisions feel calmer, clearer, and more honest.

---

### 💡 So, what is PocketFlow?

That's what PocketFlow is.

It's not trying to be a full financial platform.
It's not for investors or accountants or people with complex portfolios.
It's for someone like me — a person who earns a salary, has some bills,
sometimes buys things they shouldn't, and just wants to understand
where their money is going and when they can afford
the things they want.

The whole app is built around a few things I kept wishing
other apps would do.

---

### 💰 Your actual money, right now

The first thing is just showing me my actual money.

Not a graph. Not a summary of last month. Just a number.
How much do I have right now, after everything?
After every expense that already happened.
After every bill that was already deducted.
After every savings transfer.
The real number.

PocketFlow gives you that the moment you open the dashboard.

Your current balance is right there at the top.
Below it, you can see how much you've spent today,
how much you've spent this pay cycle,
and whether you're spending more or less than last cycle.

There's also a spending chart that breaks down
your daily expenses visually.
And an AI-generated weekly tip — a short sentence or two
based on how you've actually been spending.
Not generic advice. Something specific to your numbers.

If you have an AI key configured, the dashboard also shows
a savings forecast.
It projects how much money you'll have in 1 month,
3 months, 6 months, and a year from now.
Three scenarios: optimistic, realistic, and conservative.
The realistic number is always calculated deterministically
from your actual salary and expenses.
No AI guessing on that one.

---

### 📅 The calendar — where it all clicks

The second thing — and the one that made me want to build
this whole app — is the calendar.

I wanted to see my money over time.
Not as a line graph. On an actual calendar.
Where I can see the days, the weeks, the months —
and know what's happening with my money on each one.

Here's what you see:

- 🟢 **Paydays** show up as green bars
- 🔴 **Bills** appear as pink bars on their due dates —
  and they repeat correctly whether they're monthly or bi-weekly
- 🟡 **Transactions** show as dots on days you spent or earned something
- 🟣 **Purchase goals** float as little purple bubbles at the top of
  their target date, showing the item name

You can see at a glance when your next bill is due,
when your next paycheck comes in,
and when you'll be able to afford that thing you've been eyeing.

But the real magic happens when you click on a date.

Click any future date and the detail panel opens on the right.
At the top, there's a **projected balance** card.
It takes your current money — what you actually have right now —
and adds up every paycheck between now and that date,
subtracts every bill, every fixed expense,
every scheduled transaction.
And it gives you a number.

That number is what you'll have on that day.

If it's **green**, you're good.
If it's **red**, you need to slow down.

It completely changed how I think about spending.
Before, I'd buy something and hope for the best.
Now I click on a date two weeks from now and see
if I'll still be okay after the purchase.
If the number turns red, I know to wait.

Click on today or a past date and it just shows
your current balance. No projections.
Just what you actually have. Simple.

You can also add expenses or income to any date
directly from the calendar.
Pick the type, enter the amount, add a note,
select a category from the list, and it saves instantly.
If you add something to a future date,
it's marked as "Scheduled" and won't affect your current
balance until that date arrives.

I spent a lot of time getting that right because early versions
had a bug where scheduling an expense for next week
would immediately deduct it from the balance.
Which defeated the entire purpose.

#### 💵 Payday button

On payday, there's a green **"Receive"** button
right on the calendar day.
Tap it and your salary is logged as an income transaction.
If you already received it, the button goes away
and shows a ✅ **"Received"** badge instead.
Future paydays show a **"Upcoming"** badge.
No duplicate entries.
No confusion about whether you already logged it.

It sounds trivial but before this I'd forget to log my salary
half the time, which threw off my balance calculation.
Having a dedicated button for it on the exact day
made it effortless.

---

### 🎯 Purchase goals — "when can I actually buy this?"

The third thing — and the one I'm probably most proud of —
is purchase goals.

You add something you want to buy.
A laptop. A phone. A trip somewhere. Whatever.
You put in the name and the price.

PocketFlow calculates the **exact payday** when you'll have enough
money to buy it.
Based on your salary. Your fixed expenses.
Your actual spending patterns.
Not a rough estimate.
It counts your real paychecks, subtracts your real expenses,
and lands on an actual payday as the target date.

And it doesn't just tell you the date.
It shows you the goal right on the calendar —
a little purple bubble sitting on the target date
with the item name.

#### ↔️ Drag to adjust

You can grab it and drag it to a later date
if you want more breathing room.
When you do, it recalculates and shows you
the balance you'd have after buying it at the new date.

If you try to drag it to a date that's too soon —
where you'd end up with zero or negative money —
it blocks you.
A modal pops up telling you the earliest possible date
and why you can't go earlier.
No surprise overdrafts.

#### ✅ "Bought it" flow

When the day finally comes and you can afford it,
you hit a button that says **"Bought it."**

The app doesn't just mark it as done though.
A confirmation modal appears with two options:

**"Yes, deduct from my balance"** — creates an expense transaction
for the full price automatically.
Your balance updates. Your calendar updates.
Everything stays in sync.

**"Don't deduct, just mark as bought"** — for when you
already recorded the expense separately,
or paid from a different account.
It just marks the goal as achieved.

Either way, if you linked the goal to a task,
the task updates to "Bought it!" automatically.

I built this whole feature because I remember wanting a MacBook
and having no idea when I could actually buy one.
I'd check my balance, do rough math in my head,
get a number that was probably wrong, and keep waiting.
With purchase goals, I just add the item and forget about it.
The app tells me when. And it's been right every time.

---

### 🤖 AI that actually knows your money

There's also an AI built into the app.

But not the kind that gives you fortune-cookie advice like
"try to save more" or "consider reducing unnecessary expenses."
That's useless.

The AI in PocketFlow knows **everything** about your finances:

- 💰 Your actual balance right now
- 💵 Your salary and how often you get paid
- 📋 Your fixed expenses — each one, with the name, amount, and frequency
- 📅 Any transactions you've scheduled for the future
- 🎯 Your purchase goals and when they're projected to complete
- 📈 Your estimated monthly savings
- 🔮 Your savings projections for the next 12 months
- 🛡️ What your emergency fund should be
  (it calculates 3 months of your expenses as a benchmark)

So when you ask it something like *"can I afford a 400k car?"*
it doesn't give you a generic answer.

It tells you what you have right now.
How much you save per month.
How long it would take.
What your emergency fund should be
and whether you'd still have one after buying it.
Whether it would push back your existing purchase goals.
Real numbers. Your numbers.

I wanted the AI to feel like talking to a friend
who happens to know your bank account.
Someone who would tell you
*"honestly, you can't afford that yet —
but you could in 14 months if you keep this up"*
instead of a robot that says
*"based on general financial guidelines,
it is recommended to..."*

When you have a conversation with it, it remembers context.
It's not a one-off question-answer thing.
You can ask follow-up questions and it keeps track.
Ask "can I afford X?" then follow up with
"what if I wait two more months?" and it understands
what you're referring to.

---

### 📊 Smart savings forecast

The savings forecast deserves its own mention because of
a specific decision I made that I think matters.

When PocketFlow calculates your estimated monthly savings
and projects it forward, it has to decide what counts
as "normal spending."

Here's the problem: if you've only been using the app for
three days and you bought a new phone during that time,
the app would think you buy a phone every three days.
Obviously that's wrong.

So I built in a **60-day threshold**.

The app waits until you have at least 60 days of
transaction history before it starts incorporating your
variable spending into the savings forecast.

Until then, it only uses your salary and fixed expenses
for the projection.
That way, one-time purchases don't make the forecast
think you're broke.

After 60 days, when there's enough data to calculate
a meaningful monthly average, it factors that in too.
The longer you use the app, the more accurate it gets.

The same logic applies to purchase goal calculations.
If you've been tracking for less than 60 days,
the goal timeline is based on salary minus fixed expenses.
No noise from one-time purchases.
Clean numbers.

The forecast shows three scenarios:

| Scenario | How it's calculated |
|---|---|
| **Optimistic** | You cut back on spending, find ways to save more |
| **Realistic** | Based on your actual salary and fixed expenses — no AI guessing |
| **Conservative** | Unexpected costs, lifestyle inflation, irregular expenses |

---

### ✅ Tasks with a savings journey

The task system might seem unrelated to money at first,
but it ties in more than you'd think.

When you create a purchase goal, you can optionally add it
as a task. That task isn't just a regular to-do item.
It has a three-step progress tracker:

| Step | Meaning |
|---|---|
| 🎯 **Planned** | You've set the goal, the app is calculating |
| 💰 **Saving for it** | You're in the process, money is building up |
| 🛍️ **Bought it** | You did it. The money was spent. The goal is complete |

You click through the steps as you go.
Each step has its own icon and color.
It's a small thing, but there's something satisfying about
watching a goal go from "Planned" to "Bought it."
It turns saving money into something tangible
instead of just watching a number go up.

Regular tasks work normally too.
Priorities, due dates, descriptions.
But the goal tasks feel different.
They feel like you're working toward something.

---

### 🔔 Weekly pulse

One more small feature that I find surprisingly useful.

The weekly pulse is a short, AI-generated tip
that shows up on your dashboard.
Based on your actual spending patterns from the past week.
Not generic stuff.

Things like:

> *"Your food spending was 40% higher this week."*

> *"You're on track to save ₱24,000 this month — that's better than last month."*

Quick, specific, and actually useful.
It takes two seconds to read and sometimes that's all you need
to course-correct before the next paycheck.

---

### 🤔 Who is this for?

I want to be honest about who this is for and who it isn't.

If you have a complex financial life — investments,
multiple income streams, business expenses,
international accounts — this probably isn't the right tool.
There are bigger, more comprehensive platforms for that.

But if you're someone who earns a paycheck.
Whether it's your first job or your fifth.
Whether you get paid monthly or every two weeks.
And you just want to stop wondering where your money went.

This might help.

It helped me.
I went from having no idea where my salary disappeared every month
to being able to tell you exactly what my balance will be
on any given day for the next three months.

And I finally bought that MacBook.
On the exact date the app predicted.
With money left over.

That's all PocketFlow does, really.
It gives you clarity about your money.
And sometimes, that's all you need to start making better decisions.

Not because an app told you to.
But because you could finally see clearly enough
to decide for yourself.

And honestly? The biggest change wasn't even a feature.
It was the feeling of opening the app and *knowing*.
Knowing exactly where I stand.
Knowing when I'll have enough.
Knowing that the money I'm spending right now
won't screw me over next month.

Before PocketFlow, money felt like something that
happened *to* me.
Now it feels like something I understand.

That's a small shift.
But it changes everything.

---

If any of that resonated with you —
if you've ever looked at your bank account a week before payday
and wondered how it got that low —
maybe give it a try.

The setup takes about five minutes.
You don't need to connect any bank accounts.
You don't need to import anything.
Just your salary, your bills, and five minutes.

Here's everything you need. 👇

---

## ⚡ Getting started

### What you need installed

| Tool | Version | Where to get it |
|---|---|---|
| **Node.js** | 20 or higher | [nodejs.org](https://nodejs.org) |
| **pnpm** | Latest | `npm install -g pnpm` |
| **PostgreSQL** | 14 or higher | [postgresql.org](https://www.postgresql.org/download/) or use Docker |

If you prefer Docker for the database, this single command
sets everything up:

```bash
docker run -d --name pocketflow-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pocketflow \
  -p 5432:5432 postgres:16
```

---

### 🛠️ Step by step

**1. Clone the repo and install dependencies**

```bash
git clone https://github.com/dexonapi-alt/pocketflow.git
cd pocketflow
pnpm install
```

This installs everything for both the frontend and backend.
It's a monorepo, so one install handles it all.

**2. Create your environment file**

```bash
cp .env.example apps/api/.env
```

Open `apps/api/.env` and fill in your values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pocketflow
JWT_ACCESS_SECRET=any-random-string-here
JWT_REFRESH_SECRET=another-random-string
OPENROUTER_API_KEY=your-openrouter-key
```

A few notes:

> **DATABASE_URL** —
> If you used the Docker command above, the default value works as-is.
> If you have Postgres installed locally,
> adjust the username, password, and database name to match.

> **JWT secrets** —
> These can be any random text.
> They're used to sign login tokens.
> Doesn't matter what they are,
> just make them long and unique.

> **OPENROUTER_API_KEY** —
> This powers all the AI features:
> chat, savings forecast, weekly pulse, and insights.
> You can get a free key at [openrouter.ai](https://openrouter.ai).
>
> The app works fine without this key.
> You'll have the full dashboard, transactions, calendar,
> goals, and tasks.
> You just won't get AI chat, AI tips, or the weekly pulse.
> Everything else works normally.

**3. Set up the database**

```bash
pnpm db:migrate
```

This creates all the tables in your database.
Default spending categories are seeded automatically
on the first run — 10 expense categories and 5 income categories.

If you want to peek at the database visually:

```bash
pnpm db:studio
```

This opens Prisma Studio in your browser —
a visual interface where you can browse and edit data directly.

**4. Start the app**

```bash
pnpm dev
```

This boots both the frontend and the backend at the same time:

| Service | URL |
|---|---|
| 🌐 Frontend | [localhost:3000](http://localhost:3000) |
| ⚡ API | [localhost:4000](http://localhost:4000) |

---

## 🎮 Using the app

1. Open [localhost:3000](http://localhost:3000) in your browser
2. Create an account with your email and password
3. The onboarding wizard appears and asks a few questions:
   - 💵 What's your salary?
   - 🔄 How often do you get paid? (monthly or bi-weekly)
   - 📅 When was your last payday?
   - 💰 How much money do you have right now?
4. After onboarding, the dashboard loads immediately

From there, you can explore everything:

- 💰 Add expenses and income in **Transactions** —
  search, filter, and categorize your history

- 📅 Open the **Calendar** to see your month visually —
  paydays, bills, goals, and your projected balance on any date

- ⚙️ Go to **More** (settings) and add your fixed expenses —
  rent, subscriptions, utilities, whatever recurs monthly or bi-weekly

- 🎯 Create a **Purchase Goal** for something you want —
  the app calculates when you can afford it

- 🤖 Open **AI Chat** and ask anything about your finances —
  it knows your actual balance, bills, goals, and projections

- ✅ Track your savings journey in **Tasks** —
  Planned → Saving for it → Bought it

---

## 📋 Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start frontend and backend together |
| `pnpm build` | Build everything for production |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:generate` | Regenerate Prisma client after schema changes |
| `pnpm db:studio` | Open Prisma Studio (visual database browser) |
| `pnpm --filter @plannerflow/api dev` | Start only the backend |
| `pnpm --filter @plannerflow/web dev` | Start only the frontend |

---

## 🖥️ Tech stack

```
Frontend        Next.js 15 · React 19 · TypeScript · Tailwind CSS v4
                Framer Motion · TanStack Query · shadcn/ui components

Backend         NestJS · Fastify · Prisma ORM · PostgreSQL
                JWT Authentication · bcryptjs

AI              OpenRouter (GPT-4o-mini default, swappable to any model)

Tooling         pnpm workspaces · Turborepo
```

---

## 📁 Project structure

This is a monorepo.
Frontend and backend live in the same repository,
managed by pnpm workspaces and Turborepo.

```
apps/
├── web/          → Next.js frontend (what you see in the browser)
└── api/          → NestJS backend (handles data, auth, AI)

packages/
├── types/        → Shared TypeScript types
└── config/       → Shared configurations (tsconfig, etc.)
```

<details>
<summary>📂 Full directory breakdown</summary>

```
apps/api/src/
├── auth/             Sign in, sign up, JWT token management
├── users/            User profiles
├── onboarding/       Salary setup wizard
├── transactions/     Income, expenses, savings transfers
├── categories/       Spending categories (auto-seeded on startup)
├── budgets/          Monthly budgets
├── fixed-expenses/   Recurring bills (monthly or bi-weekly)
├── goals/            Purchase goal tracking with paycheck-based timeline
├── dashboard/        Balance calculation, charts, cycle stats
├── ai/               Chat, insights, forecast, weekly pulse
├── planner/          Calendar events
├── user-tasks/       Task manager with savings journey
├── subscriptions/    Plan management
├── notifications/    Alerts and reminders
├── prisma/           Database connection and service
└── common/           Shared guards, filters, decorators
```

```
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
│   └── ui/           Design system (button, card, input, badge, etc.)
├── hooks/            API data fetching with TanStack Query
├── lib/              Utilities, API client, auth helpers
├── providers/        React context providers
└── styles/           Global CSS and theme
```

</details>

---

## 💳 Plans

The app has a subscription system built in.
Here's how the tiers work:

| Plan | Price | Transactions | Tasks | AI |
|---|---|---|---|---|
| **Free** | ₱0 | 10/month | 2 | Weekly pulse only |
| **Lite** | ₱99/mo | 50/month | 10 | 5 messages/day |
| **Plus** | ₱249/mo | Unlimited | Unlimited | 50 messages/day + forecast |
| **Pro+** | ₱499/mo | Unlimited | Unlimited | Unlimited + priority support |

---

## 🔧 Troubleshooting

**🔴 Can't connect to database**

Make sure PostgreSQL is running.
If you're using Docker, check that the container is up:

```bash
docker ps
```

Verify that `DATABASE_URL` in `apps/api/.env`
matches your actual database credentials.

**🔴 AI features not working**

The AI requires an OpenRouter API key.
Set `OPENROUTER_API_KEY` in `apps/api/.env`.
Without it, the app still works fine —
AI chat, weekly pulse, and forecasts will just show
fallback messages or empty states.

**🔴 bcrypt module error**

The project uses bcryptjs (pure JavaScript, no native compilation).
If you see errors about bcrypt, run:

```bash
pnpm --filter @plannerflow/api remove bcrypt
pnpm --filter @plannerflow/api add bcryptjs
```

**🔴 Port already in use**

The API runs on port 4000 and the frontend on port 3000.
If something else is using those ports,
find and stop the other process first.

On Windows:
```bash
netstat -ano | findstr :4000
taskkill /PID <pid> /F
```

On Mac/Linux:
```bash
lsof -i :4000
kill -9 <pid>
```

**🔴 Onboarding wizard keeps appearing**

Clear your browser's localStorage.
Open DevTools (F12), go to Application,
then Local Storage, and clear everything
for localhost:3000. Sign in again.

**🔴 Prisma migration fails with EPERM**

This usually means the dev server is locking the database files.
Stop the dev server first, then run the migration:

```bash
# Stop the running dev server (Ctrl+C)
pnpm db:migrate
# Then restart
pnpm dev
```

---

If you read this far — thanks.

I hope it's useful to you,
or at the very least,
I hope it makes you think a little differently
about where your money goes.

Because once you see it clearly, you can't unsee it.

And that's kind of the whole point.

---

<div align="center">

*Built with late nights, cold coffee, and the recurring question:
"wait, where did my money go?"*

</div>
