-- Migration: 20260823000003_create_applications.sql
-- Description: Create applications table with RLS for the AI Application Assistant

CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    job_url TEXT,
    job_description TEXT,
    match_score INTEGER DEFAULT 0,
    hiring_competitiveness INTEGER DEFAULT 0,
    application_readiness INTEGER DEFAULT 0,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    strengths JSONB DEFAULT '[]'::jsonb,
    resume_version TEXT DEFAULT 'Primary Resume',
    status TEXT DEFAULT 'Saved', -- 'Saved' | 'Applied' | 'Recruiter Review' | 'Interview' | 'Technical Round' | 'Final Interview' | 'Offer' | 'Rejected' | 'Withdrawn'
    notes TEXT,
    cover_letter TEXT,
    applied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can delete their own applications" ON public.applications;

-- RLS Policies
CREATE POLICY "Users can view their own applications"
    ON public.applications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
    ON public.applications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
    ON public.applications
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications"
    ON public.applications
    FOR DELETE
    USING (auth.uid() = user_id);

-- Performance & Unique Indexes
CREATE INDEX IF NOT EXISTS idx_applications_user_created 
    ON public.applications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_user_status 
    ON public.applications (user_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_user_job 
    ON public.applications (user_id, job_id);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
