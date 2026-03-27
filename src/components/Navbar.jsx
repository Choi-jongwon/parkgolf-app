import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',      label: '🏆 랭킹' },
  { to: '/score', label: '✏️ 스코어 입력' },
  { to: '/my',    label: '👤 내 기록' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-14">
        {/* 로고 */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-bold text-green-700 text-lg"
        >
          ⛳ 파크골프
        </button>

        {/* PC 메뉴 */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-green-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <button className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-600 text-green-700 hover:bg-green-50">
            로그인
          </button>
        </div>

        {/* 모바일 햄버거 */}
        <button
          className="sm:hidden text-gray-500 text-2xl"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {open && (
        <div className="sm:hidden bg-white border-t px-4 py-2 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <button className="text-left px-3 py-2 text-sm text-green-700 font-medium">
            로그인
          </button>
        </div>
      )}
    </nav>
  )
}
