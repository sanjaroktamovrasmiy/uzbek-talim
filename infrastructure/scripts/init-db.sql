-- ===========================================
-- Uzbek Ta'lim Database Initialization
-- ===========================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS talim;

-- Set default search path
ALTER DATABASE uzbek_talim SET search_path TO talim, public;

-- Grant permissions
GRANT ALL ON SCHEMA talim TO postgres;
GRANT USAGE ON SCHEMA talim TO postgres;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database uzbek_talim initialized successfully';
END $$;

