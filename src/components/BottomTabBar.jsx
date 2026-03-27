import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/',      icon: '🏆', label: '랭킹' },
  { to: '/score', icon: '✏️', label: '스코어' },
  { to: '/my',    icon: '👤', label: '내 기록' },
]

export default function BottomTabBar() {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg grid grid-cols-3 z-50">
      {TABS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `py-2.5 flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              isActive ? 'text-green-600' : 'text-gray-400'
            }`
          }
        >
          <span className="text-xl leading-none">{icon}</span>
          {label}
        </NavLink>
      ))}
    </div>
  )
}
