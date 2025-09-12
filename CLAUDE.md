# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 website for Alicia P Ceramics with a ceramics commission ordering system. The application uses TypeScript, React 19, Tailwind CSS v4, and Zod for schema validation.

## Commands

**Development:**

```bash
cd aliciapceramics.com
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production (runs oxlint first)
pnpm start        # Start production server
```

**Linting:**

```bash
pnpm lint         # Run oxlint
pnpm lint:fix     # Run oxlint with automatic fixes
```

## Architecture

### Directory Structure

- `src/app/` - Next.js 13+ App Router pages and layouts
- `src/models/` - Zod schemas and TypeScript types for business logic
- `src/ui/` - Reusable UI components and form utilities
- `src/app/commisions/` - Commission ordering flow pages and components
- `src/services/` - API client functions for order processing
- `api/` - Go serverless functions for backend API endpoints

### Key Patterns

**State Management:**

- Uses React Context + useReducer pattern for complex form state
- `orderContext.tsx` manages the commission order state with type-safe actions
- Zod schemas validate data at runtime and provide TypeScript types

**Data Models:**

- `Order.ts` - Commission order with client info, pieces, timeline, and consent
- `Piece.ts` - Ceramic piece types with discriminated unions and size options
- All models use Zod for validation and TypeScript type inference

**Form Architecture:**

- Multi-step commission form with validation at each step
- Context provider pattern for sharing form state across steps
- Form validation tied to Zod schemas with real-time error feedback

**Backend Architecture:**

- Go-based serverless functions in the `api/` directory for Vercel deployment
- `api/order.go` - Handles order creation and database operations
- `api/newMessage.go` - Handles messaging functionality (in progress)
- Uses Supabase as the database backend with REST API integration

### Technology Stack

- **Frontend:** Next.js 15 with App Router and Turbopack, React 19
- **Backend:** Go serverless functions deployed to Vercel
- **Database:** Supabase (PostgreSQL) with REST API
- **Styling:** Tailwind CSS v4 with PostCSS
- **Validation:** Zod for runtime validation and TypeScript types
- **Linting:** oxlint for fast TypeScript/React linting
- **Git Hooks:** Lefthook for pre-push linting and formatting checks
- **Package Manager:** pnpm with workspace configuration

### Path Aliases

- `@/*` maps to `./src/*` for clean imports

### TypeScript Configuration

- Strict mode enabled
- Path aliases configured for `@/` imports
- Next.js plugin for enhanced TypeScript support

### Pre-commit Hooks

The project uses Lefthook to run checks before pushing:

- `pnpm lint` - Runs oxlint to catch code issues
- `pnpm prettier --check .` - Validates code formatting

### API Architecture

The backend uses Go for performance and is structured with:

- Shared types between Go structs and TypeScript Zod schemas
- Supabase integration for customer management and order storage
- PII-safe logging that excludes sensitive information
- Proper error handling with typed error codes
