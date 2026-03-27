import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import BottomTabBar from './components/BottomTabBar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ScoreInputPage from './pages/ScoreInputPage'
import MyScoresPage from './pages/MyScoresPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pb-20 sm:pb-10">
          <Routes>
            <Route path="/"      element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/score" element={
              <ProtectedRoute><ScoreInputPage /></ProtectedRoute>
            } />
            <Route path="/my"    element={
              <ProtectedRoute><MyScoresPage /></ProtectedRoute>
            } />
            <Route path="*"      element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomTabBar />
      </div>
    </AuthProvider>
  )
}
