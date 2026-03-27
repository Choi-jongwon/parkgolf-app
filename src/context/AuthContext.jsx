import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const MOCK_USER = {
  id: 'mock-user-1',
  email: 'mock@parkgolf.com',
  user_metadata: { nickname: '테스트유저' },
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(USE_MOCK ? MOCK_USER : null)
  const [loading, setLoading] = useState(!USE_MOCK)

  useEffect(() => {
    if (USE_MOCK) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp(email, password, nickname) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname } },
    })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  const nickname = user?.user_metadata?.nickname ?? user?.email?.split('@')[0] ?? ''

  return (
    <AuthContext.Provider value={{ user, nickname, loading, signIn, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
