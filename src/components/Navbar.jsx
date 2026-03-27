import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/',      label: '🏆 랭킹' },
  { to: '/score', label: '✏️ 스코어 입력' },
  { to: '/my',    label: '👤 내 기록' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user, nickname, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    navigate('/')
    setOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-14">
        {/* 로고 */}
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 font-bold text-green-700 text-lg">
          ⛳ 파크골프
        </button>

        {/* PC 메뉴 */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-green-50'
                }`
              }>
              {label}
            </NavLink>
          ))}
          {user ? (
            <div className="ml-2 flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">👤 {nickname}</span>
              <button onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                로그아웃
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')}
              className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-600 text-green-700 hover:bg-green-50">
              로그인
            </button>
          )}
        </div>

        {/* 모바일 햄버거 */}
        <button className="sm:hidden text-gray-500 text-2xl" onClick={() => setOpen(o => !o)}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {open && (
        <div className="sm:hidden bg-white border-t px-4 py-2 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600'
                }`
              }>
              {label}
            </NavLink>
          ))}
          <div className="border-t my-1" />
          {user ? (
            <>
              <span className="px-3 py-1 text-sm text-gray-500">👤 {nickname}</span>
              <button onClick={handleSignOut}
                className="text-left px-3 py-2 text-sm text-red-500 font-medium">
                로그아웃
              </button>
            </>
          ) : (
            <button onClick={() => { navigate('/login'); setOpen(false) }}
              className="text-left px-3 py-2 text-sm text-green-700 font-medium">
              로그인 / 회원가입
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
