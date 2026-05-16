import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import type { SessionMode } from '../types'
import './SettingsPage.css'

const PRESETS: Array<{ label: string; tables: number[] }> = [
  { label: 'Facili', tables: [2, 5] },
  { label: 'Medie', tables: [3, 4, 6] },
  { label: 'Difficili', tables: [7, 8, 9] },
  { label: 'Tutte', tables: [2, 3, 4, 5, 6, 7, 8, 9] },
]

const MODES: Array<{ value: SessionMode; label: string }> = [
  { value: 'mixed', label: '★ Mista (consigliata)' },
  { value: 'drag_drop', label: '↔ Solo Drag & Drop' },
  { value: 'multiple_choice', label: '◉ Solo Scelta Multipla' },
  { value: 'typed', label: '✎ Solo Scrivi risultato' },
]

export default function SettingsPage() {
  const nav = useNavigate()
  const {
    settings, toggleTable, setTables, setQuestionsPerSession,
    setSessionMode, setTimedMode, setTimerSeconds,
  } = useSettings()

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav('/')}>←</button>
        <h2>Impostazioni</h2>
      </div>

      <div className="card">
        <p className="settings-section-title">Tabelle da allenare</p>
        <div className="table-grid">
          {[2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
            <button
              key={t}
              className={`table-btn ${settings.selectedTables.includes(t) ? 'active' : ''}`}
              onClick={() => toggleTable(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="preset-row">
          {PRESETS.map((p) => (
            <button key={p.label} className="preset-btn" onClick={() => setTables(p.tables)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="settings-section-title">Domande per sessione</p>
        <div className="count-row">
          {[10, 15, 20].map((n) => (
            <button
              key={n}
              className={`count-btn ${settings.questionsPerSession === n ? 'active' : ''}`}
              onClick={() => setQuestionsPerSession(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="settings-section-title">Modalità di gioco</p>
        <div className="mode-list">
          {MODES.map((m) => (
            <label key={m.value} className="mode-option">
              <input
                type="radio"
                name="mode"
                checked={settings.sessionMode === m.value}
                onChange={() => setSessionMode(m.value)}
              />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="timed-header">
          <div>
            <p className="settings-section-title" style={{ marginBottom: 2 }}>⏱ Sfida a tempo</p>
            <p className="timed-desc">Ogni calcolo ha un timer. Scaduto = sbagliato.</p>
          </div>
          <button
            className={`toggle-btn ${settings.timedMode ? 'on' : ''}`}
            onClick={() => setTimedMode(!settings.timedMode)}
            aria-label="Attiva sfida a tempo"
          >
            {settings.timedMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {settings.timedMode && (
          <div className="timer-picker">
            <p className="timer-label">Secondi per calcolo: <strong>{settings.timerSeconds}s</strong></p>
            <div className="timer-buttons">
              {[2, 3, 4, 5, 6].map((s) => (
                <button
                  key={s}
                  className={`count-btn ${settings.timerSeconds === s ? 'active' : ''}`}
                  onClick={() => setTimerSeconds(s)}
                >
                  {s}s
                </button>
              ))}
            </div>
            <p className="timer-hint">Per drag & drop: N calcoli × {settings.timerSeconds}s = tempo totale blocco</p>
          </div>
        )}
      </div>
    </div>
  )
}
