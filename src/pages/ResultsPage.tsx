import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
        <h1>{t('results.title')}</h1>
        <div className="results-summary">
          <div className="results-stat correct-stat">
            <span className="stat-num">{correct.length}</span>
            <span className="stat-label">{t('results.correct')}</span>
          </div>
          <div className="results-stat wrong-stat">
            <span className="stat-num">{wrong.length}</span>
            <span className="stat-label">{t('results.wrong')}</span>
          </div>
          <div className="results-stat time-stat">
            <span className="stat-num">{formatDuration(state?.durationMs ?? 0)}</span>
            <span className="stat-label">{t('results.duration')}</span>
          </div>
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="card">
          <p className="results-section-title">{t('results.mistakesTitle')}</p>
          <div className="wrong-list">
            {wrong.map((a, i) => (
              <div key={i} className="wrong-item">
                <span className="wrong-calc">
                  {a.questionType === 'missing_factor'
                    ? `${a.question.a} × ? = ${a.question.a * a.question.b}`
                    : `${a.question.a} × ${a.question.b}`}
                </span>
                <span className="wrong-detail">
                  {a.userAnswer === -1
                    ? t('results.youAnsweredTimeout')
                    : t('results.youAnswered', { got: a.userAnswer, expected: a.correctAnswer })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div className="results-actions">
        <button className="btn btn-primary" onClick={() => nav('/play')}>{t('results.playAgain')}</button>
        <button className="btn btn-ghost" onClick={() => nav('/stats')}>{t('results.stats')}</button>
        <button className="btn btn-ghost" onClick={() => nav('/')}>{t('results.home')}</button>
      </div>
    </div>
  )
}
