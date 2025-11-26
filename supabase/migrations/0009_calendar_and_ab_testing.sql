-- Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('launch', 'marketing', 'deadline', 'milestone', 'other')),
    is_all_day BOOLEAN DEFAULT true,
    start_time TIME,
    end_time TIME,
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_minutes INTEGER DEFAULT 60,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Tests Table
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,
    test_name TEXT NOT NULL,
    test_type TEXT NOT NULL CHECK (test_type IN ('cover', 'title', 'description', 'price', 'keywords')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Test Variants Table
CREATE TABLE IF NOT EXISTS ab_test_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    variant_name TEXT NOT NULL,
    variant_data JSONB NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_profile_date ON calendar_events(profile_id, event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_book ON calendar_events(book_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_profile ON ab_tests(profile_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_test ON ab_test_variants(test_id);

-- RLS Policies for calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar events"
    ON calendar_events FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own calendar events"
    ON calendar_events FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own calendar events"
    ON calendar_events FOR UPDATE
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own calendar events"
    ON calendar_events FOR DELETE
    USING (auth.uid() = profile_id);

-- RLS Policies for ab_tests
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ab tests"
    ON ab_tests FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own ab tests"
    ON ab_tests FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own ab tests"
    ON ab_tests FOR UPDATE
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own ab tests"
    ON ab_tests FOR DELETE
    USING (auth.uid() = profile_id);

-- RLS Policies for ab_test_variants
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view variants of their own tests"
    ON ab_test_variants FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM ab_tests
        WHERE ab_tests.id = ab_test_variants.test_id
        AND ab_tests.profile_id = auth.uid()
    ));

CREATE POLICY "Users can create variants for their own tests"
    ON ab_test_variants FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM ab_tests
        WHERE ab_tests.id = ab_test_variants.test_id
        AND ab_tests.profile_id = auth.uid()
    ));

CREATE POLICY "Users can update variants of their own tests"
    ON ab_test_variants FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM ab_tests
        WHERE ab_tests.id = ab_test_variants.test_id
        AND ab_tests.profile_id = auth.uid()
    ));

CREATE POLICY "Users can delete variants of their own tests"
    ON ab_test_variants FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM ab_tests
        WHERE ab_tests.id = ab_test_variants.test_id
        AND ab_tests.profile_id = auth.uid()
    ));

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at
    BEFORE UPDATE ON ab_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_test_variants_updated_at
    BEFORE UPDATE ON ab_test_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
