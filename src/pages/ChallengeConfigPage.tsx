import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useChallenges } from '../hooks/useChallenges'
import type { ChallengeConfig, SessionMode } from '../types'
import './ChallengeConfigPage.css'
import './SettingsPage.css'

const MODE_VALUES: SessionMode[] = ['mixed', 'drag_drop', 'multiple_choice', 'typed']

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="timer-stepper">
      <button className="stepper-btn" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="stepper-value" style={{ pointerEvents: 'none' }}>{value}</span>
      <button className="stepper-btn" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  )
}

export default function ChallengeConfigPage() {
  const nav = useNavigate()
  const { t } = useTranslation()
  const { state } = useLocation() as { state?: { config?: ChallengeConfig } }
  const { saveConfig } = useChallenges()

  const existing = state?.config
  const [name, setName] = useState(existing?.name ?? '')
  const [tables, setTables] = useState<number[]>(existing?.tables ?? [2, 3, 4, 5, 6, 7, 8, 9])
  const [questionsPerSession, setQuestionsPerSession] = useState(existing?.questionsPerSession ?? 20)
  const [sessionCount, setSessionCount] = useState(existing?.sessionCount ?? 3)
  const [mode, setMode] = useState<SessionMode>(existing?.mode ?? 'mixed')
  const [timedMode, setTimedMode] = useState(existing?.timedMode ?? true)
  const [timerSeconds, setTimerSeconds] = useState(existing?.timerSeconds ?? 6)

  function toggleTable(n: number) {
    setTables((prev) => {
      if (prev.includes(n)) {
        if (prev.length === 1) return prev
        return prev.filter((t) => t !== n)
      }
      return [...prev, n].sort((a, b) => a - b)
    })
  }

  function handleSave() {
    const config: ChallengeConfig = {
      id: existing?.id ?? crypto.randomUUID(),
      name: name.trim() || t('challenge.configName'),
      tables,
      questionsPerSession,
      sessionCount,
      mode,
      timedMode,
      timerSeconds,
    }
    saveConfig(config)
    nav('/challenge')
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav('/challenge')}>←</button>
        <h2>{existing ? t('challenge.edit') : t('challenge.new')}</h2>
      </div>

      <div className="card">
        <p className="settings-section-title">{t('challenge.configName')}</p>
        <input
          className="name-input"
          type="text"
          placeholder={t('challenge.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
        />
      </div>

      <div className="card">
        <p className="settings-section-title">{t('settings.tables')}</p>
        <div className="table-grid">
          {[2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              className={`table-btn ${tables.includes(n) ? 'active' : ''}`}
              onClick={() => toggleTable(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="settings-section-title">{t('settings.questionsPerSession')}</p>
        <div className="count-row">
          {[10, 15, 20, 30].map((n) => (
            <button
              key={n}
              className={`count-btn ${questionsPerSession === n ? 'active' : ''}`}
              onClick={() => setQuestionsPerSession(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="settings-section-title">{t('challenge.sessions')}</p>
        <Stepper value={sessionCount} min={1} max={10} onChange={setSessionCount} />
      </div>

      <div className="card">
        <p className="settings-section-title">{t('settings.gameMode')}</p>
        <div className="mode-chips">
          {MODE_VALUES.map((v) => (
            <button
              key={v}
              className={`mode-chip ${mode === v ? 'active' : ''}`}
              onClick={() => setMode(v)}
            >
              {t(`play.modes.${v}`)}
            </button>
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
            className={`toggle-btn ${timedMode ? 'on' : ''}`}
            onClick={() => setTimedMode((v) => !v)}
          >
            {timedMode ? t('settings.on') : t('settings.off')}
          </button>
        </div>
        {timedMode && (
          <div className="timer-picker">
            <p className="timer-label">{t('settings.secondsPerQuestion', { n: timerSeconds })}</p>
            <div className="timer-stepper">
              <button className="stepper-btn" onClick={() => setTimerSeconds((v) => Math.max(1, v - 1))}>−</button>
              <span className="stepper-value" style={{ pointerEvents: 'none' }}>{timerSeconds}s</span>
              <button className="stepper-btn" onClick={() => setTimerSeconds((v) => Math.min(99, v + 1))}>+</button>
            </div>
          </div>
        )}
      </div>

      <button className="btn btn-primary" onClick={handleSave}>{t('challenge.save')}</button>
    </div>
  )
}
