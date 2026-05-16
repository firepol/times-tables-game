import { useNavigate } from 'react-router-dom'
import './HomePage.css'

export default function HomePage() {
  const nav = useNavigate()
  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-emoji">🧮</div>
        <h1>Tabelline!</h1>
        <p className="home-subtitle">Allenati con le tabelle di moltiplicazione</p>
      </div>
      <div className="home-actions">
        <button className="btn btn-primary home-play-btn" onClick={() => nav('/play')}>
          ▶ Gioca
        </button>
        <button className="btn btn-secondary" onClick={() => nav('/settings')}>
          ⚙ Impostazioni
        </button>
        <button className="btn btn-ghost" onClick={() => nav('/stats')}>
          📊 Statistiche
        </button>
      </div>
    </div>
  )
}
