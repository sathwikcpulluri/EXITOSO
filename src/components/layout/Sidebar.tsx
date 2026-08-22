import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar } from '@/components/ui/Avatar'
import {
  LayoutDashboard,
  Target,
  MessageSquare,
  Briefcase,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  Sparkles,
  History,
  X,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const candidateNav: NavItem[] = [
  { label: 'Dashboard', href: '/candidate/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Job Fit Score', href: '/candidate/job-fit', icon: <Target className="h-5 w-5" /> },
  { label: 'Interview Prep', href: '/candidate/interview-prep', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Recommendations', href: '/candidate/recommendations', icon: <Briefcase className="h-5 w-5" /> },
  { label: 'Fit History', href: '/candidate/fit-history', icon: <History className="h-5 w-5" /> },
  { label: 'Profile', href: '/candidate/profile', icon: <User className="h-5 w-5" /> },
]

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setMobileSidebarOpen } = useUIStore()

  const navItems = candidateNav

  return (
    <>
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white border-r border-surface-200 z-50 flex flex-col transition-all duration-300',
          // Desktop
          'hidden lg:flex',
          sidebarCollapsed ? 'w-[72px]' : 'w-64',
          // Mobile
          sidebarMobileOpen && '!flex w-72'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-100">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-brand shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-lg bg-gradient-brand bg-clip-text text-transparent whitespace-nowrap">
                CareerAI
              </span>
            )}
          </Link>

          {/* Mobile close */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Desktop collapse */}
          <button
            onClick={toggleSidebar}
            className={cn(
              'hidden lg:flex p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-transform',
              sidebarCollapsed && 'rotate-180'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                )}
              >
                <span className={cn('shrink-0', isActive && 'text-primary-600')}>{item.icon}</span>
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-surface-100 space-y-1">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors"
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>Settings</span>}
          </Link>

          {/* User info */}
          <div className={cn('flex items-center gap-3 px-3 py-2.5', sidebarCollapsed && 'justify-center')}>
            <Avatar name={user?.fullName || 'User'} size="sm" />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 truncate">{user?.fullName}</p>
                <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button className="p-1.5 rounded-lg text-surface-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
