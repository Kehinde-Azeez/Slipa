 -- Migration 002 — Create clients table
-- Run after 001. Never edit after applying to production.

CREATE TABLE clients (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID        NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  email         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_freelancer ON clients (freelancer_id);
