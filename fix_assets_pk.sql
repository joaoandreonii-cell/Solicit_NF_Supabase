-- SQL Migration: Fix Assets Primary Key
-- This script changes the PK of the assets table to be composite (fiscal_code, patrimony)

-- 1. Drop existing constraints if they depend on the old PK
-- (Adjust constraint name if it's different in your Supabase)
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_pkey;

-- 2. Add the new composite Primary Key
ALTER TABLE assets ADD PRIMARY KEY (fiscal_code, patrimony);

-- 3. Update the upsert_assets RPC function to handle the composite key
CREATE OR REPLACE FUNCTION upsert_assets(assets_json JSONB)
RETURNS VOID AS $$
BEGIN
    INSERT INTO assets (fiscal_code, patrimony, description, updated_at)
    SELECT 
        (item->>'fiscal_code')::TEXT,
        (item->>'patrimony')::TEXT,
        (item->>'description')::TEXT,
        (item->>'updated_at')::TIMESTAMPTZ
    FROM jsonb_array_elements(assets_json) AS item
    ON CONFLICT (fiscal_code, patrimony) 
    DO UPDATE SET
        description = EXCLUDED.description,
        updated_at = EXCLUDED.updated_at
    WHERE EXCLUDED.updated_at > assets.updated_at;
END;
$$ LANGUAGE plpgsql;
