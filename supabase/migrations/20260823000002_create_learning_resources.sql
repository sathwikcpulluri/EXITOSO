-- Migration: 20260823000002_create_learning_resources.sql
-- Description: Create saved_learning_resources table for AI Skill Gap Learning Hub

CREATE TABLE IF NOT EXISTS public.saved_learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'video' | 'course' | 'documentation' | 'practice' | 'certification'
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    difficulty TEXT DEFAULT 'Beginner',
    estimated_hours INTEGER DEFAULT 4,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.saved_learning_resources ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own saved resources" ON public.saved_learning_resources;
DROP POLICY IF EXISTS "Users can insert their own saved resources" ON public.saved_learning_resources;
DROP POLICY IF EXISTS "Users can update their own saved resources" ON public.saved_learning_resources;
DROP POLICY IF EXISTS "Users can delete their own saved resources" ON public.saved_learning_resources;

-- RLS Policies
CREATE POLICY "Users can view their own saved resources"
    ON public.saved_learning_resources
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved resources"
    ON public.saved_learning_resources
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved resources"
    ON public.saved_learning_resources
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved resources"
    ON public.saved_learning_resources
    FOR DELETE
    USING (auth.uid() = user_id);

-- Performance Index
CREATE INDEX IF NOT EXISTS idx_saved_learning_user_created 
    ON public.saved_learning_resources (user_id, created_at DESC);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
