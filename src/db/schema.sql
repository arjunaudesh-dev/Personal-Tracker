-- =============================================================================
-- NEXUS LIFE-OS: MASTER RELATIONAL POSTGRESQL & SUPABASE DDL
-- Author: Officer Arjuna Kahandawa (Civil Engineer Officer)
-- Target Database: PostgreSQL 15+ / Supabase
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Table: mindmap_tasks
CREATE TABLE IF NOT EXISTS mindmap_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    parent_id UUID REFERENCES mindmap_tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    markdown_notes TEXT,
    group_category VARCHAR(50) NOT NULL DEFAULT 'Work',
    direction VARCHAR(10) NOT NULL DEFAULT 'LR',
    depth INT NOT NULL DEFAULT 0,
    pos_x FLOAT NOT NULL DEFAULT 0.0,
    pos_y FLOAT NOT NULL DEFAULT 0.0,
    status VARCHAR(30) NOT NULL DEFAULT 'todo',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_collapsed BOOLEAN NOT NULL DEFAULT false,
    progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    is_auto_calculated BOOLEAN NOT NULL DEFAULT true,
    cashflow JSONB, -- Embedded micro-BOQ: estimatedCost, actualSpend, currency
    reminders JSONB DEFAULT '[]', -- Scheduled alarms, Google Calendar event IDs
    attachments JSONB DEFAULT '[]', -- Cloud docs, Google Drive URLs, blueprints
    contacts JSONB DEFAULT '[]', -- Linked personnel with phone & WhatsApp deep-links
    ai_insight JSONB, -- Cached Gemini bottleneck analysis
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core Table: task_cross_group_links
CREATE TABLE IF NOT EXISTS task_cross_group_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_task_id UUID NOT NULL REFERENCES mindmap_tasks(id) ON DELETE CASCADE,
    target_task_id UUID NOT NULL REFERENCES mindmap_tasks(id) ON DELETE CASCADE,
    target_group VARCHAR(50) NOT NULL,
    relationship_type VARCHAR(30) NOT NULL DEFAULT 'relates_to', -- 'blocks', 'depends_on'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core Table: financial_transactions
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    bucket VARCHAR(20) NOT NULL, -- 'needs', 'wants', 'savings'
    type VARCHAR(10) NOT NULL, -- 'income', 'expense'
    linked_task_id UUID REFERENCES mindmap_tasks(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'settled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supporting Table: health_biometrics
CREATE TABLE IF NOT EXISTS health_biometrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    recorded_date DATE NOT NULL UNIQUE,
    sleep_score INT CHECK (sleep_score BETWEEN 0 AND 100),
    resting_hr INT,
    hrv_ms INT,
    weight_kg NUMERIC(5, 2),
    hydration_ml INT,
    steps INT,
    active_calories INT,
    source_device VARCHAR(50) DEFAULT 'Xiaomi Mi Band / Mibro GT',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supporting Table: medical_bloodwork_records
CREATE TABLE IF NOT EXISTS medical_bloodwork_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    test_date DATE NOT NULL,
    lab_name VARCHAR(150),
    biomarkers JSONB NOT NULL,
    gemini_clinical_summary TEXT,
    corrective_tasks_spawned UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_mindmap_tasks_updated_at
BEFORE UPDATE ON mindmap_tasks
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
