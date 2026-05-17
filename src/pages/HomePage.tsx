import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './HomePage.css'

export default function HomePage() {
  const nav = useNavigate()
  const { t } = useTranslation()
  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-emoji">🧮</div>
        <h1>{t('home.title')}</h1>
        <p className="home-subtitle">{t('home.subtitle')}</p>
      </div>
      <div className="home-actions">
        <button className="btn btn-primary home-play-btn" onClick={() => nav('/play')}>
          {t('home.play')}
        </button>
        <button className="btn btn-secondary" onClick={() => nav('/settings')}>
          {t('home.settings')}
        </button>
        <button className="btn btn-ghost" onClick={() => nav('/stats')}>
          {t('home.stats')}
        </button>
      </div>
    </div>
  )
}
