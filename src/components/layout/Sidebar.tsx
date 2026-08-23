import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar } from '@/components/ui/Avatar'
import {
  LayoutDashboard,
  Target,
  Briefcase,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  History,
  Sparkles,
  Send,
  BrainCircuit,
  X,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const candidateNav: NavItem[] = [
  { label: 'Dashboard', href: '/candidate/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'AI Role Predictor', href: '/candidate/job-fit', icon: <Target className="h-5 w-5" /> },
  { label: 'Hiring Probability', href: '/candidate/hiring-probability', icon: <Sparkles className="h-5 w-5" /> },
  { label: 'Recommendations', href: '/candidate/recommendations', icon: <Briefcase className="h-5 w-5" /> },
  { label: 'Audio Interview', href: '/candidate/practice', icon: <BrainCircuit className="h-5 w-5" /> },
  { label: 'Application Tracker', href: '/candidate/applications', icon: <Send className="h-5 w-5" /> },
  { label: 'Prediction History', href: '/candidate/fit-history', icon: <History className="h-5 w-5" /> },
  { label: 'Profile & Skills', href: '/candidate/profile', icon: <User className="h-5 w-5" /> },
]

export function Sidebar() {
  const location = useLocation()
  const { user, signOut } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setMobileSidebarOpen } = useUIStore()

  const navItems = candidateNav

  return (
    <>
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-[#080808]/95 backdrop-blur-2xl border-r border-white/10 z-50 flex flex-col transition-all duration-300',
          // Desktop
          'hidden lg:flex',
          sidebarCollapsed ? 'w-[72px]' : 'w-64',
          // Mobile
          sidebarMobileOpen && '!flex w-72'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/[0.08]">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden group">
            <span className="font-serif italic text-2xl font-bold tracking-tight text-white group-hover:text-rose-400 transition-colors">
              Career<span className="text-orange-500 font-sans not-italic text-xl font-black">AI</span>
            </span>
          </Link>

          {/* Mobile close */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Desktop collapse */}
          <button
            onClick={toggleSidebar}
            className={cn(
              'hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-transform',
              sidebarCollapsed && 'rotate-180'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-white/[0.09] text-white border border-white/10 shadow-[0_0_20px_rgba(255,0,94,0.2)]'
                    : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
                )}
              >
                <span className={cn('shrink-0', isActive ? 'text-rose-400' : 'text-neutral-400')}>{item.icon}</span>
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-white/[0.08] space-y-1">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 transition-colors"
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>Settings</span>}
          </Link>

          {/* User info */}
          <div className={cn('flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.02]', sidebarCollapsed && 'justify-center')}>
            <Avatar name={user?.fullName || 'User'} size="sm" />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'Candidate'}</p>
                <p className="text-xs text-neutral-500 capitalize">{user?.role || 'candidate'}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={() => signOut()}
                title="Sign Out"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
