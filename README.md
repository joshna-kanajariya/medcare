# MedCare - Hospital Management System

A modern hospital management application built with Next.js 15, TypeScript, Prisma, and MySQL.

## Features

- **Patient Management**: Complete patient records and history
- **Appointment Scheduling**: Efficient booking and management system
- **Staff Management**: Healthcare provider profiles and scheduling
- **Medical Records**: Secure and comprehensive medical documentation
- **Billing & Insurance**: Integrated billing and insurance processing
- **Analytics Dashboard**: Real-time insights and reporting

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes with type-safe operations
- **Database**: MySQL 8.0+ with Prisma ORM
- **Authentication**: NextAuth.js with role-based access control
- **UI Components**: Custom healthcare-optimized design system

## Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm/yarn/pnpm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                # Utilities and configurations
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── styles/             # Global styles and Tailwind config
```

## API Endpoints

- `GET /api/health` - Application health check
- `GET /api/db-health` - Database connectivity check

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.