-- Run this in the Supabase SQL editor after creating your project.

create table public.readers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  isbn text unique not null,
  genre text not null,
  status text not null default 'available'
    check (status in ('available', 'borrowed')),
  created_at timestamptz not null default now()
);

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete restrict,
  reader_id uuid not null references public.readers(id) on delete restrict,
  borrowed_at timestamptz not null default now(),
  due_date date not null,
  returned_at timestamptz,
  renewed boolean not null default false
);

create unique index one_active_loan_per_book
  on public.loans(book_id)
  where returned_at is null;

alter table public.readers enable row level security;
alter table public.books enable row level security;
alter table public.loans enable row level security;

-- Replace these development policies with authenticated librarian policies
-- before using real member data in production.
create policy "Public demo readers" on public.readers for all using (true) with check (true);
create policy "Public demo books" on public.books for all using (true) with check (true);
create policy "Public demo loans" on public.loans for all using (true) with check (true);
