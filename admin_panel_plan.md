# Admin Panel Implementation Plan

## 1. Objective
Build an admin panel where platform admins can:
- See all businesses/companies.
- View business metrics (starting with inventory and core operational counts).
- Manage users within each business (create, update, remove).
- Change/reset business user passwords safely.

## 2. Current Codebase Snapshot
- Framework: Next.js App Router with Server Actions.
- Auth: custom JWT cookie session (`src/lib/auth.ts`), custom `users` table login (`src/app/login/actions.ts`).
- Data tenancy: feature tables are scoped by `user_id = session.userId` (inventory, khata, employees, billing, dashboard actions).
- Database: Supabase Postgres schema in `supabase/schema.sql`.
- No dedicated admin routes or admin role checks currently.

## 3. Scope
### In scope (MVP)
- Platform admin role and route protection.
- Admin list of businesses (mapped from current `users` business owners).
- Per-business metrics summary.
- CRUD business users under a business.
- Password reset/change flow for business users.
- Audit logging for admin actions.

### Out of scope (MVP)
- Complex analytics dashboards (trend charts, cohort analytics).
- Self-service business billing/subscription management.
- Fine-grained per-field permissions beyond role-based checks.

## 4. Data Model Changes (Supabase)
File: `supabase/schema.sql`

1. Extend `users`:
- Add `is_platform_admin boolean default false not null`.

2. Add `business_users` table:
- `id uuid pk`
- `business_owner_user_id uuid not null references users(id) on delete cascade`
- `full_name text`
- `email text unique`
- `phone_number text unique`
- `password_hash text not null`
- `role text not null` (suggested enum-like values: `business_admin`, `business_staff`, `read_only`)
- `status text not null default 'active'` (`active`, `disabled`)
- timestamps

3. Add `admin_audit_logs` table:
- `id uuid pk`
- `admin_user_id uuid not null references users(id)`
- `action text not null`
- `target_business_user_id uuid null references business_users(id)`
- `target_business_owner_user_id uuid null references users(id)`
- `metadata jsonb`
- `created_at timestamptz default now()`

## 5. Auth and Session Changes
Files: `src/lib/auth.ts`, `src/app/login/actions.ts`, `src/middleware.ts`

1. Session payload expansion:
- Keep `userId`, add:
  - `scopeUserId` (business owner id used for tenant-scoped data reads/writes)
  - `actorType` (`owner` or `business_user`)
  - `role`
  - `isPlatformAdmin`

2. Login flow:
- Support login against both:
  - `users` (owner/platform admin)
  - `business_users` (sub-users)
- For business users, set `scopeUserId = business_owner_user_id`.

3. Middleware:
- Protect `/admin` paths to `isPlatformAdmin === true`.
- Keep existing auth guard behavior for non-admin protected pages.

## 6. Tenant Scoping Refactor
Files:
- `src/app/inventory/actions.ts`
- `src/app/khata/actions.ts`
- `src/app/billing/actions.ts`
- `src/app/employees/actions.ts`
- `src/app/dashboard/search-actions.ts`
- `src/app/settings/actions.ts`

Action:
- Replace direct tenant filtering from `session.userId` to `session.scopeUserId` for business-scoped entities.
- This enables owner and business users to operate in the same tenant data boundary.

## 7. Admin Routes and Features
New route tree under `src/app/admin/`:

1. `/admin` (Businesses list)
- Columns: business name, owner name, email/phone, created date.
- Metrics per business:
  - Inventory items count
  - Employees count
  - Customers count
  - Recent transactions count (e.g., last 30 days)

2. `/admin/businesses/[id]` (Business detail)
- Business profile card.
- Metrics cards.
- Business users table with actions:
  - Create user
  - Edit user role/status/profile
  - Remove/disable user
  - Reset/change password

3. Server actions for admin:
- `getBusinesses`
- `getBusinessMetrics`
- `getBusinessUsers`
- `createBusinessUser`
- `updateBusinessUser`
- `deleteOrDisableBusinessUser`
- `resetBusinessUserPassword`

## 8. UI Integration
Files: `src/components/Sidebar.tsx`, `src/components/DashboardLayout.tsx`

- Add Admin nav item only for platform admins.
- Reuse existing styling and language context patterns.
- Keep UI simple and consistent with current component approach (server actions + client pages).

## 9. Security and Safety Rules
- Never store plain passwords; always hash with `bcrypt-ts`.
- Admin password reset should be explicit action with audit trail.
- Validate role transitions server-side (do not trust client role fields).
- Enforce admin checks in every admin server action (middleware is not enough).
- Log all destructive actions (`delete`, `disable`, password reset).

## 10. Testing Plan
1. Unit tests:
- Auth/session payload parsing and guards.
- Permission checks for admin actions.

2. Integration tests:
- Admin can list businesses and fetch metrics.
- Non-admin blocked from `/admin` and admin actions.
- Business user CRUD and password reset behavior.

3. Regression tests:
- Existing owner flows (inventory/khata/employees/billing) still work with `scopeUserId`.

## 11. Delivery Phases
1. Phase 1: DB schema + auth/session updates.
2. Phase 2: Tenant scoping refactor in existing actions.
3. Phase 3: Admin routes + business metrics list/detail.
4. Phase 4: Business user CRUD + password reset + audit logs.
5. Phase 5: Tests, polish, and hardening.

## 12. MVP Acceptance Criteria
- Platform admin can open `/admin` and see all businesses with metrics.
- Platform admin can open one business and CRUD business users.
- Platform admin can reset/change a business user password.
- Non-admin users cannot access admin pages or admin actions.
- Existing business flows remain functional for non-admin users.
