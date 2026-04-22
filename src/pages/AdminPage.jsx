import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const GENDER_LABEL = { male: '남', female: '여' }

function maskEmail(email = '') {
  const [local, domain] = email.split('@')
  if (!domain) return email
  return local.slice(0, 2) + '***@' + domain
}

export default function AdminPage() {
  const navigate = useNavigate()

  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('id, email, nickname, birth_year, gender, created_at')
        .not('email', 'like', '%@naepas.com')   // 테스트 계정 제외
        .order('created_at', { ascending: false })

      if (error) { setError(error.message); setLoading(false); return }
      setUsers(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = users.filter(u => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      u.nickname?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-800">🛠 관리자 페이지</h1>
          <p className="text-xs text-gray-400 mt-0.5">신규 가입 회원 조회 (테스트 계정 제외)</p>
        </div>
        <button onClick={() => navigate('/')}
          className="text-sm text-gray-400 hover:text-gray-600">← 홈으로</button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">신규 가입 회원</p>
          <p className="text-3xl font-extrabold text-green-600">{users.length}<span className="text-base font-normal text-gray-400 ml-1">명</span></p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">최근 가입</p>
          <p className="text-sm font-bold text-gray-700 mt-1">
            {users[0]
              ? new Date(users[0].created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
              : '-'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{users[0]?.nickname ?? ''}</p>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="닉네임 또는 이메일 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-3 border-2 border-gray-200 rounded-xl text-sm
            focus:outline-none focus:border-green-400 bg-white"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-xl leading-none">
            ×
          </button>
        )}
      </div>

      {/* 에러 */}
      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700">회원 목록</span>
          <span className="text-xs text-gray-400">
            {search ? `${filtered.length} / ${users.length}명` : `전체 ${users.length}명`}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm animate-pulse">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            {search ? '검색 결과가 없습니다.' : '가입된 신규 회원이 없습니다.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-400">
              <span className="col-span-1 text-center">No</span>
              <span className="col-span-3">닉네임</span>
              <span className="col-span-4">이메일</span>
              <span className="col-span-1 text-center">성별</span>
              <span className="col-span-1 text-center">출생</span>
              <span className="col-span-2 text-right">가입일</span>
            </div>

            {/* 데이터 행 */}
            {filtered.map((u, idx) => (
              <div key={u.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50 transition-colors text-sm">
                <span className="col-span-1 text-center text-xs text-gray-400">{idx + 1}</span>
                <span className="col-span-3 font-semibold text-gray-800 truncate">{u.nickname}</span>
                <span className="col-span-4 text-gray-500 text-xs truncate">{maskEmail(u.email)}</span>
                <span className="col-span-1 text-center">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
                    ${u.gender === 'male'
                      ? 'bg-blue-50 text-blue-600'
                      : u.gender === 'female'
                        ? 'bg-pink-50 text-pink-600'
                        : 'bg-gray-100 text-gray-400'}`}>
                    {GENDER_LABEL[u.gender] ?? '-'}
                  </span>
                </span>
                <span className="col-span-1 text-center text-xs text-gray-500">{u.birth_year ?? '-'}</span>
                <span className="col-span-2 text-right text-xs text-gray-400">
                  {new Date(u.created_at).toLocaleDateString('ko-KR', {
                    year: '2-digit', month: '2-digit', day: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
