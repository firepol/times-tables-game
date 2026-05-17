import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSessions } from '../hooks/useSessions'
import { useWeakCalcs } from '../hooks/useWeakCalcs'
import type { GameSession } from '../types'
import './StatsPage.css'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function CalcErrorBar({ calcKey, sessions, lastN }: { calcKey: string; sessions: GameSession[]; lastN: number }) {
  const { t } = useTranslation()
  const recent = sessions.slice(-lastN)
  const [rawA, rawB] = calcKey.split('x')
  const a = parseInt(rawA), b = parseInt(rawB)

  let typedErrors = 0, mcErrors = 0, dragErrors = 0
  recent.forEach((s) =>
    s.answers
      .filter((ans) => !ans.correct && ans.question.a === a && ans.question.b === b)
      .forEach((ans) => {
        if (ans.questionType === 'classic_mc') mcErrors++
        else if (ans.questionType === 'drag_drop') dragErrors++
        else typedErrors++
      })
  )
  const total = typedErrors + mcErrors + dragErrors
  const maxBar = 5

  return (
    <div className="calc-error-bar">
      <div className="calc-error-label">
        <span className="calc-name">{a} × {b} = {a * b}</span>
        <span className="calc-total">{t('stats.errors', { n: total })}</span>
      </div>
      <div className="calc-error-bar-fill">
        {Array.from({ length: Math.min(total, maxBar) }).map((_, i) => (
          <div key={i} className="bar-block" />
        ))}
      </div>
      <div className="calc-error-types">
        {typedErrors > 0 && <span className="err-typed">✍{typedErrors}</span>}
        {mcErrors > 0 && <span className="err-mc">MC{mcErrors}</span>}
        {dragErrors > 0 && <span className="err-drag">↔{dragErrors}</span>}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const nav = useNavigate()
  const { t } = useTranslation()
  const { sessions, clearSessions } = useSessions()
  const [lastN, setLastN] = useState(10)
  const weakCalcs = useWeakCalcs(sessions, lastN)

  const handleReset = useCallback(() => {
    if (window.confirm(t('stats.resetConfirm'))) {
      clearSessions()
      setLastN(10)
    }
  }, [clearSessions, t])

  const recent = sessions.slice(-lastN).reverse()

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav('/')}>←</button>
        <h2>{t('stats.title')}</h2>
        <span className="sessions-count">{sessions.length}/100</span>
      </div>

      <div className="stats-filter">
        <span className="filter-label">{t('stats.last')}</span>
        {[5, 10, 20, sessions.length].map((n) => (
          <button
            key={n}
            className={`filter-btn ${lastN === n ? 'active' : ''}`}
            onClick={() => setLastN(n)}
          >
            {n === sessions.length ? t('stats.all') : n}
          </button>
        ))}
      </div>

      {weakCalcs.length > 0 && (
        <div className="card">
          <p className="stats-section-title">{t('stats.hardestCalcs')}</p>
          <p className="stats-legend">{t('stats.legend')}</p>
          <div className="weak-list">
            {weakCalcs.slice(0, 8).map((key) => (
              <CalcErrorBar key={key} calcKey={key} sessions={sessions} lastN={lastN} />
            ))}
          </div>
          <button
            className="btn btn-secondary"
            style={{ marginTop: 16, padding: '12px' }}
            onClick={() => nav('/play', { state: { focusCalcKeys: weakCalcs } })}
          >
            {t('stats.trainWeak')}
          </button>
        </div>
      )}

      <div className="card">
        <p className="stats-section-title">{t('stats.recentSessions')}</p>
        {recent.length === 0 ? (
          <p className="no-sessions">{t('stats.noSessions')}</p>
        ) : (
          <div className="session-list">
            {recent.map((s) => {
              const correctCount = s.answers.filter((a) => a.correct).length
              const total = s.answers.length
              return (
                <div key={s.id} className="session-row" onClick={() => nav(`/stats/${s.id}`)}>
                  <div className="session-date">{formatDate(s.date)}</div>
                  <div className="session-meta">
                    <span>{t('stats.questions', { n: total })}</span>
                    <span className="ok">{correctCount}✓</span>
                    <span className="ko">{total - correctCount}✗</span>
                    <span className="dur">⏱{formatDuration(s.durationMs)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {sessions.length > 0 && (
        <button className="btn btn-danger" onClick={handleReset}>
          {t('stats.reset')}
        </button>
      )}
    </div>
  )
}
