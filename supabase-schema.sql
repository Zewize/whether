-- Run this in the Supabase SQL editor

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  phone text,
  gender text not null,
  birthdate date not null,
  height int not null,
  weight int not null,
  city text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
