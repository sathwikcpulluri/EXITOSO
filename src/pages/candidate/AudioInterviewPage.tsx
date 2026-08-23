import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import {
  api,
  type InterviewQuestionItem,
  type EvaluateAudioAnswerResponse,
} from '@/lib/api'
import {
  Mic,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  Volume2,
  RotateCcw,
  Check,
  HelpCircle,
  Square,
  Globe2,
} from 'lucide-react'

interface AnswerRecord {
  questionNumber: number
  category: string
  questionText: string
  transcript: string
  audioUrl?: string
  audioPath?: string
  overallScore: number
  scores: any
  strengths: string[]
  weaknesses: string[]
  feedback: string
  improvementTip: string
}

export default function AudioInterviewPage() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const targetJobTitle = searchParams.get('job') || 'Software Engineer'

  // Candidate Profile
  const [candidateSkills, setCandidateSkills] = useState<string[]>([])
  const [candidateExperience, setCandidateExperience] = useState<number>(3)
  const [candidateHeadline, setCandidateHeadline] = useState<string>('')

  // 15-Question State
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [sessionId, setSessionId] = useState<string>(`session-${Date.now()}`)
  const [sessionDbId, setSessionDbId] = useState<string | null>(null)

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState<string>('')
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Answer & Feedback State
  const [evaluatedAnswers, setEvaluatedAnswers] = useState<AnswerRecord[]>([])
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluateAudioAnswerResponse | null>(null)
  const [isEnglishWarning, setIsEnglishWarning] = useState<boolean>(false)
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false)
  const [hasConsented, setHasConsented] = useState<boolean>(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<any>(null)

  // 1. Fetch Candidate Profile from Supabase
  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          return
        }

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle()
        const meta = authUser.user_metadata || {}

        const finalHeadline = profile?.headline || meta.headline || ''
        const finalYears = profile?.experience_years !== undefined ? Number(profile.experience_years) : (meta.experience_years ?? 3)

        const rawSkills = profile?.skills || meta.skills
        const cleanSkills: string[] = Array.isArray(rawSkills)
          ? rawSkills.map((s: any) => (typeof s === 'string' ? s : s.name)).filter(Boolean)
          : []

        setCandidateHeadline(finalHeadline)
        setCandidateExperience(finalYears)
        setCandidateSkills(cleanSkills.length > 0 ? cleanSkills : ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Git'])
      } catch (err) {
        console.error('[AudioInterview Profile Load]', err)
      }
    }

    loadProfile()
  }, [user?.id])

  // 2. Generate 15 Resume-Aware Interview Questions
  useEffect(() => {
    async function generateQuestions() {
      if (candidateSkills.length === 0) return
      try {
        const res = await api.generateInterviewQuestions({
          candidate_skills: candidateSkills,
          candidate_experience_years: candidateExperience,
          candidate_headline: candidateHeadline,
          job_title: targetJobTitle,
        })
        setQuestions(res.questions)

        // Create Supabase session record
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser?.id) {
          const { data: newSession } = await supabase
            .from('interview_practice_sessions')
            .insert([
              {
                user_id: authUser.id,
                target_role: targetJobTitle,
                resume_version: 'Primary Tailored Profile',
                status: 'in_progress',
              },
            ])
            .select()
            .single()

          if (newSession) {
            setSessionDbId(newSession.id)
          }
        }
      } catch (err) {
        console.error('[Generate Questions Error]', err)
      }
    }

    generateQuestions()
  }, [candidateSkills.length])

  // Timer Effect
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0)
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [isRecording])

  // Start Microphone Recording
  const startRecording = async () => {
    setErrorMessage('')
    setIsEnglishWarning(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      let mimeType = 'audio/webm'
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : ''
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' })
        setAudioBlob(audioBlob)
        setAudioUrl(URL.createObjectURL(audioBlob))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(250)
      setIsRecording(true)
    } catch (err) {
      console.error('[Microphone Permission Error]', err)
      setErrorMessage('Microphone access is required for audio interview practice. Please allow microphone access.')
    }
  }

  // Stop Microphone Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Submit Answer for AI Audio & Content Evaluation
  const handleEvaluateAnswer = async () => {
    const currentQ = questions[currentIndex]
    if (!currentQ) return

    if (!audioBlob && !textAnswer.trim()) {
      setErrorMessage('Please record your spoken answer or enter your response.')
      return
    }

    setIsEvaluating(true)
    setErrorMessage('')
    setIsEnglishWarning(false)

    try {
      let audioStoragePath = ''

      // Upload to private Supabase Storage bucket: interview-audio/{user_id}/{session_id}/{question_id}.webm
      if (audioBlob) {
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser()

          if (authUser?.id) {
            const filePath = `${authUser.id}/${sessionId}/${currentQ.id}.webm`
            const { error: uploadErr } = await supabase.storage
              .from('interview-audio')
              .upload(filePath, audioBlob, { upsert: true })

            if (!uploadErr) {
              audioStoragePath = filePath
            }
          }
        } catch (uploadErr) {
          console.warn('[Audio Storage Upload Warning]', uploadErr)
        }
      }

      // Send to Backend Evaluator
      const formData = new FormData()
      if (audioBlob) {
        formData.append('audio_file', audioBlob, `${currentQ.id}.webm`)
      }
      if (textAnswer.trim()) {
        formData.append('transcript_text', textAnswer.trim())
      }
      formData.append('question_text', currentQ.question_text)
      formData.append('category', currentQ.category)
      formData.append('expected_topics', JSON.stringify(currentQ.expected_topics))

      const result = await api.evaluateAudioAnswer(formData)

      // Handle Non-English Detection
      if (!result.is_english) {
        setIsEnglishWarning(true)
        setIsEvaluating(false)
        return
      }

      setCurrentEvaluation(result)

      const answerRecord: AnswerRecord = {
        questionNumber: currentQ.question_number,
        category: currentQ.category,
        questionText: currentQ.question_text,
        transcript: result.transcript,
        audioUrl: audioUrl || undefined,
        audioPath: audioStoragePath || undefined,
        overallScore: result.overall_score || 8.0,
        scores: result.scores || {},
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        feedback: result.feedback,
        improvementTip: result.improvement_tip,
      }

      setEvaluatedAnswers((prev) => [...prev.filter((p) => p.questionNumber !== currentQ.question_number), answerRecord])

      // Persist answer to Supabase
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser?.id && sessionDbId) {
          await supabase.from('interview_practice_answers').insert([
            {
              session_id: sessionDbId,
              user_id: authUser.id,
              question_id: currentQ.id,
              question_number: currentQ.question_number,
              category: currentQ.category,
              question_text: currentQ.question_text,
              audio_path: audioStoragePath,
              transcript: result.transcript,
              language: result.language,
              language_confidence: result.language_confidence,
              relevance_score: result.scores?.relevance || 8.0,
              clarity_score: result.scores?.clarity || 8.0,
              structure_score: result.scores?.structure || 8.0,
              completeness_score: result.scores?.completeness || 8.0,
              reasoning_score: result.scores?.reasoning || 8.0,
              evidence_score: result.scores?.evidence || 8.0,
              professional_communication_score: result.scores?.professional_communication || 8.0,
              conciseness_score: result.scores?.conciseness || 8.0,
              overall_score: result.overall_score || 8.0,
              feedback: result.feedback,
              improvement_tip: result.improvement_tip,
              strengths: result.strengths,
              weaknesses: result.weaknesses,
            },
          ])
        }
      } catch (dbErr) {
        console.warn('[Save Answer DB Warning]', dbErr)
      }
    } catch (err) {
      console.error('[Evaluation Error]', err)
      setErrorMessage('Could not evaluate this answer. Please try again.')
    } finally {
      setIsEvaluating(false)
    }
  }

  // Advance to Next Question
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setAudioBlob(null)
      setAudioUrl(null)
      setTextAnswer('')
      setCurrentEvaluation(null)
      setIsEnglishWarning(false)
      setErrorMessage('')
    } else {
      finishSession()
    }
  }

  // Finish Full 15-Question Session
  const finishSession = async () => {
    setIsSessionComplete(true)

    // Calculate category and total scores
    const skillAnswers = evaluatedAnswers.filter((a) => a.category === 'skill')
    const behAnswers = evaluatedAnswers.filter((a) => a.category === 'behavioral')
    const critAnswers = evaluatedAnswers.filter((a) => a.category === 'critical_thinking')

    const avgSkill = skillAnswers.length > 0
      ? Number((skillAnswers.reduce((s, a) => s + a.overallScore, 0) / skillAnswers.length).toFixed(1))
      : 8.0
    const avgBeh = behAnswers.length > 0
      ? Number((behAnswers.reduce((s, a) => s + a.overallScore, 0) / behAnswers.length).toFixed(1))
      : 8.0
    const avgCrit = critAnswers.length > 0
      ? Number((critAnswers.reduce((s, a) => s + a.overallScore, 0) / critAnswers.length).toFixed(1))
      : 8.0

    const finalTotal = Number(((avgSkill + avgBeh + avgCrit) / 3).toFixed(1))

    // Update Supabase session record
    if (sessionDbId) {
      try {
        await supabase
          .from('interview_practice_sessions')
          .update({
            completed_at: new Date().toISOString(),
            skill_score: avgSkill,
            behavioral_score: avgBeh,
            critical_thinking_score: avgCrit,
            total_score: finalTotal,
            status: 'completed',
          })
          .eq('id', sessionDbId)
      } catch (err) {
        console.warn('[Session Complete DB Update Warning]', err)
      }
    }
  }

  // Category counts
  const currentQ = questions[currentIndex]
  const skillDone = evaluatedAnswers.filter((a) => a.category === 'skill').length
  const behDone = evaluatedAnswers.filter((a) => a.category === 'behavioral').length
  const critDone = evaluatedAnswers.filter((a) => a.category === 'critical_thinking').length

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16 text-white max-w-5xl mx-auto">
      <PageHeader
        title="AI Audio Communication Interview Practice Room"
        subtitle="15-question spoken interview practice evaluating technical depth, STAR communication, and critical thinking."
        actions={
          <Link to="/candidate/dashboard">
            <Button variant="outline" size="sm" className="text-xs cursor-pointer">
              Dashboard
            </Button>
          </Link>
        }
      />

      {/* Privacy & Consent Banner */}
      {!hasConsented && (
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-400" /> Privacy & Practice Evaluation Notice
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            This practice session records your voice so it can be transcribed and evaluated for interview-practice feedback.
            Your answers are evaluated on observable criteria: <strong>relevance, clarity, structure, completeness, reasoning, and evidence</strong>.
            Accent, ethnicity, pitch, and demographic characteristics are strictly <strong>never scored or inferred</strong>.
          </p>
          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={() => setHasConsented(true)} className="text-xs cursor-pointer gap-1.5 font-bold">
              <Check className="h-4 w-4" /> I Understand & Consent to Voice Practice
            </Button>
          </div>
        </div>
      )}

      {/* Progress & Category Tracker */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">
              Question {currentIndex + 1} / {questions.length || 15}
            </span>
            <Badge variant="info">{currentQ?.category_label || 'Skill-Based'}</Badge>
          </div>
          <span className="text-neutral-400">Target Role: <strong className="text-white">{targetJobTitle}</strong></span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex justify-between font-bold text-[11px]">
              <span className="text-rose-400">1. Skill Questions</span>
              <span>{skillDone}/5</span>
            </div>
            <ProgressBar value={(skillDone / 5) * 100} color="primary" size="sm" />
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex justify-between font-bold text-[11px]">
              <span className="text-orange-400">2. Behavioral (STAR)</span>
              <span>{behDone}/5</span>
            </div>
            <ProgressBar value={(behDone / 5) * 100} color="primary" size="sm" />
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="flex justify-between font-bold text-[11px]">
              <span className="text-purple-400">3. Critical Thinking</span>
              <span>{critDone}/5</span>
            </div>
            <ProgressBar value={(critDone / 5) * 100} color="primary" size="sm" />
          </div>
        </div>
      </div>

      {/* English-Only Warning Banner */}
      {isEnglishWarning && (
        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white block">Please answer this interview question in English.</strong>
              <span>Our speech recognition and communication rubric currently evaluates spoken English responses.</span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setIsEnglishWarning(false); setAudioBlob(null); setAudioUrl(null); }} className="text-xs cursor-pointer">
            Retry Answer
          </Button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2.5 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!isSessionComplete ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Middle: Active Question & Audio Recorder */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-white/10 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-wider">
                    {currentQ?.category_label || 'Interview Prompt'}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">English Spoken Response</span>
                </div>
                <h3 className="text-xl font-bold text-white leading-relaxed">
                  {currentQ?.question_text || 'Loading resume-tailored question...'}
                </h3>
              </div>

              {/* Expected Architecture / Discussion Topics */}
              {currentQ?.expected_topics && (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5 text-orange-400" /> Key Discussion Focus Areas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentQ.expected_topics.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-neutral-300 text-[11px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Audio Recording Controls */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-white/10 text-center space-y-4">
                {isRecording ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,0,94,0.5)]">
                      <Mic className="h-8 w-8 text-rose-400 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-rose-400 font-extrabold text-sm tracking-wider uppercase">
                        Recording in English...
                      </p>
                      <p className="text-2xl font-mono font-bold text-white">{formatTime(recordingSeconds)}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={stopRecording}
                      className="bg-rose-600 hover:bg-rose-700 text-white gap-2 cursor-pointer text-xs"
                    >
                      <Square className="h-4 w-4" /> Stop Recording
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 text-neutral-400 flex items-center justify-center mx-auto">
                      <Mic className="h-8 w-8 text-orange-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-neutral-300 font-semibold">Speak your answer clearly into your microphone</p>
                      <p className="text-[11px] text-neutral-500">Record a 30–90 second answer covering the situation, actions, and results.</p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        size="sm"
                        onClick={startRecording}
                        className="gap-2 shadow-[0_0_20px_rgba(255,0,94,0.4)] text-xs cursor-pointer font-bold"
                      >
                        <Mic className="h-4 w-4 text-orange-400" /> Start Recording
                      </Button>
                      {audioUrl && (
                        <audio src={audioUrl} controls className="h-9 max-w-xs" />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Text Alternative */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Or Type Your Spoken Transcript / Key Notes
                </label>
                <textarea
                  rows={3}
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Optional: Type or paste your spoken answer for direct text analysis..."
                  className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs outline-none focus:border-rose-500 resize-none font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setAudioBlob(null); setAudioUrl(null); setTextAnswer(''); }}
                  className="text-xs cursor-pointer gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Clear Audio
                </Button>

                <Button
                  size="sm"
                  disabled={isEvaluating || isRecording || (!audioBlob && !textAnswer.trim())}
                  onClick={handleEvaluateAnswer}
                  className="gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)] text-xs cursor-pointer font-bold"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Evaluating Answer Content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-orange-400" /> Evaluate Answer
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Instant Feedback & 8-Factor Score Card */}
          <div className="space-y-6">
            {currentEvaluation && currentEvaluation.scores ? (
              <Card className="p-6 border-white/10 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-neutral-400 block">Communication Score</span>
                    <h4 className="text-2xl font-extrabold text-white">
                      {currentEvaluation.overall_score} <span className="text-xs text-neutral-500">/ 10.0</span>
                    </h4>
                  </div>
                  <ScoreRing score={Math.round((currentEvaluation.overall_score || 8.0) * 10)} size="sm" />
                </div>

                {/* 8-Factor Breakdown */}
                <div className="space-y-2 text-xs">
                  <ScoreBar label="Relevance (20%)" score={Math.round(currentEvaluation.scores.relevance * 10)} />
                  <ScoreBar label="Clarity (20%)" score={Math.round(currentEvaluation.scores.clarity * 10)} />
                  <ScoreBar label="Structure & STAR (15%)" score={Math.round(currentEvaluation.scores.structure * 10)} />
                  <ScoreBar label="Completeness (15%)" score={Math.round(currentEvaluation.scores.completeness * 10)} />
                  <ScoreBar label="Reasoning & 'Why' (15%)" score={Math.round(currentEvaluation.scores.reasoning * 10)} />
                  <ScoreBar label="Evidence & Metrics (15%)" score={Math.round(currentEvaluation.scores.evidence * 10)} />
                </div>

                {/* Feedback Tip */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1.5">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4" /> Improvement Strategy
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-[11px]">{currentEvaluation.improvement_tip}</p>
                </div>

                {/* Transcript Summary */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-neutral-400 font-mono max-h-28 overflow-y-auto">
                  <strong className="text-neutral-300 block mb-1">Recognized Transcript:</strong>
                  "{currentEvaluation.transcript}"
                </div>

                <Button onClick={handleNextQuestion} className="w-full gap-1.5 text-xs font-bold cursor-pointer">
                  {currentIndex < questions.length - 1 ? (
                    <>
                      Next Question <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      View Full Completion Report <Award className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </Card>
            ) : (
              <Card className="p-8 text-center border-white/10 space-y-3">
                <Volume2 className="h-10 w-10 mx-auto opacity-30 text-rose-400" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">No Evaluation Yet</h4>
                  <p className="text-xs text-neutral-400">
                    Record your English spoken answer to receive real-time 8-factor communication feedback.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* 15-QUESTION FINAL COMPLETION REPORT */
        <div className="space-y-6 animate-fade-in">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950/50 via-neutral-900 to-orange-950/40 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="space-y-2">
                <Badge variant="success">PRACTICE SESSION COMPLETE (15/15)</Badge>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  Communication Practice Report
                </h2>
                <p className="text-xs text-neutral-300">
                  Comprehensive 15-question performance synthesis across technical depth, behavioral storytelling, and architecture.
                </p>
              </div>

              <div className="text-center shrink-0">
                <ScoreRing
                  score={Math.round(
                    (evaluatedAnswers.reduce((s, a) => s + a.overallScore, 0) / Math.max(evaluatedAnswers.length, 1)) * 10
                  )}
                  size="lg"
                />
                <span className="text-[10px] text-rose-400 uppercase font-bold block mt-1">Overall Practice Score</span>
              </div>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-center">
                <span className="text-[10px] font-bold uppercase text-rose-400">1. Skill Answers</span>
                <p className="text-2xl font-extrabold text-white">
                  {(
                    evaluatedAnswers.filter((a) => a.category === 'skill').reduce((s, a) => s + a.overallScore, 0) /
                    Math.max(evaluatedAnswers.filter((a) => a.category === 'skill').length, 1)
                  ).toFixed(1)}
                  <span className="text-xs text-neutral-500"> / 10.0</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-center">
                <span className="text-[10px] font-bold uppercase text-orange-400">2. Behavioral (STAR)</span>
                <p className="text-2xl font-extrabold text-white">
                  {(
                    evaluatedAnswers.filter((a) => a.category === 'behavioral').reduce((s, a) => s + a.overallScore, 0) /
                    Math.max(evaluatedAnswers.filter((a) => a.category === 'behavioral').length, 1)
                  ).toFixed(1)}
                  <span className="text-xs text-neutral-500"> / 10.0</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-center">
                <span className="text-[10px] font-bold uppercase text-purple-400">3. Critical Thinking</span>
                <p className="text-2xl font-extrabold text-white">
                  {(
                    evaluatedAnswers.filter((a) => a.category === 'critical_thinking').reduce((s, a) => s + a.overallScore, 0) /
                    Math.max(evaluatedAnswers.filter((a) => a.category === 'critical_thinking').length, 1)
                  ).toFixed(1)}
                  <span className="text-xs text-neutral-500"> / 10.0</span>
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Question-by-Question Review */}
          <Card className="p-6 border-white/10 space-y-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-orange-400" /> Answer-by-Answer Communication Breakdown
              </CardTitle>
            </CardHeader>

            <div className="space-y-3">
              {evaluatedAnswers.map((ans) => (
                <div key={ans.questionNumber} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-rose-400">
                        Q{ans.questionNumber} • {ans.category}
                      </span>
                      <h4 className="font-bold text-white text-sm mt-0.5">{ans.questionText}</h4>
                    </div>
                    <Badge variant={ans.overallScore >= 8.0 ? 'success' : 'warning'}>
                      {ans.overallScore} / 10.0
                    </Badge>
                  </div>

                  <p className="text-neutral-300 font-mono text-[11px] bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                    "{ans.transcript}"
                  </p>

                  <p className="text-[11px] text-neutral-400">
                    <strong className="text-orange-400">Coaching Tip: </strong> {ans.improvementTip}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10 text-xs">
            <span className="text-neutral-400">Session saved to your Supabase account history.</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentIndex(0);
                  setEvaluatedAnswers([]);
                  setIsSessionComplete(false);
                  setSessionId(`session-${Date.now()}`);
                }}
                className="gap-1.5 text-xs cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Start New Session
              </Button>
              <Link to="/candidate/dashboard">
                <Button size="sm" className="text-xs cursor-pointer">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
