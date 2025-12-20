
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS (Custom Auth Table)
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password_hash text not null,
  full_name text,
  business_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CUSTOMERS (Khata)
create table if not exists customers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  phone text,
  cnic text,
  address text,
  balance numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRANSACTIONS (Khata Entries)
create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete cascade not null,
  amount numeric not null,
  type text not null check (type in ('credit', 'debit')),
  description text,
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVENTORY (Items)
create table if not exists inventory (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  category text,
  quantity numeric default 0,
  unit text default 'pcs',
  cost_price numeric,
  selling_price numeric,
  low_stock_threshold numeric default 5,
  image_url text,
  size text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EMPLOYEES
create table if not exists employees (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  role text,
  phone text,
  salary numeric,
  join_date date default current_date,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MIGRATION: Add missing columns if table exists (Idempotent)
do $$
begin
    -- Customers columns
    if not exists (select 1 from information_schema.columns where table_name = 'customers' and column_name = 'cnic') then
        alter table customers add column cnic text;
    end if;

    -- Inventory columns
    if not exists (select 1 from information_schema.columns where table_name = 'inventory' and column_name = 'image_url') then
        alter table inventory add column image_url text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'inventory' and column_name = 'size') then
        alter table inventory add column size text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'inventory' and column_name = 'color') then
        alter table inventory add column color text;
    end if;

    -- Users columns (Shop Details)
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'shop_address') then
        alter table users add column shop_address text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'shop_phone') then
        alter table users add column shop_phone text;
    end if;

    -- Transactions columns (Item Details)
    if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'items') then
        alter table transactions add column items jsonb; -- Stores list of items bought e.g. [{"name": "Pipe", "price": 100, "qty": 2}]
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'bill_amount') then
        alter table transactions add column bill_amount numeric; -- Total bill before payment
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'paid_amount') then
        alter table transactions add column paid_amount numeric; -- Amount paid at time of transaction
    end if;

    -- Employees columns (Status and Join Date)
    -- Rename joined_at to join_date if it exists
    if exists (select 1 from information_schema.columns where table_name = 'employees' and column_name = 'joined_at') then
        alter table employees rename column joined_at to join_date;
    end if;
    -- Add status column if it doesn't exist
    if not exists (select 1 from information_schema.columns where table_name = 'employees' and column_name = 'status') then
        alter table employees add column status text default 'active';
    end if;
end $$;

-- MIGRATION: Fix Foreign Key Relationships
-- Because tables might have been created with the old schema (referencing profiles/auth.users),
-- we need to explicitly update the Foreign Keys to point to our new 'users' table.
do $$
begin
    -- CUSTOMERS
    -- Drop old FK if it exists (assuming standard naming or just try to drop)
    begin
        alter table customers drop constraint if exists customers_user_id_fkey;
    exception when others then null; end;
    
    -- Add new FK to users(id)
    -- Note: This might fail if you have existing data in customers that doesn't match any ID in the new 'users' table.
    -- If so, you might need to truncate the tables first: TRUNCATE customers, inventory, transactions, employees CASCADE;
    alter table customers add constraint customers_user_id_fkey foreign key (user_id) references users(id) on delete cascade;

    -- TRANSACTIONS
    begin
        alter table transactions drop constraint if exists transactions_user_id_fkey;
    exception when others then null; end;
    alter table transactions add constraint transactions_user_id_fkey foreign key (user_id) references users(id) on delete cascade;

    -- INVENTORY
    begin
        alter table inventory drop constraint if exists inventory_user_id_fkey;
    exception when others then null; end;
    alter table inventory add constraint inventory_user_id_fkey foreign key (user_id) references users(id) on delete cascade;

    -- EMPLOYEES
    begin
        alter table employees drop constraint if exists employees_user_id_fkey;
    exception when others then null; end;
    alter table employees add constraint employees_user_id_fkey foreign key (user_id) references users(id) on delete cascade;

exception when others then
    raise notice 'Could not update foreign keys. You might need to clear existing data if user IDs do not match.';
end $$;

-- RLS POLICIES
-- We drop existing policies to avoid "policy already exists" errors before recreating them.
alter table users enable row level security;
alter table customers enable row level security;
alter table transactions enable row level security;
alter table inventory enable row level security;
alter table employees enable row level security;

drop policy if exists "No public access" on users;
drop policy if exists "No public access" on customers;
drop policy if exists "No public access" on transactions;
drop policy if exists "No public access" on inventory;
drop policy if exists "No public access" on employees;

create policy "No public access" on users for all using (false);
create policy "No public access" on customers for all using (false);
create policy "No public access" on transactions for all using (false);
create policy "No public access" on inventory for all using (false);
create policy "No public access" on employees for all using (false);

-- HELPER FUNCTIONS
-- Function to update customer balance atomically
create or replace function update_customer_balance(p_customer_id uuid, p_amount numeric)
returns void
language plpgsql
as $$
begin
  update customers
  set balance = balance + p_amount
  where id = p_customer_id;
end;
$$;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT UNIQUE;

-- CUSTOM TRANSLATIONS
create table if not exists custom_translations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  key text not null,
  lang text not null,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, key, lang)
);

alter table custom_translations enable row level security;
create policy "No public access" on custom_translations for all using (false);