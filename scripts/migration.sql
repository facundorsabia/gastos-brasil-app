-- ============================================================
-- Migración: crear tabla expenses para gastos-brasil-app
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null,
  date        text not null,
  amount      numeric not null,
  currency    text not null check (currency in ('USD','BRL','ARS')),
  "createdBy" text not null check ("createdBy" in ('TEFI','FACU')),
  "paidBy"    text not null check ("paidBy" in ('TEFI','FACU','SHARED')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- La app tiene su propio sistema de auth (cookies HMAC), no usa Supabase Auth.
-- Deshabilitamos RLS y usamos service_role key desde el servidor.
alter table expenses disable row level security;
