import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import type { Answer, GameSession, SessionMode } from '../types'
import './ResultsPage.css'

interface LocationState {
  tables: number[]
  mode: SessionMode
  answers: Answer[]
  durationMs: number
}

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function stars(correct: number, total: number) {
  const pct = total > 0 ? correct / total : 0
  if (pct >= 0.9) return '⭐⭐⭐'
  if (pct >= 0.7) return '⭐⭐'
  return '⭐'
}

export default function ResultsPage() {
  const nav = useNavigate()
  const { state } = useLocation() as { state: LocationState }
  const { saveSession } = useSessions()

  const answers = state?.answers ?? []
  const correct = answers.filter((a) => a.correct)
  const wrong = answers.filter((a) => !a.correct)

  useEffect(() => {
    if (!state) return
    const session: GameSession = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      tables: state.tables,
      mode: state.mode,
      answers: state.answers,
      durationMs: state.durationMs,
    }
    saveSession(session)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page results-page">
      <div className="results-hero">
        <div className="results-stars">{stars(correct.length, answers.length)}</div>
        <h1>Sessione completata!</h1>
        <div className="results-summary">
          <div className="results-stat correct-stat">
            <span className="stat-num">{correct.length}</span>
            <span className="stat-label">corrette</span>
          </div>
          <div className="results-stat wrong-stat">
            <span className="stat-num">{wrong.length}</span>
            <span className="stat-label">sbagliate</span>
          </div>
          <div className="results-stat time-stat">
            <span className="stat-num">{formatDuration(state?.durationMs ?? 0)}</span>
            <span className="stat-label">durata</span>
          </div>
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="card">
          <p className="results-section-title">Hai sbagliato:</p>
          <div className="wrong-list">
            {wrong.map((a, i) => (
              <div key={i} className="wrong-item">
                <span className="wrong-calc">
                  {a.questionType === 'missing_factor'
                    ? `${a.question.a} × ? = ${a.question.a * a.question.b}`
                    : `${a.question.a} × ${a.question.b}`}
                </span>
                <span className="wrong-detail">
                  hai risposto {a.userAnswer} (corretto: {a.correctAnswer})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div className="results-actions">
        <button className="btn btn-primary" onClick={() => nav('/play')}>▶ Gioca ancora</button>
        <button className="btn btn-ghost" onClick={() => nav('/stats')}>📊 Statistiche</button>
        <button className="btn btn-ghost" onClick={() => nav('/')}>🏠 Home</button>
      </div>
    </div>
  )
}
