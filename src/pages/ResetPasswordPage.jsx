import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [done,      setDone]      = useState(false)
  const [ready,     setReady]     = useState(false)   // 세션 준비 여부

  // Supabase가 URL hash의 access_token을 감지해 세션을 자동 설정
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password.length < 6)  { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    if (password !== confirm)  { setError('비밀번호가 일치하지 않습니다.'); return }
    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* 완료 화면 */
  if (done) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-extrabold text-gray-800">비밀번호 변경 완료!</h2>
        <p className="text-sm text-gray-500">새 비밀번호로 로그인해 주세요.</p>
        <button onClick={() => navigate('/login')}
          className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all active:scale-95">
          로그인 하기 →
        </button>
      </div>
    </div>
  )

  /* 링크가 유효하지 않은 경우 */
  if (!ready) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="text-4xl">⏳</div>
        <p className="text-gray-500 text-sm">링크를 확인하는 중입니다...</p>
        <p className="text-xs text-gray-400">
          이 화면이 계속 보이면 이메일의 링크를 다시 클릭해 주세요.
        </p>
        <button onClick={() => navigate('/forgot-password')}
          className="text-sm text-green-600 underline">
          비밀번호 찾기 다시 시도
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* 헤더 */}
        <div className="text-center">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-extrabold text-gray-800">새 비밀번호 설정</h1>
          <p className="text-sm text-gray-400 mt-1">새로 사용할 비밀번호를 입력해 주세요.</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">

          {/* 새 비밀번호 */}
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1.5">새 비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6자 이상"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:border-green-400"
              autoFocus
            />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1.5">비밀번호 확인</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="비밀번호 재입력"
              className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none
                ${confirm && confirm !== password
                  ? 'border-red-400 focus:border-red-400'
                  : confirm && confirm === password
                    ? 'border-green-400 focus:border-green-400'
                    : 'border-gray-200 focus:border-green-400'}`}
            />
            {confirm && confirm !== password && (
              <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다</p>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-60
              text-white font-bold rounded-xl text-base transition-all active:scale-95">
            {loading ? '변경 중...' : '비밀번호 변경하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
