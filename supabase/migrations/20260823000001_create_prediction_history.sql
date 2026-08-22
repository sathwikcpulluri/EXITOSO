-- Migration: 20260823000001_create_prediction_history.sql
-- Description: Create prediction_history table with RLS for storing authenticated candidate AI fit predictions

CREATE TABLE IF NOT EXISTS public.prediction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    match_score INTEGER NOT NULL,
    prediction_label TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    skill_score INTEGER NOT NULL,
    experience_score INTEGER NOT NULL,
    role_score INTEGER NOT NULL,
    responsibility_score INTEGER DEFAULT 80,
    education_score INTEGER DEFAULT 85,
    certification_score INTEGER DEFAULT 80,
    matched_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    skill_gaps JSONB DEFAULT '[]'::jsonb,
    factors JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.prediction_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own predictions" ON public.prediction_history;
DROP POLICY IF EXISTS "Users can insert their own predictions" ON public.prediction_history;
DROP POLICY IF EXISTS "Users can delete their own predictions" ON public.prediction_history;

-- RLS Policies
CREATE POLICY "Users can view their own predictions"
    ON public.prediction_history
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions"
    ON public.prediction_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions"
    ON public.prediction_history
    FOR DELETE
    USING (auth.uid() = user_id);

-- Performance Index
CREATE INDEX IF NOT EXISTS idx_prediction_history_user_created 
    ON public.prediction_history (user_id, created_at DESC);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
