import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import { useWeakCalcs } from '../hooks/useWeakCalcs'
import type { GameSession } from '../types'
import './StatsPage.css'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function CalcErrorBar({ calcKey, sessions, lastN }: { calcKey: string; sessions: GameSession[]; lastN: number }) {
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
        <span className="calc-total">{total} err</span>
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
  const { sessions } = useSessions()
  const [lastN, setLastN] = useState(10)
  const weakCalcs = useWeakCalcs(sessions, lastN)

  const recent = sessions.slice(-lastN).reverse()

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav('/')}>←</button>
        <h2>Statistiche</h2>
        <span className="sessions-count">{sessions.length}/100</span>
      </div>

      <div className="stats-filter">
        <span className="filter-label">Ultime:</span>
        {[5, 10, 20, sessions.length].map((n) => (
          <button
            key={n}
            className={`filter-btn ${lastN === n ? 'active' : ''}`}
            onClick={() => setLastN(n)}
          >
            {n === sessions.length ? 'Tutte' : n}
          </button>
        ))}
      </div>

      {weakCalcs.length > 0 && (
        <div className="card">
          <p className="stats-section-title">Calcoli più difficili</p>
          <p className="stats-legend">✍ = risposta digitata  •  MC = scelta multipla  •  ↔ = drag&drop</p>
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
            Allena questi calcoli
          </button>
        </div>
      )}

      <div className="card">
        <p className="stats-section-title">Sessioni recenti</p>
        {recent.length === 0 ? (
          <p className="no-sessions">Nessuna sessione ancora. Gioca la prima!</p>
        ) : (
          <div className="session-list">
            {recent.map((s) => {
              const correct = s.answers.filter((a) => a.correct).length
              const total = s.answers.length
              return (
                <div key={s.id} className="session-row" onClick={() => nav(`/stats/${s.id}`)}>
                  <div className="session-date">{formatDate(s.date)}</div>
                  <div className="session-meta">
                    <span>{total} dom</span>
                    <span className="ok">{correct}✓</span>
                    <span className="ko">{total - correct}✗</span>
                    <span className="dur">⏱{formatDuration(s.durationMs)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
