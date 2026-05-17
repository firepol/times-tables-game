import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useChallenges } from '../hooks/useChallenges'
import { scoreChallenge } from '../engine/scoring'
import type { ChallengeConfig, ChallengeSession } from '../types'
import './ChallengeResultsPage.css'

interface LocationState {
  config: ChallengeConfig
  sessions: ChallengeSession[]
}

function stars(correct: number, total: number) {
  const pct = total > 0 ? correct / total : 0
  if (pct >= 0.9) return '⭐⭐⭐'
  if (pct >= 0.7) return '⭐⭐'
  return '⭐'
}

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function ChallengeResultsPage() {
  const nav = useNavigate()
  const { t } = useTranslation()
  const { state } = useLocation() as { state: LocationState }
  const { saveRun } = useChallenges()
  const savedRef = useRef(false)

  const config = state?.config
  const sessions = state?.sessions ?? []
  const totalScore = scoreChallenge(sessions, config)

  useEffect(() => {
    if (!state || savedRef.current) return
    savedRef.current = true
    saveRun({
      id: crypto.randomUUID(),
      configId: config.id,
      config,
      date: new Date().toISOString(),
      sessions,
      totalScore,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function playAgain() {
    nav('/game', {
      state: {
        tables: config.tables,
        count: config.questionsPerSession,
        mode: config.mode,
        timedMode: config.timedMode,
        timerSeconds: config.timerSeconds,
        challengeCtx: {
          config,
          sessionIdx: 0,
          prevSessions: [],
        },
      },
    })
  }

  if (!config) return null

  return (
    <div className="page challenge-results-page">
      <div className="cr-hero">
        <div className="cr-trophy">🏆</div>
        <h1>{t('challenge.complete')}</h1>
        <div className="cr-total-score">
          <span className="cr-score-num">{totalScore}</span>
          <span className="cr-score-label">{t('challenge.totalScore')}</span>
        </div>
      </div>

      <div className="card cr-sessions">
        {sessions.map((s, i) => {
          const correct = s.answers.filter((a) => a.correct).length
          const total = s.answers.length
          const score = scoreChallenge([s], config)
          return (
            <div key={i} className="cr-session-row">
              <div className="cr-session-label">
                {t('challenge.session', { n: i + 1 })}
                <span className="cr-session-stars">{stars(correct, total)}</span>
              </div>
              <div className="cr-session-meta">
                <span className="cr-correct">{correct}/{total} {t('challenge.correct')}</span>
                <span className="cr-dur">⏱{formatDuration(s.durationMs)}</span>
                <span className="cr-pts">+{score} pt</span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="cr-score-hint">{t('challenge.scoreExplained')}</p>

      <div className="cr-actions">
        <button className="btn btn-primary" onClick={playAgain}>{t('challenge.playAgain')}</button>
        <button className="btn btn-secondary" onClick={() => nav('/challenge')}>{t('challenge.backToChallenges')}</button>
        <button className="btn btn-ghost" onClick={() => nav('/')}>{t('results.home')}</button>
      </div>
    </div>
  )
}
