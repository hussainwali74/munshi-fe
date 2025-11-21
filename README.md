# Digital Dukan - Online Khata App

A premium, user-friendly Khata and Inventory management app for Pakistani shopkeepers.

## Features
- **Khata (Ledger)**: Manage customer credits (Udhar) and payments.
- **Inventory**: Track stock, low stock alerts, and pricing.
- **Employees**: Manage staff details and attendance.
- **Bilingual**: Designed with Urdu support in mind.
- **Custom Auth**: 
  - **Vendor-Independent**: Uses a custom `users` table in Postgres.
  - **Secure**: Powered by `bcrypt` (hashing) and `jose` (JWT sessions).
  - **Air-Tight**: Database is locked down; only the server can access data.

## Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase/schema.sql` and run it to create the tables and security policies.
4. Go to **Project Settings > API** and copy your `URL` and `anon` key.

### 2. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Locally
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment
This app is ready to be deployed on **Vercel**.
1. Push this code to GitHub.
2. Import the project in Vercel.
3. Add the Environment Variables in Vercel settings.
4. Deploy!
