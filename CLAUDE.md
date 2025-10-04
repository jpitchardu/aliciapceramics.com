# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production version (includes linting)
- `pnpm lint` - Run Oxlint for code linting
- `pnpm lint:fix` - Fix auto-fixable lint issues
- `prettier --write .` - Format all code

### Testing

No automated tests are currently configured in this project.

## Architecture Overview

This is a Next.js 15 application for Alicia P Ceramics with a hybrid frontend/backend architecture:

### Frontend (Next.js/React)

- **App Router** structure in `/src/app/`
- **Multi-step commission form** as the primary user flow (`/src/app/commissions/`)
- **Zod schemas** for validation in `/src/models/`
- **Custom design system** with Tailwind CSS v4 and earth-tone palette
- **TypeScript strict mode** with comprehensive type definitions

### Backend (Go APIs)

- **Go endpoints** in `/api/` directory for order processing and SMS
- **Twilio integration** for customer SMS communication
- **Supabase** as PostgreSQL database
- **Upstash QStash** for message queuing

### Key Data Models

- **Order model** (`/src/models/Order.ts`) - Commission orders with Zod validation
- **Piece model** (`/src/models/Piece.ts`) - Ceramic piece types (mugs, tumblers, matcha bowls, etc.)

### Commission Form Flow

The main user journey is a 5-step commission form:

1. Client Details - Contact information collection
2. Add Pieces - Ceramic piece selection with sizes/types
3. Order Details - Timeline and inspiration details
4. Terms & Conditions - Agreement acceptance
5. Order Confirmation - Final review and submission

### State Management

- **React Context** for form state in `/src/app/commissions/_data/`
- **Form validation** with Zod schemas
- **Local state persistence** during form completion

## Development Notes

- Uses **PNPM** as package manager with workspace configuration
- **Oxlint** instead of ESLint for faster linting
- **Lefthook** manages git pre-push hooks (lint + format checks)
- **No test framework** currently configured
- SMS functionality requires Twilio credentials in environment variables
- Database operations use Supabase REST API

## Code Conventions

- **TypeScript strict mode** - All code must be properly typed
- **Zod validation** - Use Zod schemas for all data validation
- **Component organization** - UI components in `/src/ui/`, page-specific components in `_components/` subdirectories
- **Form patterns** - Follow existing multi-step form patterns with context providers
- **SMS integration** - Use established Twilio patterns for customer communication
