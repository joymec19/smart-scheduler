import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Notes from './pages/Notes'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ErrorBoundary from './components/ErrorBoundary'
import { useAuth } from './hooks/useAuth'

// Lazy-load the heaviest page (SVG donut chart, analytics queries)
const Analytics = lazy(() => import('./pages/Analytics'))
// Lazy-load Calendar (react-big-calendar is large)
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
// Lazy-load Settings
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
// Lazy-load Onboarding (framer-motion animations, not needed on first paint)
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))

function AnalyticsFallback() {
  return (
    <div className="flex justify-center items-center py-24">
      <div className="w-7 h-7 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Requires auth only — does NOT check has_onboarded (used for the onboarding page itself)
function AuthOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f] transition-colors">
        <div className="w-7 h-7 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: { fontSize: '14px', borderRadius: '12px' },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Auth-required, no Layout — onboarding wizard */}
        <Route
          path="/onboarding"
          element={
            <AuthOnly>
              <Suspense fallback={<AnalyticsFallback />}>
                <OnboardingPage />
              </Suspense>
            </AuthOnly>
          }
        />

        {/* Auth + onboarded — main app with nav layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/analytics"
            element={
              <Suspense fallback={<AnalyticsFallback />}>
                <Analytics />
              </Suspense>
            }
          />
          <Route
            path="/calendar"
            element={
              <Suspense fallback={<AnalyticsFallback />}>
                <CalendarPage />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<AnalyticsFallback />}>
                <SettingsPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
