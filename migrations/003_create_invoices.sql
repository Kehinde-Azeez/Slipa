 -- Migration 003 — Create invoices table
-- Run after 002. Never edit after applying to production.

CREATE TABLE invoices (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT           NOT NULL UNIQUE,  -- INV-YYYY-XXX, reserved atomically
  freelancer_id   UUID           NOT NULL REFERENCES freelancers(id),
  client_id       UUID           NOT NULL REFERENCES clients(id),
  currency        TEXT           NOT NULL CHECK (currency IN ('NGN','USD','GBP','EUR')),
  subtotal        NUMERIC(15,2)  NOT NULL,
  vat_rate        NUMERIC(5,4),                    -- e.g. 0.0750. NULL if not opted in.
  vat_amount      NUMERIC(15,2),
  discount_amount NUMERIC(15,2),
  total_amount    NUMERIC(15,2)  NOT NULL,
  amount_paid     NUMERIC(15,2)  NOT NULL DEFAULT 0,
  balance_due     NUMERIC(15,2)  NOT NULL,
  payment_terms   TEXT           NOT NULL DEFAULT '50% upfront, balance on delivery',
  invoice_date    DATE           NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE           NOT NULL,
  status          TEXT           NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft','sent','paid','partial','overdue')),
  notes           TEXT,
  pdf_url         TEXT,           -- signed URL, expires 24h
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_freelancer ON invoices (freelancer_id);
CREATE INDEX idx_invoices_number     ON invoices (invoice_number);
