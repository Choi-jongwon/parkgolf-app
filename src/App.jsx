import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import BottomTabBar from './components/BottomTabBar'
import HomePage from './pages/HomePage'
import ScoreInputPage from './pages/ScoreInputPage'
import MyScoresPage from './pages/MyScoresPage'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-20 sm:pb-10">
        <Routes>
          <Route path="/"       element={<HomePage />} />
          <Route path="/score"  element={<ScoreInputPage />} />
          <Route path="/my"     element={<MyScoresPage />} />
          <Route path="*"       element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomTabBar />
    </div>
  )
}
