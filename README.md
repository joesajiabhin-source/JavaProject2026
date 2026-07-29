# Folio Library Manager

A simple, responsive library-management website supporting:

- Book catalogue and search
- Reader registration
- Checkout with a three-book limit
- Returns and one-time renewals
- Overdue tracking and estimated fines
- Browser-based demo storage
- Supabase-ready environment configuration and schema

## Run locally

```bash
npm install
npm run dev
```

## Connect Supabase later

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env`.
4. Add the project URL and anonymous key.
5. Restart the development server.

The current UI intentionally uses local browser storage until the database
adapter is enabled with the final project details.
