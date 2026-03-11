-- ═══════════════════════════════════════════
-- SABER MÁS · Supabase Schema
-- Ejecutar en: Supabase > SQL Editor
-- ═══════════════════════════════════════════

-- 1. Perfiles de usuarios
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  name text,
  email text,
  whatsapp text,
  provincia text,
  is_premium boolean default false,
  premium_since timestamptz,
  created_at timestamptz default now()
);

-- 2. Historial de actividad
create table if not exists activity (
  id bigserial primary key,
  user_id uuid references profiles(id),
  description text,
  created_at timestamptz default now()
);

-- 3. Preferencias de aprendizaje
create table if not exists learn_prefs (
  id bigserial primary key,
  user_id uuid references profiles(id) unique,
  topics text[],      -- ['filosofia','historia','fisica']
  delivery text,      -- 'wp' | 'mail'
  updated_at timestamptz default now()
);

-- 4. Preferencias de noticias
create table if not exists news_prefs (
  id bigserial primary key,
  user_id uuid references profiles(id) unique,
  provincia boolean default false,
  argentina boolean default false,
  mundo boolean default false,
  delivery text,      -- 'wp' | 'mail'
  updated_at timestamptz default now()
);

-- 5. Resultados de tests
create table if not exists test_results (
  id bigserial primary key,
  user_id uuid references profiles(id),
  level text,         -- 'alto' | 'mediano' | 'bajo'
  score integer,      -- 0-20
  total integer default 20,
  created_at timestamptz default now()
);

-- ── Row Level Security ──
alter table profiles enable row level security;
alter table activity enable row level security;
alter table learn_prefs enable row level security;
alter table news_prefs enable row level security;
alter table test_results enable row level security;

-- Políticas: cada usuario sólo ve sus datos
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view own activity" on activity for select using (auth.uid() = user_id);
create policy "Users can insert own activity" on activity for insert with check (auth.uid() = user_id);

create policy "Users can manage own learn_prefs" on learn_prefs for all using (auth.uid() = user_id);
create policy "Users can manage own news_prefs" on news_prefs for all using (auth.uid() = user_id);
create policy "Users can manage own test_results" on test_results for all using (auth.uid() = user_id);
