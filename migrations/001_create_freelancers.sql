 -- Migration 001 — Create freelancers table
-- Run once on first deploy. Never edit after applying to production.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE freelancers (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT        NOT NULL,
  email                TEXT        NOT NULL UNIQUE,
  password_hash        TEXT        NOT NULL,
  phone                TEXT,
  address              TEXT,
  default_currency     TEXT        NOT NULL DEFAULT 'NGN'
                                   CHECK (default_currency IN ('NGN','USD','GBP','EUR')),
  bank_name            TEXT,
  account_name         TEXT,
  account_number       TEXT,        -- AES-256-GCM encrypted. Never plaintext.
  invoice_counter      INTEGER     NOT NULL DEFAULT 0,
  invoice_counter_year INTEGER     NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_freelancers_email ON freelancers (email);
