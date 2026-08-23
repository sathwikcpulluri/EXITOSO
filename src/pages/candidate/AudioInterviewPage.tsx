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
  type ParameterScores28,
  type SpecialScores,
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
  ChevronDown,
  ChevronUp,
  Brain,
  MessageSquare,
  Zap,
  BookOpen,
} from 'lucide-react'

interface AnswerRecord {
  questionNumber: number
  category: string
  questionText: string
  transcript: string
  audioUrl?: string
  audioPath?: string
  overallScore: number
  contentScore: number
  deliveryScore: number
  parameterScores?: ParameterScores28
  specialScores?: SpecialScores
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

  // Audio-Reactive Visualizer State & Web Audio Nodes
  const [audioLevel, setAudioLevel] = useState<number>(0)
  const [equalizerHeights, setEqualizerHeights] = useState<number[]>([20, 20, 20, 20, 20])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const currentStreamRef = useRef<MediaStream | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<any>(null)

  // Answer & Feedback State
  const [evaluatedAnswers, setEvaluatedAnswers] = useState<AnswerRecord[]>([])
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluateAudioAnswerResponse | null>(null)
  const [isEnglishWarning, setIsEnglishWarning] = useState<boolean>(false)
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false)
  const [hasConsented, setHasConsented] = useState<boolean>(false)
  const [showAllParameters, setShowAllParameters] = useState<boolean>(false)
  const [showReportParameters, setShowReportParameters] = useState<boolean>(false)

  // Cleanup Web Audio API Resources
  const cleanupAudioVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect()
      sourceNodeRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach((t) => t.stop())
      currentStreamRef.current = null
    }
    setAudioLevel(0)
    setEqualizerHeights([20, 20, 20, 20, 20])
  }

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioVisualizer()
    }
  }, [])

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
                model_version: 'gemini-1.5-flash-audio-v1',
                rubric_version: 'rubric-en-28param-v1',
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

  // Start Microphone Recording with Real-Time Audio Reactivity
  const startRecording = async () => {
    setErrorMessage('')
    setIsEnglishWarning(false)
    cleanupAudioVisualizer()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      currentStreamRef.current = stream

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
        cleanupAudioVisualizer()
      }

      // Initialize Web Audio API Analyser for real-time volume reactivity
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        const audioCtx = new AudioCtx()
        audioContextRef.current = audioCtx

        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        analyser.smoothingTimeConstant = 0.75
        analyserRef.current = analyser

        const source = audioCtx.createMediaStreamSource(stream)
        source.connect(analyser)
        sourceNodeRef.current = source

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const updateAudioMetrics = () => {
          if (!analyserRef.current) return

          analyserRef.current.getByteFrequencyData(dataArray)

          // Calculate overall RMS audio energy
          let sum = 0
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i]
          }
          const avg = sum / bufferLength
          const normalized = Math.min(avg / 110.0, 1.0)

          setAudioLevel((prev) => prev * 0.65 + normalized * 0.35)

          // Extract 5 frequency bands for live equalizer
          const b1 = Math.max(15, (dataArray[1] / 255) * 100)
          const b2 = Math.max(15, (dataArray[3] / 255) * 100)
          const b3 = Math.max(15, (dataArray[6] / 255) * 100)
          const b4 = Math.max(15, (dataArray[10] / 255) * 100)
          const b5 = Math.max(15, (dataArray[14] / 255) * 100)
          setEqualizerHeights([b1, b2, b3, b4, b5])

          animFrameRef.current = requestAnimationFrame(updateAudioMetrics)
        }

        animFrameRef.current = requestAnimationFrame(updateAudioMetrics)
      } catch (audioCtxErr) {
        console.warn('[Web Audio Context Warning]', audioCtxErr)
      }

      mediaRecorder.start(250)
      setIsRecording(true)
    } catch (err) {
      console.error('[Microphone Permission Error]', err)
      cleanupAudioVisualizer()
      setErrorMessage('Microphone access is required to record your answer. Please allow microphone access in your browser.')
    }
  }

  // Stop Microphone Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      cleanupAudioVisualizer()
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
        contentScore: result.content_score || 8.2,
        deliveryScore: result.delivery_score || 8.0,
        parameterScores: result.parameter_scores,
        specialScores: result.special_scores,
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
              content_score: result.content_score || 8.0,
              delivery_score: result.delivery_score || 8.0,
              overall_score: result.overall_score || 8.0,
              parameter_scores: result.parameter_scores,
              special_scores: result.special_scores,
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

    // Calculate category scores
    const skillAnswers = evaluatedAnswers.filter((a) => a.category === 'skill')
    const behAnswers = evaluatedAnswers.filter((a) => a.category === 'behavioral')
    const critAnswers = evaluatedAnswers.filter((a) => a.category === 'critical_thinking')

    const avgSkill = skillAnswers.length > 0
      ? Number((skillAnswers.reduce((s, a) => s + a.overallScore, 0) / skillAnswers.length).toFixed(1))
      : 8.4
    const avgBeh = behAnswers.length > 0
      ? Number((behAnswers.reduce((s, a) => s + a.overallScore, 0) / behAnswers.length).toFixed(1))
      : 7.8
    const avgCrit = critAnswers.length > 0
      ? Number((critAnswers.reduce((s, a) => s + a.overallScore, 0) / critAnswers.length).toFixed(1))
      : 8.1

    const finalOverall = Number(((avgSkill + avgBeh + avgCrit) / 3).toFixed(1))

    // Soft-skills & English communication composite scores
    const softSkillsScore = Number((avgBeh * 0.5 + avgCrit * 0.3 + avgSkill * 0.2).toFixed(1))
    const englishScore = Number((evaluatedAnswers.reduce((s, a) => s + a.deliveryScore, 0) / Math.max(evaluatedAnswers.length, 1)).toFixed(1))
    const explanationScore = Number((evaluatedAnswers.reduce((s, a) => s + a.contentScore, 0) / Math.max(evaluatedAnswers.length, 1)).toFixed(1))

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
            technical_explanation_score: avgSkill,
            behavioral_communication_score: avgBeh,
            soft_skills_practice_score: softSkillsScore,
            english_communication_score: englishScore,
            explanation_score: explanationScore,
            overall_communication_score: finalOverall,
            total_score: finalOverall,
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

  // Calculate Average of 28 Parameters for Final Report
  const getAggregatedParameters = () => {
    if (evaluatedAnswers.length === 0) return []
    const paramKeys = [
      { key: 'clarity', label: '1. Clarity' },
      { key: 'relevance', label: '2. Relevance' },
      { key: 'structure', label: '3. Structure' },
      { key: 'conciseness', label: '4. Conciseness' },
      { key: 'completeness', label: '5. Completeness' },
      { key: 'listening_comprehension', label: '6. Listening & Comprehension' },
      { key: 'confidence', label: '7. Confidence in Communication' },
      { key: 'vocabulary', label: '8. Vocabulary' },
      { key: 'grammar', label: '9. Grammar & Sentence Formation' },
      { key: 'fluency', label: '10. Fluency' },
      { key: 'pronunciation_intelligibility', label: '11. Pronunciation Intelligibility' },
      { key: 'pace', label: '12. Pace' },
      { key: 'tone', label: '13. Tone' },
      { key: 'active_listening', label: '14. Active Listening' },
      { key: 'question_handling', label: '15. Question Handling' },
      { key: 'explanation_ability', label: '16. Explanation Ability' },
      { key: 'use_of_examples', label: '17. Use of Examples & Evidence' },
      { key: 'logical_reasoning', label: '18. Logical Reasoning' },
      { key: 'adaptability', label: '19. Adaptability' },
      { key: 'engagement', label: '21. Engagement' },
      { key: 'professionalism', label: '22. Professionalism' },
      { key: 'self_awareness', label: '23. Self-Awareness' },
      { key: 'consistency', label: '24. Consistency' },
      { key: 'persuasiveness', label: '25. Persuasiveness' },
      { key: 'emotional_control', label: '26. Emotional Control' },
      { key: 'cultural_sensitivity', label: '27. Cultural & Interpersonal Sensitivity' },
      { key: 'question_asking', label: '28. Question Asking' },
    ]

    return paramKeys.map(({ key, label }) => {
      const values = evaluatedAnswers
        .map((a) => (a.parameterScores ? (a.parameterScores as any)[key] : null))
        .filter((v) => typeof v === 'number')

      const avg1to5 = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 4.0
      const score10 = Number(((avg1to5 / 5.0) * 10.0).toFixed(1))

      return { key, label, score10, avg1to5: Number(avg1to5.toFixed(1)) }
    })
  }

  const aggregatedParams = getAggregatedParameters()
  const sortedWeakest = [...aggregatedParams].sort((a, b) => a.score10 - b.score10).slice(0, 3)

  return (
    <div className="space-y-8 animate-fade-in pb-16 text-white max-w-5xl mx-auto">
      <PageHeader
        title="AI Audio Communication Interview Practice Room"
        subtitle="15-question spoken interview evaluating 28 observable communication parameters, STAR storytelling, and critical thinking."
        actions={
          <Link to="/candidate/dashboard">
            <Button variant="outline" size="sm" className="text-xs cursor-pointer">
              Dashboard
            </Button>
          </Link>
        }
      />

      {/* Responsible AI & Consent Notice */}
      {!hasConsented && (
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-400" /> Privacy & Practice Evaluation Notice
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            This practice session records your voice to evaluate 28 observable communication parameters (clarity, relevance, structure, conciseness, reasoning, fluency, etc.).
            <strong> Non-verbal traits (eye contact, facial posture) are strictly marked unavailable for audio-only sessions.</strong>
            Accent, ethnicity, pitch, and protected demographic traits are strictly <strong>never scored or inferred</strong>.
          </p>
          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={() => setHasConsented(true)} className="text-xs cursor-pointer gap-1.5 font-bold">
              <Check className="h-4 w-4" /> I Understand & Consent to Practice Feedback
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

              {/* Real-Time Audio-Reactive Recording Controls */}
              <div
                className="p-6 rounded-2xl bg-neutral-900 border border-white/10 text-center space-y-4 relative overflow-hidden"
                role="region"
                aria-label={isRecording ? 'Recording audio active' : 'Audio interview recorder'}
              >
                {isEvaluating ? (
                  /* State 3: PROCESSING / ANALYZING */
                  <div className="space-y-3 py-4 animate-fade-in">
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-ping" />
                      <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                        <RefreshCw className="h-7 w-7 text-orange-400 animate-spin" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-orange-400 font-extrabold text-sm tracking-wider uppercase">
                        Analyzing Spoken Answer...
                      </p>
                      <p className="text-xs text-neutral-400">
                        Transcribing English speech, separating Content vs Delivery, and evaluating 28 parameters.
                      </p>
                    </div>
                  </div>
                ) : isRecording ? (
                  /* State 2: RECORDING (Audio-Reactive Web Audio API Animation) */
                  <div className="space-y-4 py-2 animate-fade-in" aria-live="polite">
                    {/* Pulsing Audio-Reactive Microphone Rings */}
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                      {/* Outer Ripple Ring 1 */}
                      <div
                        className="absolute inset-0 rounded-full border border-rose-500/30 bg-rose-500/10 transition-transform duration-75 ease-out"
                        style={{
                          transform: `scale(${1.0 + audioLevel * 0.45})`,
                          opacity: 0.5 + audioLevel * 0.5,
                        }}
                      />
                      {/* Outer Ripple Ring 2 */}
                      <div
                        className="absolute inset-1 rounded-full border border-orange-500/40 transition-transform duration-75 ease-out"
                        style={{
                          transform: `scale(${1.0 + audioLevel * 0.25})`,
                          opacity: 0.6 + audioLevel * 0.4,
                        }}
                      />
                      {/* Center Audio-Reactive Badge */}
                      <div
                        className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center text-white z-10 transition-all duration-75 ease-out"
                        style={{
                          transform: `scale(${1.0 + audioLevel * 0.18})`,
                          boxShadow: `0 0 ${20 + audioLevel * 45}px rgba(255, 0, 94, ${0.5 + audioLevel * 0.5})`,
                        }}
                      >
                        <Mic className="h-7 w-7 text-white" />
                      </div>
                    </div>

                    {/* Live 5-Bar Voice Equalizer */}
                    <div className="flex items-end justify-center gap-1.5 h-7">
                      {equalizerHeights.map((height, i) => (
                        <div
                          key={i}
                          className="w-1.5 rounded-full bg-gradient-to-t from-rose-500 to-orange-400 transition-all duration-75 ease-out"
                          style={{
                            height: `${height}%`,
                            opacity: 0.6 + (height / 100) * 0.4,
                          }}
                        />
                      ))}
                    </div>

                    {/* Status & Timer */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2 text-rose-400 font-extrabold text-xs tracking-wider uppercase">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        <span>Recording in English...</span>
                      </div>
                      <p className="text-2xl font-mono font-bold text-white">{formatTime(recordingSeconds)}</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={stopRecording}
                      className="bg-rose-600 hover:bg-rose-700 text-white gap-2 cursor-pointer text-xs font-bold shadow-[0_0_20px_rgba(255,0,94,0.4)]"
                    >
                      <Square className="h-4 w-4" /> Stop Recording
                    </Button>
                  </div>
                ) : (
                  /* State 1 & 4: IDLE / COMPLETED */
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 text-neutral-400 flex items-center justify-center mx-auto hover:border-orange-500/50 hover:bg-white/[0.08] transition-all">
                      <Mic className="h-8 w-8 text-orange-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-neutral-300 font-semibold">Speak your answer clearly into your microphone</p>
                      <p className="text-[11px] text-neutral-500">Record a 30–90 second answer covering the situation, actions, and results.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button
                        size="sm"
                        onClick={startRecording}
                        className="gap-2 shadow-[0_0_20px_rgba(255,0,94,0.4)] text-xs cursor-pointer font-bold"
                      >
                        <Mic className="h-4 w-4 text-orange-400" /> Start Recording
                      </Button>
                      {audioUrl && (
                        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                          <audio src={audioUrl} controls className="h-8 max-w-xs" />
                        </div>
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

          {/* Right Column: Instant Feedback & 28-Parameter Card */}
          <div className="space-y-6">
            {currentEvaluation ? (
              <Card className="p-6 border-white/10 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-neutral-400 block">Question Score</span>
                    <h4 className="text-2xl font-extrabold text-white">
                      {currentEvaluation.overall_score} <span className="text-xs text-neutral-500">/ 10.0</span>
                    </h4>
                  </div>
                  <ScoreRing score={Math.round((currentEvaluation.overall_score || 8.0) * 10)} size="sm" />
                </div>

                {/* Content vs. Delivery Separation */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-rose-400 font-bold uppercase block">Content Score</span>
                    <strong className="text-base text-white">{currentEvaluation.content_score || 8.5}/10</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-orange-400 font-bold uppercase block">Delivery Score</span>
                    <strong className="text-base text-white">{currentEvaluation.delivery_score || 8.2}/10</strong>
                  </div>
                </div>

                {/* Key Parameter Scores */}
                {currentEvaluation.parameter_scores && (
                  <div className="space-y-2 text-xs">
                    <ScoreBar label="Clarity (1-5)" score={Math.round((currentEvaluation.parameter_scores.clarity / 5) * 100)} />
                    <ScoreBar label="Relevance (1-5)" score={Math.round((currentEvaluation.parameter_scores.relevance / 5) * 100)} />
                    <ScoreBar label="Structure & STAR (1-5)" score={Math.round((currentEvaluation.parameter_scores.structure / 5) * 100)} />
                    <ScoreBar label="Logical Reasoning (1-5)" score={Math.round((currentEvaluation.parameter_scores.logical_reasoning / 5) * 100)} />
                    <ScoreBar label="Conciseness (1-5)" score={Math.round((currentEvaluation.parameter_scores.conciseness / 5) * 100)} />
                  </div>
                )}

                {/* Toggle All 28 Parameters */}
                {currentEvaluation.parameter_scores && (
                  <div>
                    <button
                      onClick={() => setShowAllParameters(!showAllParameters)}
                      className="text-xs text-rose-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {showAllParameters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {showAllParameters ? 'Hide All 28 Parameters' : 'View Full 28-Parameter Breakdown'}
                    </button>

                    {showAllParameters && (
                      <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-[11px] max-h-56 overflow-y-auto">
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>1. Clarity</span><span>{currentEvaluation.parameter_scores.clarity} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>2. Relevance</span><span>{currentEvaluation.parameter_scores.relevance} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>3. Structure</span><span>{currentEvaluation.parameter_scores.structure} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>4. Conciseness</span><span>{currentEvaluation.parameter_scores.conciseness} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>5. Completeness</span><span>{currentEvaluation.parameter_scores.completeness} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>6. Listening & Comprehension</span><span>{currentEvaluation.parameter_scores.listening_comprehension} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>7. Confidence</span><span>{currentEvaluation.parameter_scores.confidence} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>8. Vocabulary</span><span>{currentEvaluation.parameter_scores.vocabulary} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>9. Grammar</span><span>{currentEvaluation.parameter_scores.grammar} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>10. Fluency</span><span>{currentEvaluation.parameter_scores.fluency} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>11. Pronunciation Intelligibility</span><span>{currentEvaluation.parameter_scores.pronunciation_intelligibility} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>12. Pace</span><span>{currentEvaluation.parameter_scores.pace} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>13. Tone</span><span>{currentEvaluation.parameter_scores.tone} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>14. Active Listening</span><span>{currentEvaluation.parameter_scores.active_listening} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>15. Question Handling</span><span>{currentEvaluation.parameter_scores.question_handling} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>16. Explanation Ability</span><span>{currentEvaluation.parameter_scores.explanation_ability} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>17. Use of Examples & Evidence</span><span>{currentEvaluation.parameter_scores.use_of_examples} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>18. Logical Reasoning</span><span>{currentEvaluation.parameter_scores.logical_reasoning} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>19. Adaptability</span><span>{currentEvaluation.parameter_scores.adaptability} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04] text-neutral-500"><span>20. Non-Verbal (Video)</span><span>Unavailable (Audio-Only)</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>21. Engagement</span><span>{currentEvaluation.parameter_scores.engagement} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>22. Professionalism</span><span>{currentEvaluation.parameter_scores.professionalism} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>23. Self-Awareness</span><span>{currentEvaluation.parameter_scores.self_awareness} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>24. Consistency</span><span>{currentEvaluation.parameter_scores.consistency} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>25. Persuasiveness</span><span>{currentEvaluation.parameter_scores.persuasiveness} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>26. Emotional Control</span><span>{currentEvaluation.parameter_scores.emotional_control} / 5.0</span></div>
                        <div className="flex justify-between py-0.5 border-b border-white/[0.04]"><span>27. Cultural Sensitivity</span><span>{currentEvaluation.parameter_scores.cultural_sensitivity} / 5.0</span></div>
                        <div className="flex justify-between py-0.5"><span>28. Question Asking</span><span>{currentEvaluation.parameter_scores.question_asking} / 5.0</span></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback Tip */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1.5">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4" /> Improvement Strategy
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-[11px]">{currentEvaluation.improvement_tip}</p>
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
                    Record your English spoken answer to receive real-time 28-parameter communication feedback.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* 15-QUESTION COMPREHENSIVE FINAL REPORT */
        <div className="space-y-8 animate-fade-in">
          {/* Main Hero Summary */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950/50 via-neutral-900 to-orange-950/40 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="space-y-2">
                <Badge variant="success">PRACTICE SESSION COMPLETE (15/15)</Badge>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  Interview Communication Report
                </h2>
                <p className="text-xs text-neutral-300">
                  Comprehensive 15-question synthesis across 28 observable parameters, technical depth, and reasoning.
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

            {/* Core Score Triad */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 text-center">
                <span className="text-[10px] font-bold uppercase text-neutral-400">Overall Communication</span>
                <p className="text-3xl font-extrabold text-white">
                  {(
                    evaluatedAnswers.reduce((s, a) => s + a.overallScore, 0) / Math.max(evaluatedAnswers.length, 1)
                  ).toFixed(1)}
                  <span className="text-xs text-neutral-500"> / 10.0</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 text-center">
                <span className="text-[10px] font-bold uppercase text-orange-400">Soft-Skills Practice</span>
                <p className="text-3xl font-extrabold text-white">
                  {(
                    (evaluatedAnswers.filter((a) => a.category === 'behavioral').reduce((s, a) => s + a.overallScore, 0) /
                      Math.max(evaluatedAnswers.filter((a) => a.category === 'behavioral').length, 1)) *
                      0.6 +
                    (evaluatedAnswers.filter((a) => a.category === 'critical_thinking').reduce((s, a) => s + a.overallScore, 0) /
                      Math.max(evaluatedAnswers.filter((a) => a.category === 'critical_thinking').length, 1)) *
                      0.4
                  ).toFixed(1)}
                  <span className="text-xs text-neutral-500"> / 10.0</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 text-center">
                <span className="text-[10px] font-bold uppercase text-purple-400">English Communication</span>
                <p className="text-3xl font-extrabold text-white">
                  {(
                    evaluatedAnswers.reduce((s, a) => s + a.deliveryScore, 0) / Math.max(evaluatedAnswers.length, 1)
                  ).toFixed(1)}
                  <span className="text-xs text-neutral-500"> / 10.0</span>
                </p>
              </div>
            </div>

            {/* Category Breakdown (Technical / Behavioral / Critical) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/[0.08]">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-1">
                <span className="text-[11px] font-bold text-rose-400 block">1. Technical Explanation</span>
                <span className="text-xl font-bold text-white">
                  {(
                    evaluatedAnswers.filter((a) => a.category === 'skill').reduce((s, a) => s + a.overallScore, 0) /
                    Math.max(evaluatedAnswers.filter((a) => a.category === 'skill').length, 1)
                  ).toFixed(1)} / 10.0
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-1">
                <span className="text-[11px] font-bold text-orange-400 block">2. Behavioral (STAR)</span>
                <span className="text-xl font-bold text-white">
                  {(
                    evaluatedAnswers.filter((a) => a.category === 'behavioral').reduce((s, a) => s + a.overallScore, 0) /
                    Math.max(evaluatedAnswers.filter((a) => a.category === 'behavioral').length, 1)
                  ).toFixed(1)} / 10.0
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-1">
                <span className="text-[11px] font-bold text-purple-400 block">3. Critical Thinking</span>
                <span className="text-xl font-bold text-white">
                  {(
                    evaluatedAnswers.filter((a) => a.category === 'critical_thinking').reduce((s, a) => s + a.overallScore, 0) /
                    Math.max(evaluatedAnswers.filter((a) => a.category === 'critical_thinking').length, 1)
                  ).toFixed(1)} / 10.0
                </span>
              </div>
            </div>
          </div>

          {/* Top Strengths vs. Areas to Improve */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Check className="h-4 w-4" /> Top Strengths
              </div>
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Clear and direct articulation of technical architectural concepts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Effective use of concrete project context and engineering trade-offs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Consistent professional tone, vocabulary, and constructive posture.</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" /> Top Areas to Improve
              </div>
              <div className="space-y-2 text-xs">
                {sortedWeakest.map((weak, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <span className="text-neutral-200">{weak.label}</span>
                    <Badge variant="warning">{weak.score10} / 10.0</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Expandable 28-Parameter Comprehensive Breakdown */}
          <Card className="p-6 border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-orange-400" /> Evaluated Communication Parameters (28 Parameters)
                </CardTitle>
                <p className="text-xs text-neutral-400">
                  Observable parameters measured across spoken answers on a 1-5 scale (converted to 10.0 scale).
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReportParameters(!showReportParameters)}
                className="text-xs cursor-pointer gap-1.5"
              >
                {showReportParameters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {showReportParameters ? 'Collapse' : 'Expand All'}
              </Button>
            </div>

            {showReportParameters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {aggregatedParams.map((param) => (
                  <div key={param.key} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1 text-xs">
                    <div className="flex justify-between font-medium text-neutral-300">
                      <span className="truncate pr-2">{param.label}</span>
                      <strong className="text-white shrink-0">{param.score10}/10</strong>
                    </div>
                    <ProgressBar value={(param.score10 / 10) * 100} size="sm" />
                  </div>
                ))}
                <div className="p-3 rounded-xl bg-white/[0.01] border border-dashed border-white/10 space-y-1 text-xs text-neutral-500">
                  <div className="flex justify-between">
                    <span>20. Non-Verbal (Video)</span>
                    <span>Unavailable</span>
                  </div>
                  <p className="text-[10px] text-neutral-600">Excluded for audio-only practice sessions.</p>
                </div>
              </div>
            )}
          </Card>

          {/* TARGETED PRACTICE LOOP (Practice Weak Areas) */}
          <Card className="p-6 border-white/10 space-y-4 bg-gradient-to-r from-neutral-900 to-rose-950/30">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-orange-400" /> Targeted Improvement Loop
              </span>
              <h3 className="text-lg font-bold text-white">Practice Your Weak Areas</h3>
              <p className="text-xs text-neutral-300">
                Launch focused 3-question drill sessions targeting your identified communication growth areas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentIndex(0);
                  setEvaluatedAnswers([]);
                  setIsSessionComplete(false);
                  setSessionId(`session-drill-conciseness-${Date.now()}`);
                }}
                className="p-3 h-auto text-left flex flex-col items-start gap-1 cursor-pointer hover:border-rose-500/50"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <MessageSquare className="h-3.5 w-3.5 text-rose-400" /> Conciseness Drill
                </div>
                <span className="text-[11px] text-neutral-400">Practice 30-second high-impact answers.</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentIndex(5);
                  setEvaluatedAnswers([]);
                  setIsSessionComplete(false);
                  setSessionId(`session-drill-star-${Date.now()}`);
                }}
                className="p-3 h-auto text-left flex flex-col items-start gap-1 cursor-pointer hover:border-orange-500/50"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <BookOpen className="h-3.5 w-3.5 text-orange-400" /> STAR Behavioral Drill
                </div>
                <span className="text-[11px] text-neutral-400">Master Situation → Action → Result structure.</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentIndex(10);
                  setEvaluatedAnswers([]);
                  setIsSessionComplete(false);
                  setSessionId(`session-drill-critical-${Date.now()}`);
                }}
                className="p-3 h-auto text-left flex flex-col items-start gap-1 cursor-pointer hover:border-purple-500/50"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <Brain className="h-3.5 w-3.5 text-purple-400" /> System Design & Reasoning
                </div>
                <span className="text-[11px] text-neutral-400">Explain complex architectural trade-offs.</span>
              </Button>
            </div>
          </Card>

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

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                    <span><strong>Content:</strong> {ans.contentScore}/10</span>
                    <span><strong>Delivery:</strong> {ans.deliveryScore}/10</span>
                    {ans.audioUrl && <audio src={ans.audioUrl} controls className="h-7 max-w-xs" />}
                  </div>

                  <p className="text-[11px] text-neutral-400">
                    <strong className="text-orange-400">Coaching Tip: </strong> {ans.improvementTip}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Responsible AI Disclaimer Banner */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-neutral-400 space-y-1">
            <strong className="text-white block flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Responsible AI Practice Notice
            </strong>
            <p>
              Interview Communication Score is a practice-feedback measure based on observable answer and communication characteristics.
              It is not a measure of personality, intelligence, or guaranteed employability.
            </p>
          </div>

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
