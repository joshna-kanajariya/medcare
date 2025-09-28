# MedCare Hospital Platform

A modern hospital management starter built with Next.js 15, TypeScript, Prisma, MySQL 8, and Tailwind CSS v4. It ships with an opinionated structure, connection pooling, resilient logging, and production-ready health checks.

## Features

- **Patient Management**: Capture complete patient records and history
- **Appointment Scheduling**: Streamlined booking and follow-up workflows
- **Staff Management**: Provider profiles, availability, and assignments
- **Medical Records**: Secure documentation with audit-friendly patterns
- **Billing & Insurance**: Foundations for claims and revenue integrity
- **Analytics Dashboard**: Real-time telemetry and operational insights

## Highlights

- Next.js 15 App Router with Turbopack, TypeScript, and modern layout primitives
- MySQL 8 connection pooling via `mysql2` plus Prisma's type-safe client
- Healthcare-focused Tailwind CSS v4 design tokens and reusable UI components
- Centralized environment parsing (Zod), logging (Pino), and error normalization
- `/api/health` endpoint reporting raw pool + Prisma latency with degradation signals

## Project Structure

```
src/
  app/
    api/health/route.ts   # Health check endpoint
    globals.css           # Tailwind v4 tokens & globals
    layout.tsx            # Root layout + metadata
    page.tsx              # Marketing landing page
  components/             # Reusable UI building blocks
  hooks/                  # Custom React hooks
  lib/                    # env, logger, prisma, mysql helpers
  types/                  # Shared TypeScript types
prisma/
  schema.prisma           # Data models (hospital, department, patient, appointment)
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+

### Installation

```bash
npm install
```

Copy the environment template and update credentials:

```bash
cp .env.example .env
```

Apply the Prisma schema and generate the client:

```bash
npm run db:push
npm run db:generate
```

Start the development server:

```bash
npm run dev
```

Visit <http://localhost:3000> to explore the application.

## Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | MySQL connection string shared by Prisma and the pooled client. Include query params like `connection_limit` or `pool_timeout` as needed. |
| `DB_POOL_MIN` / `DB_POOL_MAX` | Desired lower/upper bounds for pooled connections inside the Node server. |
| `LOG_LEVEL` | Pino logging level (`info`, `debug`, etc.). |
| `EXTERNAL_SERVICE_BASE_URL` | Optional base URL for downstream integrations. |

## Database Workflow

```bash
# Push schema changes (development)
npm run db:push

# Inspect data via Prisma Studio
npm run db:studio
```

## Logging & Error Handling

- `src/lib/logger.ts` creates a structured Pino logger (pretty output in dev, JSON in prod).
- `src/lib/errors.ts` normalizes thrown errors and surfaces encoded responses.
- `src/lib/env.ts` validates configuration via Zod to fail fast on misconfiguration.

## Health Monitoring

- `GET /api/health` returns aggregated status for the raw MySQL pool and Prisma client.
- Responses include timestamps, latency, and degrade to HTTP 503 when thresholds are exceeded.

## Contributing

Contributions are welcome—please open an issue or pull request to propose enhancements.

## License

This project is licensed under the MIT License.
