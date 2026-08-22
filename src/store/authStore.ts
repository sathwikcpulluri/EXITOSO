import { create } from 'zustand'
import type { User, UserRole } from '@/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  role: UserRole | null
  organizationId: string | null

  initAuth: () => Promise<void>
  setUser: (user: User) => void
  clearUser: () => void
  signOut: () => Promise<void>
  setLoading: (loading: boolean) => void
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  role: null,
  organizationId: null,

  initAuth: async () => {
    if (!isSupabaseConfigured) {
      set({ isLoading: false, isAuthenticated: false, user: null })
      return
    }

    try {
      set({ isLoading: true })
      // 1. Check existing Supabase session
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session?.user) {
        set({ user: null, isAuthenticated: false, role: null, isLoading: false })
      } else {
        const sbUser = session.user
        // 2. Fetch user profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sbUser.id)
          .single()

        const userObj: User = {
          id: sbUser.id,
          email: sbUser.email || '',
          fullName: profile?.full_name || sbUser.user_metadata?.full_name || 'Candidate',
          role: (profile?.role || sbUser.user_metadata?.role || 'candidate') as UserRole,
          avatarUrl: profile?.avatar_url || undefined,
          createdAt: profile?.created_at || sbUser.created_at || new Date().toISOString(),
          updatedAt: profile?.updated_at || new Date().toISOString(),
        }

        set({
          user: userObj,
          isAuthenticated: true,
          role: userObj.role,
          isLoading: false,
        })
      }

      // 3. Listen to live auth state changes
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (!newSession?.user) {
          set({ user: null, isAuthenticated: false, role: null, isLoading: false })
        } else {
          const sbUser = newSession.user
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sbUser.id)
            .single()

          const userObj: User = {
            id: sbUser.id,
            email: sbUser.email || '',
            fullName: profile?.full_name || sbUser.user_metadata?.full_name || 'Candidate',
            role: (profile?.role || sbUser.user_metadata?.role || 'candidate') as UserRole,
            avatarUrl: profile?.avatar_url || undefined,
            createdAt: profile?.created_at || sbUser.created_at || new Date().toISOString(),
            updatedAt: profile?.updated_at || new Date().toISOString(),
          }

          set({
            user: userObj,
            isAuthenticated: true,
            role: userObj.role,
            isLoading: false,
          })
        }
      })
    } catch (err) {
      console.error('[CareerAI Auth Init Error]', err)
      set({ user: null, isAuthenticated: false, role: null, isLoading: false })
    }
  },

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      role: user.role,
      organizationId: user.organizationId || null,
      isLoading: false,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      role: null,
      organizationId: null,
      isLoading: false,
    }),

  signOut: async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.error('[CareerAI SignOut Error]', err)
    } finally {
      get().clearUser()
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),

  hasRole: (role) => get().role === role,

  hasAnyRole: (roles) => {
    const currentRole = get().role
    return currentRole ? roles.includes(currentRole) : false
  },
}))
