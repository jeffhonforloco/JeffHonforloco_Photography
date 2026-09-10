ALTER TABLE contacts ADD COLUMN attribution TEXT;
ALTER TABLE contacts ADD COLUMN qualification TEXT;
CREATE INDEX IF NOT EXISTS idx_contacts_service_type ON contacts (service_type);
