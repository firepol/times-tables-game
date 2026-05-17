import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSessions } from '../hooks/useSessions'
import type { Answer, GameSession, SessionMode } from '../types'
import type { ChallengeCtx } from './GamePage'
import './ResultsPage.css'

interface LocationState {
  tables: number[]
  mode: SessionMode
  answers: Answer[]
  durationMs: number
  challengeCtx?: ChallengeCtx
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
  const challengeCtx = state?.challengeCtx

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

  function handleNextSession() {
    if (!challengeCtx) return
    const currentSession = { answers: state.answers, durationMs: state.durationMs }
    const updatedCtx: ChallengeCtx = {
      ...challengeCtx,
      sessionIdx: challengeCtx.sessionIdx + 1,
      prevSessions: [...challengeCtx.prevSessions, currentSession],
    }
    nav('/game', {
      state: {
        tables: challengeCtx.config.tables,
        count: challengeCtx.config.questionsPerSession,
        mode: challengeCtx.config.mode,
        timedMode: challengeCtx.config.timedMode,
        timerSeconds: challengeCtx.config.timerSeconds,
        challengeCtx: updatedCtx,
      },
    })
  }

  function handleChallengeComplete() {
    if (!challengeCtx) return
    const currentSession = { answers: state.answers, durationMs: state.durationMs }
    const allSessions = [...challengeCtx.prevSessions, currentSession]
    nav('/challenge/results', {
      state: { config: challengeCtx.config, sessions: allSessions },
      replace: true,
    })
  }

  const isLastChallengeSession = challengeCtx
    ? challengeCtx.sessionIdx === challengeCtx.config.sessionCount - 1
    : false

  return (
    <div className="page results-page">
      <div className="results-hero">
        {challengeCtx && (
          <div className="challenge-session-badge">
            {t('challenge.session', { n: challengeCtx.sessionIdx + 1 })}
            {' / '}{challengeCtx.config.sessionCount}
          </div>
        )}
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

      <div className="results-actions">
        {challengeCtx ? (
          isLastChallengeSession ? (
            <button className="btn btn-primary" onClick={handleChallengeComplete}>
              {t('challenge.complete')}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleNextSession}>
              {t('challenge.nextSession', {
                n: challengeCtx.sessionIdx + 2,
                total: challengeCtx.config.sessionCount,
              })}
            </button>
          )
        ) : (
          <>
            <button className="btn btn-primary" onClick={() => nav('/play')}>{t('results.playAgain')}</button>
            <button className="btn btn-ghost" onClick={() => nav('/stats')}>{t('results.stats')}</button>
            <button className="btn btn-ghost" onClick={() => nav('/')}>{t('results.home')}</button>
          </>
        )}
      </div>
    </div>
  )
}
