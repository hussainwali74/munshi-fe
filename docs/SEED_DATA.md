# Seed Data Guide

This project includes demo seed data at:

- `supabase/seed.sql`

## What It Adds

- 1 demo shop owner/user
- 3 customers (with realistic balances)
- 4 inventory items
- 2 employees
- 5 transactions (invoice + payment mix)

Demo login:

- Email: `demo@ezkhata.pk`
- Phone: `0300-1112233`
- Password: `Seed12345`

## How To Run (Supabase SQL Editor)

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Run `supabase/schema.sql` first (if not already applied).
4. Run `supabase/seed.sql`.

`seed.sql` is idempotent for the seeded records (you can run it multiple times).

## Optional: Start Fresh Before Seeding

If you want a clean demo state first, run this in SQL Editor **before** `seed.sql`:

```sql
truncate table
  transactions,
  inventory,
  employees,
  customers
restart identity cascade;
```

Then run `supabase/seed.sql`.
