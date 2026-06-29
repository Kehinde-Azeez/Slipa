 -- Migration 004 — Create line_items table
-- Run after 003. Never edit after applying to production.

CREATE TABLE line_items (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  UUID          NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT          NOT NULL,
  quantity    NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(15,2) NOT NULL CHECK (unit_price > 0),
  line_total  NUMERIC(15,2) NOT NULL    -- always quantity * unit_price, computed server-side
);

CREATE INDEX idx_line_items_invoice ON line_items (invoice_id);
