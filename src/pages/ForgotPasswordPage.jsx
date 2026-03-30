import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [nickname, setNickname] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [done,     setDone]     = useState(false)
  const [sentEmail, setSentEmail] = useState('')   // 마스킹된 이메일 표시용

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!nickname.trim()) { setError('닉네임을 입력해 주세요.'); return }
    setLoading(true)

    try {
      // 닉네임으로 이메일 조회
      const { data: userRow } = await supabase
        .from('users')
        .select('email')
        .eq('nickname', nickname.trim())
        .maybeSingle()

      if (!userRow) {
        setError('등록되지 않은 닉네임입니다.')
        return
      }

      // 비밀번호 재설정 이메일 발송
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        userRow.email,
        { redirectTo: `${window.location.origin}/reset-password` }
      )
      if (resetError) throw resetError

      // 이메일 일부 마스킹 처리 (예: ab***@gmail.com)
      const [local, domain] = userRow.email.split('@')
      const masked = local.slice(0, 2) + '***@' + domain
      setSentEmail(masked)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-5 text-center">
        <div className="text-5xl">📧</div>
        <h2 className="text-xl font-extrabold text-gray-800">이메일을 확인해 주세요</h2>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-green-700">{sentEmail}</span><br />
            으로 비밀번호 재설정 링크를 보냈습니다.
          </p>
          <p className="text-xs text-gray-400">
            메일이 보이지 않으면 스팸함을 확인해 주세요.<br />링크는 1시간 후 만료됩니다.
          </p>
        </div>
        <button onClick={() => navigate('/login')}
          className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all active:scale-95">
          로그인 화면으로
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* 헤더 */}
        <div className="text-center">
          <div className="text-4xl mb-2">🔑</div>
          <h1 className="text-2xl font-extrabold text-gray-800">비밀번호 찾기</h1>
          <p className="text-sm text-gray-400 mt-1">닉네임을 입력하면 이메일로 재설정 링크를 보내드립니다.</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">

          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1.5">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="가입 시 등록한 닉네임"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:border-green-400"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-60
              text-white font-bold rounded-xl text-base transition-all active:scale-95">
            {loading ? '전송 중...' : '재설정 링크 보내기'}
          </button>
        </form>

        <button onClick={() => navigate('/login')}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600">
          ← 로그인으로 돌아가기
        </button>
      </div>
    </div>
  )
}
