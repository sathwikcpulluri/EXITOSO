import { create } from 'zustand'
import type { User, UserRole } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  role: UserRole | null
  organizationId: string | null

  setUser: (user: User) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Pre-populated with mock candidate user for development
  user: {
    id: 'mock-user-001',
    email: 'alex.johnson@email.com',
    fullName: 'Alex Johnson',
    role: 'candidate',
    avatarUrl: undefined,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z',
  } as User,
  isLoading: false,
  isAuthenticated: true,
  role: 'candidate',
  organizationId: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      role: user.role,
      organizationId: user.organizationId || null,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      role: null,
      organizationId: null,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  hasRole: (role) => get().role === role,

  hasAnyRole: (roles) => {
    const currentRole = get().role
    return currentRole ? roles.includes(currentRole) : false
  },
}))
