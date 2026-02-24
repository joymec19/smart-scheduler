import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    to: '/tasks',
    label: 'Tasks',
    tourId: 'tour-tasks',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/notes',
    label: 'Notes',
    tourId: 'tour-notes',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Stats',
    tourId: 'tour-analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3">
      {/* Glassmorphism bar */}
      <div className="glass-float rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              data-tour-id={tab.tourId || undefined}
            >
              {({ isActive }) => (
                <div className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-all`}>
                  {/* Icon with gradient pill when active */}
                  <span
                    className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/40 text-white'
                        : 'text-gray-400 dark:text-slate-500'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  {/* Label */}
                  <span
                    className={`text-[10px] font-semibold transition-colors leading-none ${
                      isActive
                        ? 'text-violet-600 dark:text-violet-400'
                        : 'text-gray-400 dark:text-slate-500'
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
