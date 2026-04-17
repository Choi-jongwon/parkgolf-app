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
  const [user,              setUser]              = useState(USE_MOCK ? MOCK_USER : null)
  const [loading,           setLoading]           = useState(!USE_MOCK)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    if (USE_MOCK) return

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
      })
      .catch(() => {
        // Supabase 연결 실패 시에도 로딩 해제
      })
      .finally(() => {
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // PASSWORD_RECOVERY 이벤트를 전역에서 캡처 (ResetPasswordPage가 아직 안 떠 있어도 OK)
      if (_event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  // 닉네임 + 비밀번호 로그인
  async function signInWithNickname(nickname, password) {
    if (USE_MOCK) return { user: MOCK_USER }

    // 1. 닉네임으로 이메일 조회
    const { data: userRow, error: lookupErr } = await supabase
      .from('users')
      .select('email')
      .eq('nickname', nickname.trim())
      .maybeSingle()

    if (lookupErr) throw new Error('사용자 조회 중 오류가 발생했습니다.')
    if (!userRow) throw new Error('등록되지 않은 닉네임입니다.')

    // 2. 이메일로 로그인
    const { data, error } = await supabase.auth.signInWithPassword({ email: userRow.email, password })
    if (error) {
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        throw new Error('이메일 인증이 필요합니다. Supabase 대시보드 → Authentication → Settings에서 "Enable email confirmations"를 OFF로 설정해 주세요.')
      }
      throw new Error('비밀번호가 올바르지 않습니다.')
    }
    return data
  }

  async function signUp(email, password, nickname, birthYear, gender) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname, birth_year: birthYear, gender } },
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
    <AuthContext.Provider value={{ user, nickname, loading, isPasswordRecovery, setIsPasswordRecovery, signIn, signInWithNickname, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
