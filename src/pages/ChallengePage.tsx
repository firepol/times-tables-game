import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useChallenges } from '../hooks/useChallenges'
import type { ChallengeConfig, ChallengeRun } from '../types'
import './ChallengePage.css'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function ConfigSummary({ config }: { config: ChallengeConfig }) {
  const { t } = useTranslation()
  return (
    <span className="config-summary">
      {config.tables.join(',')} · {config.questionsPerSession}q · {config.sessionCount}{t('challenge.games')} · {config.mode}
      {config.timedMode ? ` · ${config.timerSeconds}s` : ''}
    </span>
  )
}

function RunRow({ run, onClick }: { run: ChallengeRun; onClick: () => void }) {
  const { t } = useTranslation()
  const configName = run.config?.name ?? '—'
  return (
    <div className="run-row" onClick={onClick}>
      <div className="run-left">
        <span className="run-name">{configName}</span>
        <span className="run-date">{formatDate(run.date)}</span>
      </div>
      <span className="run-score">{run.totalScore} {t('challenge.score')}</span>
    </div>
  )
}

function RunDetailModal({ run, onClose, onPlayAgain }: { run: ChallengeRun; onClose: () => void; onPlayAgain: () => void }) {
  const { t } = useTranslation()
  const sessions = run.sessions ?? []
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{run.config?.name ?? t('challenge.runDetail')}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <ConfigSummary config={run.config} />
        <p className="run-detail-date">{formatDate(run.date)}</p>
        <div className="run-detail-sessions">
          {sessions.map((s, i) => {
            const correct = s.answers.filter((a) => a.correct).length
            const total = s.answers.length
            return (
              <div key={i} className="run-detail-row">
                <span>{t('challenge.session', { n: i + 1 })}</span>
                <span className="ok">{correct}/{total} {t('challenge.correct')}</span>
              </div>
            )
          })}
        </div>
        <div className="run-detail-total">
          <strong>{t('challenge.totalScore')}:</strong> {run.totalScore}
        </div>
        <button className="btn btn-primary" onClick={onPlayAgain}>{t('challenge.playAgain')}</button>
      </div>
    </div>
  )
}

export default function ChallengePage() {
  const nav = useNavigate()
  const { t } = useTranslation()
  const { configs, runs, deleteConfig } = useChallenges()
  const [tab, setTab] = useState<'my' | 'all'>('my')
  const [selectedRun, setSelectedRun] = useState<ChallengeRun | null>(null)

  function playConfig(config: ChallengeConfig) {
    nav('/game', {
      state: {
        tables: config.tables,
        count: config.questionsPerSession,
        mode: config.mode,
        timedMode: config.timedMode,
        timerSeconds: config.timerSeconds,
        challengeCtx: { config, sessionIdx: 0, prevSessions: [] },
      },
    })
  }

  function playRunAgain(run: ChallengeRun) {
    setSelectedRun(null)
    playConfig(run.config)
  }

  function bestScore(configId: string) {
    const configRuns = runs.filter((r) => r.configId === configId)
    if (!configRuns.length) return null
    return Math.max(...configRuns.map((r) => r.totalScore))
  }

  const sortedRuns = [...runs].sort((a, b) => b.totalScore - a.totalScore)
  const allRunsSorted = [...runs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav('/')}>←</button>
        <h2>{t('challenge.title')}</h2>
        <button className="new-challenge-btn" onClick={() => nav('/challenge/config')}>
          {t('challenge.new')}
        </button>
      </div>

      <div className="challenge-tabs">
        <button className={`tab-btn ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>
          {t('challenge.myChallenge')}
        </button>
        <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          {t('challenge.leaderboard')}
        </button>
      </div>

      {tab === 'my' && (
        <>
          {configs.length === 0 ? (
            <div className="card empty-state">
              <p>{t('challenge.noConfigs')}</p>
              <button className="btn btn-primary" onClick={() => nav('/challenge/config')}>
                {t('challenge.createFirst')}
              </button>
            </div>
          ) : (
            configs.map((cfg) => {
              const best = bestScore(cfg.id)
              const runCount = runs.filter((r) => r.configId === cfg.id).length
              const topRuns = runs
                .filter((r) => r.configId === cfg.id)
                .sort((a, b) => b.totalScore - a.totalScore)
                .slice(0, 5)
              return (
                <div key={cfg.id} className="card config-card">
                  <div className="config-top">
                    <div className="config-info">
                      <span className="config-name">{cfg.name}</span>
                      <ConfigSummary config={cfg} />
                    </div>
                    <div className="config-actions">
                      {best !== null && (
                        <span className="config-best">{t('challenge.bestScore')}: {best}</span>
                      )}
                      <button className="btn btn-primary config-play-btn" onClick={() => playConfig(cfg)}>
                        {t('challenge.play')}
                      </button>
                    </div>
                  </div>
                  <div className="config-meta-row">
                    <button className="link-btn" onClick={() => nav('/challenge/config', { state: { config: cfg } })}>
                      {t('challenge.edit')}
                    </button>
                    <button className="link-btn danger" onClick={() => {
                      if (window.confirm(t('challenge.deleteConfirm'))) deleteConfig(cfg.id)
                    }}>
                      {t('challenge.delete')}
                    </button>
                    {runCount > 0 && <span className="run-count">{t('challenge.runCount', { n: runCount })}</span>}
                  </div>
                  {topRuns.length > 0 && (
                    <div className="config-runs">
                      {topRuns.map((r) => (
                        <RunRow key={r.id} run={r} onClick={() => setSelectedRun(r)} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </>
      )}

      {tab === 'all' && (
        <div className="card">
          {allRunsSorted.length === 0 ? (
            <p className="no-sessions">{t('challenge.noRunsAll')}</p>
          ) : (
            <div className="all-runs-list">
              {sortedRuns.map((r) => (
                <RunRow key={r.id} run={r} onClick={() => setSelectedRun(r)} />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedRun && (
        <RunDetailModal
          run={selectedRun}
          onClose={() => setSelectedRun(null)}
          onPlayAgain={() => playRunAgain(selectedRun)}
        />
      )}
    </div>
  )
}
