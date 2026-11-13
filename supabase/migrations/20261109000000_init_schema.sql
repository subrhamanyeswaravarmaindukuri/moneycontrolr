-- ==============================================================================
-- MoneyControlr: Production PostgreSQL Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  currency text not null default 'INR',
  avatar_url text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 2. BUDGETS TABLE
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  monthly_allowance numeric(12, 2) not null check (monthly_allowance >= 0),
  budget_start_date date not null default date_trunc('month', current_date)::date,
  budget_end_date date not null default (date_trunc('month', current_date) + interval '1 month - 1 day')::date,
  needs_percentage numeric(5, 2) not null default 50.00 check (needs_percentage >= 0 and needs_percentage <= 100),
  wants_percentage numeric(5, 2) not null default 30.00 check (wants_percentage >= 0 and wants_percentage <= 100),
  savings_percentage numeric(5, 2) not null default 20.00 check (savings_percentage >= 0 and savings_percentage <= 100),
  money_source text not null default 'parental_allowance',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 3. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade, -- null means global system default category
  name text not null,
  type text not null check (type in ('expense', 'income')),
  icon text,
  color text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- 4. TRANSACTIONS TABLE
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete restrict not null,
  amount numeric(12, 2) not null check (amount > 0),
  type text not null check (type in ('expense', 'income')),
  payment_source text not null default 'upi',
  transaction_date date not null default current_date,
  note text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR OPTIMIZED QUERY PERFORMANCE
-- ==============================================================================
create index if not exists idx_budgets_user on public.budgets(user_id);
create index if not exists idx_categories_user on public.categories(user_id);
create index if not exists idx_transactions_user_date on public.transactions(user_id, transaction_date desc);
create index if not exists idx_transactions_category on public.transactions(category_id);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.budgets enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- PROFILES RLS POLICIES
create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- BUDGETS RLS POLICIES
create policy "Users can view their own budgets" 
  on public.budgets for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own budgets" 
  on public.budgets for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own budgets" 
  on public.budgets for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own budgets" 
  on public.budgets for delete 
  using (auth.uid() = user_id);

-- CATEGORIES RLS POLICIES
-- System categories have user_id IS NULL and can be read by everyone. Custom categories belong to user_id.
create policy "Users can view system and their own categories" 
  on public.categories for select 
  using (user_id is null or auth.uid() = user_id);

create policy "Users can insert their own categories" 
  on public.categories for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own categories" 
  on public.categories for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own categories" 
  on public.categories for delete 
  using (auth.uid() = user_id);

-- TRANSACTIONS RLS POLICIES
create policy "Users can view their own transactions" 
  on public.transactions for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions" 
  on public.transactions for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions" 
  on public.transactions for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions" 
  on public.transactions for delete 
  using (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, currency)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'INR'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- DEFAULT SEED CATEGORIES (GLOBAL SYSTEM DEFAULTS, user_id is NULL)
-- ==============================================================================
insert into public.categories (user_id, name, type, icon, color)
values
  -- Expenses
  (null, 'Food & Drink', 'expense', 'Utensils', '#145C43'),
  (null, 'Shopping', 'expense', 'ShoppingBag', '#0E7490'),
  (null, 'Travel', 'expense', 'Bus', '#B45309'),
  (null, 'Bills & Utilities', 'expense', 'Receipt', '#4338CA'),
  (null, 'Education', 'expense', 'GraduationCap', '#15803D'),
  (null, 'Entertainment', 'expense', 'Film', '#BE185D'),
  (null, 'Health', 'expense', 'HeartPulse', '#B91C1C'),
  (null, 'Other Expense', 'expense', 'MoreHorizontal', '#475569'),
  -- Income
  (null, 'Parental Allowance', 'income', 'HeartHandshake', '#145C43'),
  (null, 'Salary', 'income', 'Briefcase', '#047857'),
  (null, 'Scholarship', 'income', 'Award', '#D97706'),
  (null, 'Part-Time Job', 'income', 'Clock', '#6D28D9'),
  (null, 'Freelance', 'income', 'Laptop', '#2563EB'),
  (null, 'Other Income', 'income', 'PlusCircle', '#059669')
on conflict do nothing;

