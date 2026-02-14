# 🏪 Digital Dukan - Online Khata App

A premium, user-friendly Khata and Inventory management application designed specifically for Pakistani shopkeepers. Built with a focus on speed, security, and ease of use.

## 🚀 Key Features

-   **📖 Khata (Ledger)**: Effortlessly manage customer credits (Udhar) and payments.
-   **📦 Inventory Management**: Track stock levels in real-time with low-stock alerts and smart pricing.
-   **👥 Employee Management**: Manage staff details, attendance, and payroll conveniently.
-   **🌍 Bilingual Support**: Native Urdu and English support for better accessibility.
-   **🛡️ Secure Authentication**:
    -   **Vendor-Independent**: Custom authentication using a standard `users` table in Postgres.
    -   **JWT Sessions**: Secure session management powered by `bcrypt` and `jose`.
    -   **Server-Side Security**: Database access is restricted to the server-side only.

## 🛠️ Technology Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Database & Auth**: [Supabase](https://supabase.com/) (Postgres)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Deployment**: Optimized for [Cloudflare Pages](https://pages.cloudflare.com/) via [OpenNext](https://open-next.js.org/)

## 📂 Project Structure

```text
munshi-fe/
├── src/
│   ├── app/           # Next.js App Router (Routes & Server Actions)
│   ├── components/    # Reusable UI components (Modals, Sidebar, etc.)
│   ├── context/       # React Context providers (Auth, Theme, Language)
│   ├── lib/           # Core logic (Supabase client, S3 utilities)
│   ├── utils/         # Helper functions
│   └── middleware.ts  # Route protection and session management
├── supabase/          # Database schemas and migration files
├── public/            # Static assets
└── docs/              # Additional project documentation
```

## ⚙️ Setup Instructions

### 1. Database Setup (Supabase)

1.  Create a new project on [Supabase](https://supabase.com).
2.  In the **SQL Editor**, run the contents of `supabase/schema.sql` to initialize your database.
3.  Retrieve your `Project URL` and `anon` key from **Project Settings > API**.

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Add other necessary variables from .env.example
```

### 3. Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application in action.

### 4. Seed Demo Data (Optional)

To load ready-to-use demo data:

1. Run `supabase/schema.sql` in Supabase SQL Editor (if not already done).
2. Run `supabase/seed.sql`.

Seed details and reset instructions:

- `docs/SEED_DATA.md`

## 🚢 Deployment

### Cloudflare Pages (Recommended)
This project is configured for deployment on Cloudflare via OpenNext.

```bash
npm run deploy
```

Refer to [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) for detailed steps.

### Vercel
Standard Next.js deployment:
1. Connect your repository to Vercel.
2. Configure environment variables.
3. Deploy!

## 🧪 Testing

The project uses Jest and React Testing Library for unit and integration tests.

```bash
npm test
```

---
Built with ❤️ for Pakistani Small Businesses.
