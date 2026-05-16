import { useNavigate, useParams } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import type { Answer } from '../types'
import './SessionDetailPage.css'

function typeLabel(type: Answer['questionType']) {
  if (type === 'classic_mc')     return { icon: 'MC', cls: 'lbl-mc' }
  if (type === 'drag_drop')      return { icon: '↔', cls: 'lbl-drag' }
  if (type === 'missing_factor') return { icon: '✍', cls: 'lbl-typed' }
  return { icon: '✍', cls: 'lbl-typed' }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

export default function SessionDetailPage() {
  const nav = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { sessions } = useSessions()
  const session = sessions.find((s) => s.id === id)

  if (!session) {
    return (
      <div className="page">
        <div className="page-header">
          <button className="back-btn" onClick={() => nav('/stats')}>←</button>
          <h2>Sessione non trovata</h2>
        </div>
        <button className="btn btn-primary" onClick={() => nav('/stats')}>Torna alle statistiche</button>
      </div>
    )
  }

  const correct = session.answers.filter((a) => a.correct).length

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => nav('/stats')}>←</button>
        <h2>Dettaglio sessione</h2>
      </div>

      <div className="card detail-summary">
        <div className="detail-row"><span>Data</span><span>{formatDate(session.date)}</span></div>
        <div className="detail-row"><span>Tabelle</span><span>{session.tables.join(', ')}</span></div>
        <div className="detail-row"><span>Modalità</span><span>{session.mode}</span></div>
        <div className="detail-row">
          <span>Punteggio</span>
          <span className="detail-score">{correct} / {session.answers.length}</span>
        </div>
      </div>

      <div className="card">
        <p className="detail-section-title">Risposte</p>
        <div className="answer-list">
          {session.answers.map((a, i) => {
            const { icon, cls } = typeLabel(a.questionType)
            const formula = a.questionType === 'missing_factor'
              ? `${a.question.a} × ? = ${a.question.a * a.question.b}`
              : `${a.question.a} × ${a.question.b} = ${a.correctAnswer}`
            return (
              <div key={i} className={`answer-row ${a.correct ? 'correct' : 'wrong'}`}>
                <span className={`type-lbl ${cls}`}>{icon}</span>
                <span className="answer-formula">{formula}</span>
                {!a.correct && (
                  <span className="answer-user">→ {a.userAnswer}</span>
                )}
                <span className="answer-check">{a.correct ? '✓' : '✗'}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
