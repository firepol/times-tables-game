import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../hooks/useSettings'
import { useSessions } from '../hooks/useSessions'
import { useWeakCalcs } from '../hooks/useWeakCalcs'
import type { SessionMode } from '../types'
import './PlaySetupPage.css'

const MODE_VALUES: SessionMode[] = ['mixed', 'drag_drop', 'multiple_choice', 'typed']

export default function PlaySetupPage() {
  const nav = useNavigate()
  const { t } = useTranslation()
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
        timedMode: settings.timedMode,
        timerSeconds: settings.timerSeconds,
      },
    })
  }

  const top3 = weakCalcs.slice(0, 3)

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav('/')}>←</button>
        <h2>{t('play.title')}</h2>
      </div>

      <div className="card setup-info">
        <span className="setup-label">{t('play.tables')}</span>
        <span className="setup-value">{settings.selectedTables.join(', ')}</span>
        <span className="setup-label">{t('play.questions')}</span>
        <span className="setup-value">{settings.questionsPerSession}</span>
      </div>

      <div className="card">
        <p className="settings-section-title">{t('play.mode')}</p>
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

      {top3.length > 0 && (
        <div className="card hint-card">
          <p className="hint-title">{t('play.weakHint')}</p>
          <p className="hint-calcs">
            {top3.map((k) => {
              const [a, b] = k.split('x')
              return `${a}×${b}=${parseInt(a) * parseInt(b)}`
            }).join('  •  ')}
          </p>
          <button className="btn btn-secondary hint-btn" onClick={() => start(weakCalcs)}>
            {t('play.trainWeak')}
          </button>
        </div>
      )}

      <button className="btn btn-primary" onClick={() => start()}>
        {t('play.start')}
      </button>
    </div>
  )
}
