import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useUIStore } from '@/store/uiStore'

export function AppLayout() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-rose-500 selection:text-white relative">
      {/* Background ambient lighting */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-rose-600/5 blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] bg-orange-600/5 blur-[140px] pointer-events-none z-0" />

      <Sidebar />
      <div
        className={cn(
          'min-h-screen transition-all duration-300 relative z-10',
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        )}
      >
        <TopBar />
        <main className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
