import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import ResultsPage from './pages/ResultsPage'
import SettingsPage from './pages/SettingsPage'
import PlaySetupPage from './pages/PlaySetupPage'
import StatsPage from './pages/StatsPage'
import SessionDetailPage from './pages/SessionDetailPage'
import ChallengePage from './pages/ChallengePage'
import ChallengeConfigPage from './pages/ChallengeConfigPage'
import ChallengeResultsPage from './pages/ChallengeResultsPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/play" element={<PlaySetupPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/stats/:id" element={<SessionDetailPage />} />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route path="/challenge/config" element={<ChallengeConfigPage />} />
        <Route path="/challenge/results" element={<ChallengeResultsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
