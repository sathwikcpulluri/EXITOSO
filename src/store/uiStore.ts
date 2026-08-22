import { create } from 'zustand'
import type { Notification } from '@/types'

interface UIState {
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  activeModal: string | null
  notifications: Notification[]

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleMobileSidebar: () => void
  setMobileSidebarOpen: (open: boolean) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  markNotificationRead: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  activeModal: null,
  notifications: [],

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleMobileSidebar: () => set((s) => ({ sidebarMobileOpen: !s.sidebarMobileOpen })),
  setMobileSidebarOpen: (open) => set({ sidebarMobileOpen: open }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  addNotification: (notification) =>
    set((s) => ({ notifications: [notification, ...s.notifications] })),
  removeNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    })),
}))
