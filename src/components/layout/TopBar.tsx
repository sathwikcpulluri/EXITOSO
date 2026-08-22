import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar } from '@/components/ui/Avatar'
import { mockNotifications, mockJobs } from '@/lib/mockData'
import {
  Bell,
  Menu,
  Search,
  Check,
  Briefcase,
  X,
  Target,
  Sparkles,
} from 'lucide-react'

const routeTitles: Record<string, string> = {
  '/candidate/dashboard': 'Dashboard',
  '/candidate/job-fit': 'AI Role & Fit Predictor',
  '/candidate/recommendations': 'Job Recommendations',
  '/candidate/fit-history': 'Prediction History',
  '/candidate/profile': 'My Profile',
  '/candidate/onboarding': 'Getting Started',
  '/settings': 'Settings',
  '/candidate/settings': 'Settings',
}

export function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toggleMobileSidebar } = useUIStore()

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const pageTitle = routeTitles[location.pathname] || 'CareerAI'

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const quickNav = [
    { label: 'AI Role Predictor & Fit Analyzer', href: '/candidate/job-fit', icon: Target },
    { label: 'Predicted Job Recommendations', href: '/candidate/recommendations', icon: Briefcase },
    { label: 'Prediction & Assessment History', href: '/candidate/fit-history', icon: Target },
    { label: 'Update Profile & Extracted Skills', href: '/candidate/profile', icon: Sparkles },
  ]

  const matchedJobs = mockJobs.filter((j) =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (j.companyName && j.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 h-16 bg-[#080808]/80 backdrop-blur-xl border-b border-white/[0.08]',
          'flex items-center justify-between px-4 lg:px-8 transition-all duration-300'
        )}
      >
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">{pageTitle}</h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3 relative">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors text-xs font-semibold"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-neutral-400">Quick search...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-white/10 border border-white/10 rounded text-neutral-400">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-black" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-neutral-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 z-50 animate-scale-in p-4 overflow-hidden text-white">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-full border border-rose-500/30">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" /> Mark read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 mt-3 max-h-72 overflow-y-auto">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          'p-3 rounded-xl transition-colors text-xs space-y-1 cursor-pointer',
                          item.isRead
                            ? 'bg-white/[0.02] hover:bg-white/[0.06] border border-transparent'
                            : 'bg-white/[0.06] hover:bg-white/[0.09] border border-rose-500/30'
                        )}
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
                          )
                          setNotificationsOpen(false)
                          navigate('/candidate/job-fit')
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white">{item.title}</p>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-neutral-400 leading-relaxed">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User avatar */}
          <Link
            to="/candidate/profile"
            className="ml-1 flex items-center gap-2 pl-3 border-l border-white/10 hover:opacity-80 transition-opacity"
          >
            <Avatar name={user?.fullName || 'User'} size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white">{user?.fullName || 'Candidate'}</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-900/95 backdrop-blur-2xl w-full max-w-lg rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden animate-scale-in text-white">
            <div className="p-4 border-b border-white/[0.08] flex items-center gap-3">
              <Search className="h-5 w-5 text-neutral-500 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search pages, predictions, or open roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-white placeholder:text-neutral-500 font-medium"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto space-y-4">
              {/* Quick Pages */}
              <div>
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Quick Navigation</p>
                <div className="space-y-1">
                  {quickNav.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        setSearchOpen(false)
                        navigate(item.href)
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] text-xs font-semibold text-neutral-300 transition-colors text-left cursor-pointer"
                    >
                      <item.icon className="h-4 w-4 text-orange-400" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Matched Jobs */}
              {searchQuery.trim() && (
                <div>
                  <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Matched Roles</p>
                  <div className="space-y-1">
                    {matchedJobs.slice(0, 3).map((job) => (
                      <button
                        key={job.id}
                        onClick={() => {
                          setSearchOpen(false)
                          navigate('/candidate/job-fit')
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] text-xs text-left cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-white">{job.title}</p>
                          <p className="text-neutral-500">{job.companyName}</p>
                        </div>
                        <span className="text-orange-400 font-semibold">Predict Fit →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
