import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LazyWrapper } from '@/components/layout/LazyWrapper'

// Lazy load shared pages
const LandingPage = lazy(() => import('@/pages/shared/LandingPage'))
const NotFoundPage = lazy(() => import('@/pages/shared/NotFoundPage'))
const UnauthorizedPage = lazy(() => import('@/pages/shared/UnauthorizedPage'))

// Lazy load candidate pages (AI Resume & Job Prediction Platform)
const CandidateDashboard = lazy(() => import('@/pages/candidate/DashboardPage'))
const CandidateProfile = lazy(() => import('@/pages/candidate/ProfilePage'))
const CandidateOnboarding = lazy(() => import('@/pages/candidate/OnboardingPage'))
const JobFitPage = lazy(() => import('@/pages/candidate/JobFitPage'))
const FitHistoryPage = lazy(() => import('@/pages/candidate/FitHistoryPage'))
const JobRecommendationsPage = lazy(() => import('@/pages/candidate/JobRecommendationsPage'))
const SettingsPage = lazy(() => import('@/pages/candidate/SettingsPage'))

// Lazy load auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <LazyWrapper><LandingPage /></LazyWrapper>,
  },

  // Auth routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LazyWrapper><LoginPage /></LazyWrapper> },
      { path: 'register', element: <LazyWrapper><RegisterPage /></LazyWrapper> },
    ],
  },

  // Candidate routes
  {
    path: '/candidate',
    element: (
      <ProtectedRoute allowedRoles={['candidate']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <LazyWrapper><CandidateDashboard /></LazyWrapper> },
      { path: 'profile', element: <LazyWrapper><CandidateProfile /></LazyWrapper> },
      { path: 'onboarding', element: <LazyWrapper><CandidateOnboarding /></LazyWrapper> },
      { path: 'job-fit', element: <LazyWrapper><JobFitPage /></LazyWrapper> },
      { path: 'fit-history', element: <LazyWrapper><FitHistoryPage /></LazyWrapper> },
      { path: 'recommendations', element: <LazyWrapper><JobRecommendationsPage /></LazyWrapper> },
      { path: 'settings', element: <LazyWrapper><SettingsPage /></LazyWrapper> },
    ],
  },

  // Settings redirect
  {
    path: '/settings',
    element: (
      <ProtectedRoute allowedRoles={['candidate']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <LazyWrapper><SettingsPage /></LazyWrapper> },
    ],
  },

  // Error pages
  { path: '/unauthorized', element: <LazyWrapper><UnauthorizedPage /></LazyWrapper> },
  { path: '*', element: <LazyWrapper><NotFoundPage /></LazyWrapper> },
])
