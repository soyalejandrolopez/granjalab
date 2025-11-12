# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

GranjaLab is a Next.js 14 platform for organic waste management that connects waste producers (markets and restaurants) with recyclers, managers, and entrepreneurs. The application uses Supabase for backend services (authentication, database, storage) and is deployed on Netlify.

## Essential Commands

### Development
```bash
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

### Supabase Setup
```bash
# Generate TypeScript types from Supabase schema (optional)
supabase gen types typescript --project-id PROJECT_ID > src/types/supabase.ts
```

### Deployment
```bash
# Netlify deployment
netlify login
netlify init
netlify deploy --prod

# Or use the provided script
./NETLIFY_DEPLOY.sh
```

## Architecture

### Core Stack
- **Frontend:** Next.js 14 with App Router + TypeScript + Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL with Row Level Security)
- **Deployment:** Netlify with Edge Functions support
- **State Management:** React hooks + Supabase real-time subscriptions

### Authentication & Authorization

The application uses a multi-role authentication system with 4 roles:
- `productor` - Waste producers (default role on signup)
- `reciclador` - Recyclers who collect waste
- `gestor` - Waste managers focused on farms and composting
- `admin` - Platform administrators

**Key Files:**
- `src/middleware.ts` - Route protection and role-based redirects
- `src/lib/supabase/client.ts` - Browser-side Supabase client
- `src/lib/supabase/server.ts` - Server-side Supabase client (uses cookies)

**Important:** The middleware redirects authenticated users trying to access `/login` or `/register` to their role-specific dashboard (`/${rol}`).

### Database Architecture

**Tables:**
- `profiles` - User profiles with role information (linked to auth.users)
- `residuos` - Organic waste records created by producers
- `solicitudes` - Collection requests from recyclers/managers to producers
- `transacciones` - Completed delivery records

**Security:** All tables have Row Level Security (RLS) enabled. Policies ensure:
- Users can only manage their own data
- Producers can CRUD their own waste records
- Recyclers/managers can request waste and manage their requests
- Admins have full access to all data
- All users can view available waste and profiles

**Database Schema:** `supabase/migrations/001_initial_schema.sql`

### App Structure

The application follows Next.js 14 App Router conventions:

```
src/app/
├── (role)/           # Role-specific dashboards
│   ├── productor/    # Producer dashboard
│   ├── reciclador/   # Recycler dashboard
│   ├── gestor/       # Manager dashboard
│   └── admin/        # Admin dashboard
├── login/            # Authentication page
├── register/         # User registration
├── layout.tsx        # Root layout
└── page.tsx          # Landing page
```

Each role page:
1. Uses server-side authentication check
2. Fetches user profile from Supabase
3. Validates role matches the route
4. Renders role-specific dashboard component

### Component Organization

```
src/components/
├── dashboard/        # Role-specific dashboard logic
│   ├── ProductorDashboard.tsx
│   ├── RecicladorDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── (shared dashboard logic)
├── layout/           # Layout components
│   └── Navbar.tsx    # Top navigation bar
└── ui/               # Reusable UI components
    ├── Card.tsx
    ├── StatsCard.tsx
    ├── Table.tsx
    └── Modal.tsx
```

**Pattern:** Dashboard components are client-side (`'use client'`) and handle:
- Data fetching from Supabase
- Real-time updates
- User interactions (CRUD operations)
- Local state management

### Type System

**Key Types** (`src/types/database.types.ts`):
- `UserRole` - Role union type
- `SolicitudStatus` - Request status enum
- `Profile`, `Residuo`, `Solicitud`, `Transaccion` - Database entity types
- `Database` - Simplified Supabase type (uses `any` for flexibility)

**Note:** The project uses `strict: false` in TypeScript for rapid development. Type assertions (`as any`) are used strategically for Supabase queries.

## Development Patterns

### Creating a New Dashboard Feature

1. Add database table/columns in a new migration file
2. Update types in `src/types/database.types.ts`
3. Add RLS policies in the migration
4. Create/update dashboard component in `src/components/dashboard/`
5. Use `createClient()` for client-side Supabase operations
6. Use `createServerSupabaseClient()` for server-side operations

### Authentication Flow

1. User registers via `/register` with role selection
2. Supabase trigger auto-creates profile in `profiles` table
3. Middleware redirects authenticated users to `/${rol}` dashboard
4. Each page validates user role server-side
5. Dashboard components use client for real-time features

### Supabase Client Usage

**Client-side (in components):**
```typescript
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

**Server-side (in pages/server components):**
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';
const supabase = await createServerSupabaseClient();
```

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production (Netlify), set the same variables with production URLs in the Netlify dashboard.

## Important Notes

- The project compiles with TypeScript `strict: false` - this is intentional for rapid MVP development
- All Supabase tables require proper RLS policies - test with different roles
- The `handle_new_user()` trigger automatically creates profiles on signup
- To create an admin user, manually update the `rol` field in Supabase Table Editor
- Middleware runs on all routes except static assets - see `config.matcher` in `middleware.ts`
- Tailwind CSS 4 is used (new syntax with `@tailwindcss/postcss`)

## Configuration Files

- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript settings (strict mode disabled)
- `eslint.config.mjs` - ESLint configuration
- `postcss.config.mjs` - PostCSS with Tailwind 4
- `netlify.toml` - Netlify build configuration

## Additional Documentation

- `README.md` - Project overview and setup instructions
- `SETUP.md` - Detailed configuration steps
- `DEPLOY.md` - Production deployment guide
- `SUPABASE_CONFIG.md` - Supabase-specific configuration
