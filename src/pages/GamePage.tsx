import { useRef, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { buildSession } from '../engine/questionGenerator'
import type { Answer, SessionItem, SessionMode } from '../types'
import NumberPad from '../components/NumberPad'
import MultipleChoice from '../components/MultipleChoice'
import DragDropBoard from '../components/DragDropBoard'
import CountdownBar from '../components/CountdownBar'
import './GamePage.css'

interface LocationState {
  tables: number[]
  count: number
  mode: SessionMode
  focusCalcKeys?: string[]
  timedMode?: boolean
  timerSeconds?: number
}

type FeedbackState = 'idle' | 'correct' | 'wrong'

export default function GamePage() {
  const nav = useNavigate()
  const { state } = useLocation() as { state: LocationState }

  const [items] = useState<SessionItem[]>(() =>
    buildSession(state?.tables ?? [2,3,4,5], state?.count ?? 15, state?.mode ?? 'mixed', state?.focusCalcKeys)
  )
  const [idx, setIdx] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [answers, setAnswers] = useState<Answer[]>([])
  const startTimeRef = useRef(Date.now())
  const qStartRef = useRef(Date.now())

  const timedMode = state?.timedMode ?? false
  const timerSeconds = state?.timerSeconds ?? 4
  const timedOutRef = useRef(false)

  const totalItems = items.length
  const current = items[idx]

  const advance = useCallback(() => {
    const nextIdx = idx + 1
    if (nextIdx >= totalItems) {
      nav('/results', {
        state: {
          tables: state?.tables ?? [],
          mode: state?.mode ?? 'mixed',
          answers,
          durationMs: Date.now() - startTimeRef.current,
        },
        replace: true,
      })
    } else {
      setIdx(nextIdx)
      setFeedback('idle')
      timedOutRef.current = false
      qStartRef.current = Date.now()
    }
  }, [idx, totalItems, answers, nav, state])

  const handleSingleAnswer = useCallback((userAnswer: number, correctAnswer: number, a: number, b: number, type: Answer['questionType']) => {
    if (feedback !== 'idle') return
    const correct = userAnswer === correctAnswer
    const answer: Answer = {
      question: { a, b },
      questionType: type,
      correct,
      userAnswer,
      correctAnswer,
      timeMs: Date.now() - qStartRef.current,
    }
    setAnswers((prev) => [...prev, answer])
    setFeedback(correct ? 'correct' : 'wrong')
    if (navigator.vibrate) navigator.vibrate(correct ? 50 : [80, 40, 80])
    setTimeout(advance, correct ? 600 : 1200)
  }, [feedback, advance])

  const handleDragComplete = useCallback((blockAnswers: Answer[]) => {
    setAnswers((prev) => [...prev, ...blockAnswers])
    setTimeout(advance, 300)
  }, [advance])

  const handleSingleTimeout = useCallback(() => {
    if (feedback !== 'idle' || timedOutRef.current) return
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
    setAnswers((prev) => [...prev, answer])
    setFeedback('wrong')
    if (navigator.vibrate) navigator.vibrate([80, 40, 80])
    setTimeout(advance, 1200)
  }, [feedback, items, idx, timerSeconds, advance])

  if (!items.length) {
    return (
      <div className="page">
        <p>Nessuna domanda disponibile. Controlla le impostazioni.</p>
        <button className="btn btn-primary" onClick={() => nav('/')}>Home</button>
      </div>
    )
  }

  // Count answered questions (drag blocks count as multiple)
  const answeredCount = answers.length

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
          <p className="game-instruction">Abbina ogni calcolo al risultato!</p>
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
                  maxDigits={2}
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
