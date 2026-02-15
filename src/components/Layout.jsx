import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-20">
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
