import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import BottomTabBar from './components/BottomTabBar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import HomePage from './pages/HomePage'
import ScoreInputPage from './pages/ScoreInputPage'
import MyScoresPage from './pages/MyScoresPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pb-20 sm:pb-10">
          <Routes>
            <Route path="/"      element={<HomePage />} />
            <Route path="/login"            element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />
            <Route path="/score" element={
              <ProtectedRoute><ScoreInputPage /></ProtectedRoute>
            } />
            <Route path="/my"    element={
              <ProtectedRoute><MyScoresPage /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute><AdminPage /></AdminRoute>
            } />
            <Route path="*"      element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <BottomTabBar />
      </div>
    </AuthProvider>
  )
}
