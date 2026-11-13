-- ==============================================================================
-- MoneyControlr: Security & Data Integrity Hardening Migration (Stage 2)
-- Safe, idempotent migration designed to run on top of 20261109000000_init_schema.sql
-- ==============================================================================

begin;

-- ------------------------------------------------------------------------------
-- 1. PRIVATE SECURITY SCHEMA & EMAIL-VERIFIED RLS HELPER
--    Placed in a private schema (not exposed to PostgREST Data API).
--    Checks auth.users directly so verification takes effect immediately
--    without waiting for a JWT refresh, and blocks soft-deleted or banned users.
-- ------------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_email_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
      and u.deleted_at is null
      and (u.banned_until is null or u.banned_until <= now())
  );
$$;

revoke all on function private.is_email_verified() from public;
grant execute on function private.is_email_verified() to authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 2. SAFE DEDUPLICATION BEFORE UNIQUE INDEXES
--    Protects databases where initial seed SQL may have run multiple times.
-- ------------------------------------------------------------------------------

-- 2a. Merge duplicate global categories (user_id IS NULL) safely
with ranked as (
  select
    id,
    first_value(id) over (
      partition by lower(trim(name)), type
      order by created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by lower(trim(name)), type
      order by created_at asc, id asc
    ) as rn
  from public.categories
  where user_id is null
),
dups as (
  select id as dup_id, keep_id
  from ranked
  where rn > 1
),
repoint as (
  update public.transactions t
  set category_id = d.keep_id
  from dups d
  where t.category_id = d.dup_id
)
delete from public.categories c
using dups d
where c.id = d.dup_id;

-- 2b. Merge duplicate user-owned categories safely
with ranked_user as (
  select
    id,
    first_value(id) over (
      partition by user_id, lower(trim(name)), type
      order by created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by user_id, lower(trim(name)), type
      order by created_at asc, id asc
    ) as rn
  from public.categories
  where user_id is not null
),
dups_user as (
  select id as dup_id, keep_id
  from ranked_user
  where rn > 1
),
repoint_user as (
  update public.transactions t
  set category_id = d.keep_id
  from dups_user d
  where t.category_id = d.dup_id
)
delete from public.categories c
using dups_user d
where c.id = d.dup_id;

-- 2c. Remove duplicate budget rows for the same user & billing cycle (keep latest)
with ranked_budgets as (
  select
    id,
    row_number() over (
      partition by user_id, budget_start_date, budget_end_date
      order by updated_at desc, created_at desc, id desc
    ) as rn
  from public.budgets
)
delete from public.budgets b
using ranked_budgets rb
where b.id = rb.id
  and rb.rn > 1;

-- 2d. Enforce category & budget uniqueness
create unique index if not exists uq_categories_global_name_type
  on public.categories (lower(trim(name)), type)
  where user_id is null;

create unique index if not exists uq_categories_user_name_type
  on public.categories (user_id, lower(trim(name)), type)
  where user_id is not null;

create unique index if not exists uq_budgets_user_cycle
  on public.budgets (user_id, budget_start_date, budget_end_date);

-- ------------------------------------------------------------------------------
-- 3. HARDEN SECURITY DEFINER TRIGGERS & AUTO-UPDATE TIMESTAMPS
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display_name text;
begin
  v_display_name := nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), '');
  if v_display_name is null then
    v_display_name := coalesce(nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Student');
  end if;

  insert into public.profiles (id, display_name, currency)
  values (new.id, left(v_display_name, 80), 'INR')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_budgets_updated_at on public.budgets;
create trigger trg_budgets_updated_at
  before update on public.budgets
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 4. INTEGRITY CHECK CONSTRAINTS
-- ------------------------------------------------------------------------------
alter table public.profiles
  drop constraint if exists chk_profiles_currency,
  add constraint chk_profiles_currency
    check (char_length(trim(currency)) between 3 and 5),
  drop constraint if exists chk_profiles_display_name_len,
  add constraint chk_profiles_display_name_len
    check (display_name is null or char_length(display_name) <= 80);

alter table public.budgets
  drop constraint if exists chk_budgets_date_order,
  add constraint chk_budgets_date_order
    check (budget_end_date >= budget_start_date),
  drop constraint if exists chk_budgets_allowance_bounds,
  add constraint chk_budgets_allowance_bounds
    check (monthly_allowance >= 0 and monthly_allowance <= 100000000),
  drop constraint if exists chk_budgets_split_sum_100,
  add constraint chk_budgets_split_sum_100
    check (round((needs_percentage + wants_percentage + savings_percentage)::numeric, 2) = 100.00),
  drop constraint if exists chk_budgets_money_source,
  add constraint chk_budgets_money_source
    check (money_source in ('parental_allowance', 'salary', 'scholarship', 'part_time', 'freelance', 'other'));

alter table public.categories
  drop constraint if exists chk_categories_name_nonempty,
  add constraint chk_categories_name_nonempty
    check (char_length(trim(name)) between 1 and 60);

alter table public.transactions
  drop constraint if exists chk_transactions_amount_bounds,
  add constraint chk_transactions_amount_bounds
    check (amount > 0 and amount <= 100000000),
  drop constraint if exists chk_transactions_payment_source,
  add constraint chk_transactions_payment_source
    check (payment_source in ('upi', 'cash', 'card', 'bank_transfer', 'other')),
  drop constraint if exists chk_transactions_note_len,
  add constraint chk_transactions_note_len
    check (note is null or char_length(note) <= 500);

-- ------------------------------------------------------------------------------
-- 5. CATEGORY OWNERSHIP & TRANSACTION TYPE INTEGRITY TRIGGER
--    Blocks cross-user category references and expense/income type mismatches
--    at the database layer even if API routes are bypassed.
-- ------------------------------------------------------------------------------
create or replace function public.validate_transaction_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cat_user_id uuid;
  v_cat_type text;
begin
  select c.user_id, c.type
  into v_cat_user_id, v_cat_type
  from public.categories c
  where c.id = new.category_id;

  if not found then
    raise exception 'Selected category does not exist.' using errcode = '23503';
  end if;

  if v_cat_user_id is not null and v_cat_user_id <> new.user_id then
    raise exception 'You do not have permission to use this category.' using errcode = '42501';
  end if;

  if v_cat_type <> new.type then
    raise exception 'Transaction type (%) does not match category type (%).', new.type, v_cat_type using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_transactions_validate_integrity on public.transactions;
create trigger trg_transactions_validate_integrity
  before insert or update of user_id, category_id, type on public.transactions
  for each row execute procedure public.validate_transaction_integrity();

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) HARDENING
--    Every user table enforces:
--      1. Authenticated role only (TO authenticated)
--      2. Confirmed/verified, active email (private.is_email_verified())
--      3. Strict ownership check in both USING and WITH CHECK
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.budgets enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- PROFILES
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Verified users can view own profile" on public.profiles;
drop policy if exists "Verified users can insert own profile" on public.profiles;
drop policy if exists "Verified users can update own profile" on public.profiles;

