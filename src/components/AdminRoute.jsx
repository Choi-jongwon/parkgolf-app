import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// admin@naepas.com 계정만 접근 가능
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user || user.email !== 'admin@naepas.com') return <Navigate to="/" replace />
  return children
}
