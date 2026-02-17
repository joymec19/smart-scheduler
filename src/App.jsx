import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Notes from './pages/Notes'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import Signup from './pages/Signup'

export default function App() {
  return (
    <>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 2500,
        style: { fontSize: '14px', borderRadius: '12px' },
      }}
    />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

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
        <Route path="/analytics" element={<Analytics />} />
      </Route>
    </Routes>
    </>
  )
}
