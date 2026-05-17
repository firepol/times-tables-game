import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../hooks/useSettings'
import type { SessionMode } from '../types'
import './SettingsPage.css'

function TimerStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const n = parseInt(raw, 10)
    if (!isNaN(n)) onChange(Math.max(1, Math.min(99, n)))
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="timer-stepper">
        <button className="stepper-btn" onClick={() => { commit(draft); onChange(Math.max(1, value - 1)) }}>−</button>
        <input
          className="stepper-input"
          type="number"
          min={1}
          max={99}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') commit(draft) }}
        />
        <button className="stepper-btn" onClick={() => { commit(draft); onChange(Math.min(99, value + 1)) }}>+</button>
      </div>
    )
  }

  return (
    <div className="timer-stepper">
      <button className="stepper-btn" onClick={() => onChange(Math.max(1, value - 1))}>−</button>
      <button className="stepper-value" onClick={() => { setDraft(String(value)); setEditing(true) }}>
        {value}s
      </button>
      <button className="stepper-btn" onClick={() => onChange(Math.min(99, value + 1))}>+</button>
    </div>
  )
}

const PRESET_KEYS = [
  { key: 'easy',   tables: [2, 5] },
  { key: 'medium', tables: [3, 4, 6] },
  { key: 'hard',   tables: [7, 8, 9] },
  { key: 'all',    tables: [2, 3, 4, 5, 6, 7, 8, 9] },
] as const

const MODE_KEYS: Array<{ value: SessionMode }> = [
  { value: 'mixed' },
  { value: 'drag_drop' },
  { value: 'multiple_choice' },
  { value: 'typed' },
]

export default function SettingsPage() {
  const nav = useNavigate()
  const { t } = useTranslation()
  const {
    settings, toggleTable, setTables, setQuestionsPerSession,
    setSessionMode, setTimedMode, setTimerSeconds, setLanguage,
  } = useSettings()

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav('/')}>←</button>
        <h2>{t('settings.title')}</h2>
      </div>

      <div className="card">
        <p className="settings-section-title">{t('settings.tables')}</p>
        <div className="table-grid">
          {[2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              className={`table-btn ${settings.selectedTables.includes(n) ? 'active' : ''}`}
              onClick={() => toggleTable(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="preset-row">
          {PRESET_KEYS.map((p) => (
            <button key={p.key} className="preset-btn" onClick={() => setTables([...p.tables])}>
              {t(`settings.presets.${p.key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="settings-section-title">{t('settings.questionsPerSession')}</p>
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
        <p className="settings-section-title">{t('settings.gameMode')}</p>
        <div className="mode-list">
          {MODE_KEYS.map((m) => (
            <label key={m.value} className="mode-option">
              <input
                type="radio"
                name="mode"
                checked={settings.sessionMode === m.value}
                onChange={() => setSessionMode(m.value)}
              />
              <span>{t(`settings.modes.${m.value}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="timed-header">
          <div>
            <p className="settings-section-title" style={{ marginBottom: 2 }}>{t('settings.timedChallenge')}</p>
            <p className="timed-desc">{t('settings.timedDesc')}</p>
          </div>
          <button
            className={`toggle-btn ${settings.timedMode ? 'on' : ''}`}
            onClick={() => setTimedMode(!settings.timedMode)}
            aria-label="Toggle timed challenge"
          >
            {settings.timedMode ? t('settings.on') : t('settings.off')}
          </button>
        </div>

        {settings.timedMode && (
          <div className="timer-picker">
            <p className="timer-label">{t('settings.secondsPerQuestion', { n: settings.timerSeconds })}</p>
            <TimerStepper value={settings.timerSeconds} onChange={setTimerSeconds} />
          </div>
        )}
      </div>

      <div className="card">
        <p className="settings-section-title">{t('settings.language')}</p>
        <div className="count-row">
          {(['en', 'it'] as const).map((lang) => (
            <button
              key={lang}
              className={`count-btn ${settings.language === lang ? 'active' : ''}`}
              onClick={() => setLanguage(lang)}
            >
              {lang === 'en' ? '🇬🇧 EN' : '🇮🇹 IT'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