create policy "Verified users can view own profile"
  on public.profiles for select
  to authenticated
  using (
    (select auth.uid()) = id
    and (select private.is_email_verified())
  );

create policy "Verified users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (
    (select auth.uid()) = id
    and (select private.is_email_verified())
  );

create policy "Verified users can update own profile"
  on public.profiles for update
  to authenticated
  using (
    (select auth.uid()) = id
    and (select private.is_email_verified())
  )
  with check (
    (select auth.uid()) = id
    and (select private.is_email_verified())
  );

-- BUDGETS
drop policy if exists "Users can view their own budgets" on public.budgets;
drop policy if exists "Users can insert their own budgets" on public.budgets;
drop policy if exists "Users can update their own budgets" on public.budgets;
drop policy if exists "Users can delete their own budgets" on public.budgets;
drop policy if exists "Verified users can view own budgets" on public.budgets;
drop policy if exists "Verified users can insert own budgets" on public.budgets;
drop policy if exists "Verified users can update own budgets" on public.budgets;
drop policy if exists "Verified users can delete own budgets" on public.budgets;

create policy "Verified users can view own budgets"
  on public.budgets for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select private.is_email_verified())
  );

create policy "Verified users can insert own budgets"
  on public.budgets for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (select private.is_email_verified())
  );

create policy "Verified users can update own budgets"
  on public.budgets for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select private.is_email_verified())
  )
  with check (
    (select auth.uid()) = user_id
    and (select private.is_email_verified())
  );

create policy "Verified users can delete own budgets"
  on public.budgets for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select private.is_email_verified())
  );

-- CATEGORIES
drop policy if exists "Users can view system and their own categories" on public.categories;
drop policy if exists "Users can insert their own categories" on public.categories;
drop policy if exists "Users can update their own categories" on public.categories;
drop policy if exists "Users can delete their own categories" on public.categories;
drop policy if exists "Verified users can view system and own categories" on public.categories;
drop policy if exists "Verified users can insert own categories" on public.categories;
drop policy if exists "Verified users can update own categories" on public.categories;
drop policy if exists "Verified users can delete own categories" on public.categories;

create policy "Verified users can view system and own categories"
  on public.categories for select
  to authenticated
  using (
    (user_id is null or (select auth.uid()) = user_id)
    and (select private.is_email_verified())
  );

create policy "Verified users can insert own categories"
  on public.categories for insert
  to authenticated
  with check (
    user_id is not null
    and (select auth.uid()) = user_id
    and (select private.is_email_verified())
  );

create policy "Verified users can update own categories"
  on public.categories for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select private.is_email_verified())
  )
  with check (
    user_id is not null
    and (select auth.uid()) = user_id
    and (select private.is_email_verified())
  );

create policy "Verified users can delete own categories"
  on public.categories for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select private.is_email_verified())
  );

-- TRANSACTIONS
drop policy if exists "Users can view their own transactions" on public.transactions;
drop policy if exists "Users can insert their own transactions" on public.transactions;
drop policy if exists "Users can update their own transactions" on public.transactions;
drop policy if exists "Users can delete their own transactions" on public.transactions;
drop policy if exists "Verified users can view own transactions" on public.transactions;
drop policy if exists "Verified users can insert own transactions" on public.transactions;
drop policy if exists "Verified users can update own transactions" on public.transactions;
drop policy if exists "Verified users can delete own transactions" on public.transactions;

create policy "Verified users can view own transactions"
  on public.transactions for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select private.is_email_verified())
  );

create policy "Verified users can insert own transactions"
  on public.transactions for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (select private.is_email_verified())
    and exists (
      select 1
      from public.categories c
      where c.id = category_id
        and (c.user_id is null or c.user_id = (select auth.uid()))
        and c.type = type
    )
  );

create policy "Verified users can update own transactions"
  on public.transactions for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select private.is_email_verified())
  )
  with check (
    (select auth.uid()) = user_id
    and (select private.is_email_verified())
    and exists (
      select 1
      from public.categories c
      where c.id = category_id
        and (c.user_id is null or c.user_id = (select auth.uid()))
        and c.type = type
    )
  );

create policy "Verified users can delete own transactions"
  on public.transactions for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and (select private.is_email_verified())
  );

commit;

