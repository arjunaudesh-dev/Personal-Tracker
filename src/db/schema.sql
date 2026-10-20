-- ═══════════════════════════════════════════════════════════════════════════
-- NEXUS LIFE-OS — PostgreSQL / Supabase relational schema
-- Target: Supabase (managed PostgreSQL) or a local PostgreSQL instance.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Core Table: mindmap_tasks ──────────────────────────────────────────────
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
    cashflow JSONB,          -- embedded micro-BOQ: estimatedCost, actualSpend, currency
    reminders JSONB DEFAULT '[]',   -- scheduled alarms, Google Calendar event IDs
    attachments JSONB DEFAULT '[]', -- cloud docs, Google Drive URLs, blueprints
    contacts JSONB DEFAULT '[]',    -- linked personnel with phone & WhatsApp deep-links
    ai_insight JSONB,               -- cached Gemini bottleneck analysis
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mindmap_tasks_user    ON mindmap_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_mindmap_tasks_parent  ON mindmap_tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_mindmap_tasks_group   ON mindmap_tasks(group_category);
CREATE INDEX IF NOT EXISTS idx_mindmap_tasks_status  ON mindmap_tasks(status);
CREATE INDEX IF NOT EXISTS idx_mindmap_tasks_due     ON mindmap_tasks(due_date);

-- ── Core Table: task_cross_group_links ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_cross_group_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_task_id UUID NOT NULL REFERENCES mindmap_tasks(id) ON DELETE CASCADE,
    target_task_id UUID NOT NULL REFERENCES mindmap_tasks(id) ON DELETE CASCADE,
    target_group VARCHAR(50) NOT NULL,
    relationship_type VARCHAR(30) NOT NULL DEFAULT 'relates_to', -- 'blocks', 'depends_on'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cross_links_source ON task_cross_group_links(source_task_id);
CREATE INDEX IF NOT EXISTS idx_cross_links_target ON task_cross_group_links(target_task_id);

-- ── Core Table: financial_transactions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    bucket VARCHAR(20) NOT NULL,          -- 'needs', 'wants', 'savings'
    type VARCHAR(10) NOT NULL,            -- 'income', 'expense'
    linked_task_id UUID REFERENCES mindmap_tasks(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'settled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fin_tx_date   ON financial_transactions(date);
CREATE INDEX IF NOT EXISTS idx_fin_tx_bucket ON financial_transactions(bucket);
CREATE INDEX IF NOT EXISTS idx_fin_tx_task   ON financial_transactions(linked_task_id);

-- ── Support Table: wearable_daily_metrics ──────────────────────────────────
CREATE TABLE IF NOT EXISTS wearable_daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    steps INT NOT NULL DEFAULT 0,
    resting_hr INT NOT NULL DEFAULT 0,
    active_hr INT NOT NULL DEFAULT 0,
    max_hr INT NOT NULL DEFAULT 0,
    calories_burned INT NOT NULL DEFAULT 0,
    sleep_minutes INT NOT NULL DEFAULT 0,
    sleep_score INT NOT NULL DEFAULT 0,
    hydration_ml INT NOT NULL DEFAULT 0,
    weight_kg FLOAT NOT NULL DEFAULT 0,
    body_fat_pct FLOAT NOT NULL DEFAULT 0,
    sleep_segments JSONB DEFAULT '[]',
    source VARCHAR(30) NOT NULL DEFAULT 'google-fit',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, date)
);

-- ── Support Table: training_sessions & sets ────────────────────────────────
CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    split VARCHAR(40) NOT NULL,
    title VARCHAR(120) NOT NULL,
    duration_min INT NOT NULL DEFAULT 0,
    calories INT NOT NULL DEFAULT 0,
    sets JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Support Table: nutrition_logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nutrition_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    slot VARCHAR(20) NOT NULL,            -- 'breakfast', 'lunch', 'snack', 'dinner'
    name VARCHAR(255) NOT NULL,
    protein INT NOT NULL DEFAULT 0,
    carbs INT NOT NULL DEFAULT 0,
    fat INT NOT NULL DEFAULT 0,
    calories INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Support Table: lab_reports & biomarkers ─────────────────────────────────
CREATE TABLE IF NOT EXISTS lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    file_name VARCHAR(255),
    source VARCHAR(30) NOT NULL DEFAULT 'gemini-vision',
    summary TEXT,
    flags JSONB DEFAULT '[]',
    raw JSONB
);

CREATE TABLE IF NOT EXISTS lab_biomarkers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
    key VARCHAR(60) NOT NULL,
    label VARCHAR(120) NOT NULL,
    value NUMERIC(12, 4) NOT NULL,
    unit VARCHAR(24) NOT NULL,
    ref_low NUMERIC(12, 4) NOT NULL,
    ref_high NUMERIC(12, 4) NOT NULL,
    category VARCHAR(20) NOT NULL,        -- lipid, glycemic, organ, hormone, vitamin
    status VARCHAR(20) NOT NULL DEFAULT 'normal'
);

CREATE INDEX IF NOT EXISTS idx_biomarkers_report ON lab_biomarkers(report_id);

-- ── Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE mindmap_tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_cross_group_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_biomarkers     ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_owns_mindmap_tasks ON mindmap_tasks
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_owns_cross_links ON task_cross_group_links
    FOR ALL USING (
        EXISTS (SELECT 1 FROM mindmap_tasks t WHERE t.id = source_task_id AND t.user_id = auth.uid())
    );

CREATE POLICY user_owns_financial_transactions ON financial_transactions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_owns_wearable_metrics ON wearable_daily_metrics
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_owns_training_sessions ON training_sessions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_owns_nutrition_logs ON nutrition_logs
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_owns_lab_reports ON lab_reports
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_owns_lab_biomarkers ON lab_biomarkers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM lab_reports r WHERE r.id = report_id AND r.user_id = auth.uid())
    );

-- ── Aggregation helper: bottom-up progress rollup ──────────────────────────
CREATE OR REPLACE FUNCTION rollup_task_progress(root_id UUID)
RETURNS TABLE (id UUID, progress INT) AS $$
    WITH RECURSIVE tree AS (
        SELECT t.id, t.progress, t.is_auto_calculated
        FROM mindmap_tasks t
        WHERE t.parent_id = root_id
        UNION ALL
        SELECT c.id, c.progress, c.is_auto_calculated
        FROM mindmap_tasks c
        JOIN tree ON c.parent_id = tree.id
    )
    SELECT tree.id, ROUND(AVG(tree.progress))::INT
    FROM tree
    GROUP BY tree.id;
$$ LANGUAGE SQL;
