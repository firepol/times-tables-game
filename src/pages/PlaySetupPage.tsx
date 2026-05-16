import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { useSessions } from '../hooks/useSessions'
import { useWeakCalcs } from '../hooks/useWeakCalcs'
import type { SessionMode } from '../types'
import './PlaySetupPage.css'

const MODES: Array<{ value: SessionMode; label: string }> = [
  { value: 'mixed', label: '★ Mista' },
  { value: 'drag_drop', label: '↔ Drag & Drop' },
  { value: 'multiple_choice', label: '◉ Scelta Multipla' },
  { value: 'typed', label: '✎ Scrivi risultato' },
]

export default function PlaySetupPage() {
  const nav = useNavigate()
  const { settings } = useSettings()
  const { sessions } = useSessions()
  const weakCalcs = useWeakCalcs(sessions)
  const [mode, setMode] = useState<SessionMode>(settings.sessionMode)

  function start(focusCalcKeys?: string[]) {
    nav('/game', {
      state: {
        tables: settings.selectedTables,
        count: settings.questionsPerSession,
        mode,
        focusCalcKeys,
      },
    })
  }

  const top3 = weakCalcs.slice(0, 3)

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav('/')}>←</button>
        <h2>Inizia sessione</h2>
      </div>

      <div className="card setup-info">
        <span className="setup-label">Tabelle</span>
        <span className="setup-value">{settings.selectedTables.join(', ')}</span>
        <span className="setup-label">Domande</span>
        <span className="setup-value">{settings.questionsPerSession}</span>
      </div>

      <div className="card">
        <p className="settings-section-title">Modalità</p>
        <div className="mode-chips">
          {MODES.map((m) => (
            <button
              key={m.value}
              className={`mode-chip ${mode === m.value ? 'active' : ''}`}
              onClick={() => setMode(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {top3.length > 0 && (
        <div className="card hint-card">
          <p className="hint-title">💡 Hai degli errori frequenti:</p>
          <p className="hint-calcs">
            {top3.map((k) => {
              const [a, b] = k.split('x')
              return `${a}×${b}=${parseInt(a) * parseInt(b)}`
            }).join('  •  ')}
          </p>
          <button className="btn btn-secondary hint-btn" onClick={() => start(weakCalcs)}>
            Allena questi calcoli
          </button>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <button className="btn btn-primary" onClick={() => start()}>
        ▶ Inizia
      </button>
    </div>
  )
}
