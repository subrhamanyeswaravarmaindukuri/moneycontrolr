-- ==============================================================================
-- MoneyControlr: Recurring Monthly Expenses & Fixed Commitments Schema
-- Safe, idempotent migration designed to run on top of 20261111000000_security_and_integrity_hardening.sql
-- ==============================================================================

begin;

-- 1. RECURRING EXPENSES TABLE
create table if not exists public.recurring_expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete restrict not null,
  name text not null,
  amount numeric(12, 2) not null check (amount > 0 and amount <= 100000000),
  payment_source text not null default 'upi' check (payment_source in ('upi', 'cash', 'card', 'bank_transfer', 'other')),
  due_day integer not null default 1 check (due_day >= 1 and due_day <= 31),
  is_active boolean not null default true,
  note text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 2. INTEGRITY CONSTRAINTS
alter table public.recurring_expenses
  drop constraint if exists chk_recurring_name_len,
  add constraint chk_recurring_name_len
    check (char_length(trim(name)) between 1 and 80);

alter table public.recurring_expenses
  drop constraint if exists chk_recurring_note_len,
  add constraint chk_recurring_note_len
    check (note is null or char_length(note) <= 300);

-- 3. INDEXES
create index if not exists idx_recurring_user on public.recurring_expenses(user_id);
create index if not exists idx_recurring_category on public.recurring_expenses(category_id);

-- 4. UPDATED_AT TRIGGER
drop trigger if exists trg_recurring_updated_at on public.recurring_expenses;
create trigger trg_recurring_updated_at
  before update on public.recurring_expenses
  for each row execute procedure public.set_updated_at();

-- 5. ROW LEVEL SECURITY (RLS)
alter table public.recurring_expenses enable row level security;

drop policy if exists "Users can view their own recurring expenses" on public.recurring_expenses;
create policy "Users can view their own recurring expenses" 
  on public.recurring_expenses for select 
  using (
    auth.uid() = user_id 
    and (
      -- If private.is_email_verified exists, verify it, otherwise standard auth.uid() check
      private.is_email_verified()
    )
  );

drop policy if exists "Users can insert their own recurring expenses" on public.recurring_expenses;
create policy "Users can insert their own recurring expenses" 
  on public.recurring_expenses for insert 
  with check (
    auth.uid() = user_id 
    and private.is_email_verified()
  );

drop policy if exists "Users can update their own recurring expenses" on public.recurring_expenses;
create policy "Users can update their own recurring expenses" 
  on public.recurring_expenses for update 
  using (
    auth.uid() = user_id 
    and private.is_email_verified()
  );

drop policy if exists "Users can delete their own recurring expenses" on public.recurring_expenses;
create policy "Users can delete their own recurring expenses" 
  on public.recurring_expenses for delete 
  using (
    auth.uid() = user_id 
    and private.is_email_verified()
  );

commit;
