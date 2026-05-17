import { useRef, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { buildSession } from '../engine/questionGenerator'
import type { Answer, SessionItem, SessionMode, ChallengeConfig, ChallengeSession } from '../types'
import NumberPad from '../components/NumberPad'
import MultipleChoice from '../components/MultipleChoice'
import DragDropBoard from '../components/DragDropBoard'
import CountdownBar from '../components/CountdownBar'
import './GamePage.css'

export interface ChallengeCtx {
  config: ChallengeConfig
  sessionIdx: number
  prevSessions: ChallengeSession[]
}

interface LocationState {
  tables: number[]
  count: number
  mode: SessionMode
  focusCalcKeys?: string[]
  timedMode?: boolean
  timerSeconds?: number
  challengeCtx?: ChallengeCtx
}

type FeedbackState = 'idle' | 'correct' | 'wrong'

export default function GamePage() {
  const nav = useNavigate()
  const { t } = useTranslation()
  const { state } = useLocation() as { state: LocationState }

  const [items] = useState<SessionItem[]>(() =>
    buildSession(state?.tables ?? [2,3,4,5], state?.count ?? 15, state?.mode ?? 'mixed', state?.focusCalcKeys)
  )
  const [idx, setIdx] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  // answersRef is the source of truth; answeredCount is just for UI display
  const answersRef = useRef<Answer[]>([])
  const [answeredCount, setAnsweredCount] = useState(0)
  const startTimeRef = useRef(Date.now())
  const qStartRef = useRef(Date.now())

  const timedMode = state?.timedMode ?? false
  const timerSeconds = state?.timerSeconds ?? 4
  // answeredRef: set synchronously when an answer is submitted, guards the timer race condition
  const answeredRef = useRef(false)
  const timedOutRef = useRef(false)

  const totalItems = items.length
  const current = items[idx]

  const addAnswer = useCallback((answer: Answer) => {
    answersRef.current = [...answersRef.current, answer]
    setAnsweredCount(answersRef.current.length)
  }, [])

  const addAnswers = useCallback((newAnswers: Answer[]) => {
    answersRef.current = [...answersRef.current, ...newAnswers]
    setAnsweredCount(answersRef.current.length)
  }, [])

  const advance = useCallback(() => {
    const nextIdx = idx + 1
    if (nextIdx >= totalItems) {
      nav('/results', {
        state: {
          tables: state?.tables ?? [],
          mode: state?.mode ?? 'mixed',
          answers: answersRef.current,
          durationMs: Date.now() - startTimeRef.current,
          challengeCtx: state?.challengeCtx,
        },
        replace: true,
      })
    } else {
      setIdx(nextIdx)
      setFeedback('idle')
      answeredRef.current = false
      timedOutRef.current = false
      qStartRef.current = Date.now()
    }
  }, [idx, totalItems, nav, state])

  const handleSingleAnswer = useCallback((userAnswer: number, correctAnswer: number, a: number, b: number, type: Answer['questionType']) => {
    if (feedback !== 'idle') return
    // Set synchronously before any state changes — guards against the timer race condition
    // where onExpire fires asynchronously before React re-renders with new feedback state
    answeredRef.current = true
    const correct = userAnswer === correctAnswer
    const answer: Answer = {
      question: { a, b },
      questionType: type,
      correct,
      userAnswer,
      correctAnswer,
      timeMs: Date.now() - qStartRef.current,
    }
    addAnswer(answer)
    setFeedback(correct ? 'correct' : 'wrong')
    if (navigator.vibrate) navigator.vibrate(correct ? 50 : [80, 40, 80])
    setTimeout(advance, correct ? 600 : 1200)
  }, [feedback, advance, addAnswer])

  const handleDragComplete = useCallback((blockAnswers: Answer[]) => {
    addAnswers(blockAnswers)
    setTimeout(advance, 300)
  }, [advance, addAnswers])

  const handleSingleTimeout = useCallback(() => {
    // Use refs (not stale closure state) to guard against the race condition where
    // the timer fires via setTimeout just as the user submits an answer
    if (answeredRef.current || timedOutRef.current) return
    timedOutRef.current = true
    const q = (items[idx] as { kind: 'single'; question: { a: number; b: number; type: Answer['questionType'] } }).question
    const answer: Answer = {
      question: { a: q.a, b: q.b },
      questionType: q.type,
      correct: false,
      userAnswer: -1,
      correctAnswer: q.type === 'missing_factor' ? q.b : q.a * q.b,
      timeMs: timerSeconds * 1000,
    }
    addAnswer(answer)
    setFeedback('wrong')
    if (navigator.vibrate) navigator.vibrate([80, 40, 80])
    setTimeout(advance, 1200)
  }, [items, idx, timerSeconds, advance, addAnswer])

  if (!items.length) {
    return (
      <div className="page">
        <p>{t('game.noQuestions')}</p>
        <button className="btn btn-primary" onClick={() => nav('/')}>{t('results.home')}</button>
      </div>
    )
  }

  return (
    <div className="page game-page">
      <div className="game-header">
        <button className="back-btn" onClick={() => nav('/')}>✕</button>
        <div className="progress-dots">
          {items.map((item, i) => {
            const isBlock = item.kind === 'drag_block'
            return (
              <div
                key={i}
                className={`progress-dot ${isBlock ? 'wide' : ''} ${i < idx ? 'done' : i === idx ? 'current' : ''}`}
              />
            )
          })}
        </div>
      </div>

      {current.kind === 'drag_block' ? (
        <div className="game-body">
          <p className="game-instruction">{t('game.matchInstruction')}</p>
          <DragDropBoard
            key={idx}
            pairs={current.pairs}
            onComplete={handleDragComplete}
            timeLimit={timedMode ? current.pairs.length * timerSeconds : undefined}
          />
        </div>
      ) : (
        <div className="game-body">
          {timedMode && (
            <CountdownBar
              key={idx}
              seconds={timerSeconds}
              onExpire={handleSingleTimeout}
              paused={feedback !== 'idle'}
            />
          )}
          {current.question.type === 'missing_factor' ? (
            <QuestionDisplay
              top={`${current.question.a} × ? = ${current.question.a * current.question.b}`}
              feedback={feedback}
              correctLabel={`? = ${current.question.b}`}
            />
          ) : (
            <QuestionDisplay
              top={`${current.question.a} × ${current.question.b}`}
              feedback={feedback}
              correctLabel={`= ${current.question.a * current.question.b}`}
            />
          )}

          {feedback === 'idle' && (
            <>
              {current.question.type === 'classic_mc' ? (
                <MultipleChoice
                  a={current.question.a}
                  b={current.question.b}
                  onAnswer={(v) =>
                    handleSingleAnswer(v, current.question.a * current.question.b, current.question.a, current.question.b, 'classic_mc')
                  }
                />
              ) : current.question.type === 'missing_factor' ? (
                <NumberPad
                  maxDigits={1}
                  onSubmit={(v) =>
                    handleSingleAnswer(v, current.question.b, current.question.a, current.question.b, 'missing_factor')
                  }
                />
              ) : (
                <NumberPad
                  maxDigits={current.question.a * current.question.b < 10 ? 1 : 2}
                  onSubmit={(v) =>
                    handleSingleAnswer(v, current.question.a * current.question.b, current.question.a, current.question.b, 'classic_typed')
                  }
                />
              )}
            </>
          )}
        </div>
      )}

      <div className="game-footer">
        <span className="game-count">{answeredCount} / {state?.count ?? 15}</span>
      </div>
    </div>
  )
}

function QuestionDisplay({ top, feedback, correctLabel }: { top: string; feedback: FeedbackState; correctLabel: string }) {
  return (
    <div className={`question-card ${feedback}`}>
      <div className="question-formula">{top}</div>
      {feedback === 'correct' && <div className="question-feedback correct-text">✓ {correctLabel}</div>}
      {feedback === 'wrong'   && <div className="question-feedback wrong-text">✗ {correctLabel}</div>}
    </div>
  )
}
