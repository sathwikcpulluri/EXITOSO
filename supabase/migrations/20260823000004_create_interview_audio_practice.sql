-- Migration: 20260823000004_create_interview_audio_practice.sql
-- Description: Create 28-parameter interview practice sessions and answers tables with RLS and private audio storage

CREATE TABLE IF NOT EXISTS public.interview_practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_version TEXT DEFAULT 'Primary Resume',
    job_id TEXT,
    target_role TEXT DEFAULT 'Software Engineer',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    skill_score NUMERIC(3,1) DEFAULT 0.0,
    behavioral_score NUMERIC(3,1) DEFAULT 0.0,
    critical_thinking_score NUMERIC(3,1) DEFAULT 0.0,
    technical_explanation_score NUMERIC(3,1) DEFAULT 0.0,
    behavioral_communication_score NUMERIC(3,1) DEFAULT 0.0,
    soft_skills_practice_score NUMERIC(3,1) DEFAULT 0.0,
    english_communication_score NUMERIC(3,1) DEFAULT 0.0,
    explanation_score NUMERIC(3,1) DEFAULT 0.0,
    overall_communication_score NUMERIC(3,1) DEFAULT 0.0,
    total_score NUMERIC(3,1) DEFAULT 0.0,
    top_strengths JSONB DEFAULT '[]'::jsonb,
    top_weaknesses JSONB DEFAULT '[]'::jsonb,
    targeted_practice_recommendations JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'in_progress', -- 'in_progress' | 'completed' | 'cancelled'
    model_version TEXT DEFAULT 'gemini-1.5-flash-audio-v1',
    rubric_version TEXT DEFAULT 'rubric-en-28param-v1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.interview_practice_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.interview_practice_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    category TEXT NOT NULL, -- 'skill' | 'behavioral' | 'critical_thinking'
    question_text TEXT NOT NULL,
    audio_path TEXT,
    transcript TEXT,
    detected_language TEXT DEFAULT 'English',
    language TEXT DEFAULT 'English',
    language_confidence NUMERIC(3,2) DEFAULT 1.0,
    is_english BOOLEAN DEFAULT true,
    language_status TEXT DEFAULT 'english', -- 'english' | 'non_english' | 'mixed' | 'uncertain'
    content_score NUMERIC(3,1) DEFAULT 0.0,
    delivery_score NUMERIC(3,1) DEFAULT 0.0,
    overall_score NUMERIC(3,1) DEFAULT 0.0,
    parameter_scores JSONB DEFAULT '{}'::jsonb, -- 28 parameters on 1-5 scale
    special_scores JSONB DEFAULT '{}'::jsonb, -- explanation, STAR, critical thinking
    feedback TEXT,
    improvement_tip TEXT,
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.interview_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_practice_answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own interview sessions" ON public.interview_practice_sessions;
DROP POLICY IF EXISTS "Users can insert their own interview sessions" ON public.interview_practice_sessions;
DROP POLICY IF EXISTS "Users can update their own interview sessions" ON public.interview_practice_sessions;
DROP POLICY IF EXISTS "Users can delete their own interview sessions" ON public.interview_practice_sessions;

DROP POLICY IF EXISTS "Users can view their own interview answers" ON public.interview_practice_answers;
DROP POLICY IF EXISTS "Users can insert their own interview answers" ON public.interview_practice_answers;
DROP POLICY IF EXISTS "Users can update their own interview answers" ON public.interview_practice_answers;
DROP POLICY IF EXISTS "Users can delete their own interview answers" ON public.interview_practice_answers;

-- Sessions RLS Policies
CREATE POLICY "Users can view their own interview sessions"
    ON public.interview_practice_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview sessions"
    ON public.interview_practice_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions"
    ON public.interview_practice_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview sessions"
    ON public.interview_practice_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Answers RLS Policies
CREATE POLICY "Users can view their own interview answers"
    ON public.interview_practice_answers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview answers"
    ON public.interview_practice_answers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview answers"
    ON public.interview_practice_answers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview answers"
    ON public.interview_practice_answers FOR DELETE
    USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_created 
    ON public.interview_practice_sessions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_interview_answers_session 
    ON public.interview_practice_answers (session_id, question_number ASC);

-- Storage bucket setup for interview audio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'interview-audio',
    'interview-audio',
    false,
    20971520, -- 20MB max
    ARRAY['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/webm;codecs=opus']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 20971520;

-- Storage RLS Policies
CREATE POLICY "Users can access their own interview audio"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'interview-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own interview audio"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'interview-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own interview audio"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'interview-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own interview audio"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'interview-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

NOTIFY pgrst, 'reload schema';
