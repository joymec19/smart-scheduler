import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; // assuming you have this
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import NotesPage from './pages/NotesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import PrivacyPage from './pages/PrivacyPage';  // ← ADD
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/onboarding" />} />
          <Route path="/tasks" element={user ? <TasksPage /> : <Navigate to="/onboarding" />} />
          <Route path="/notes" element={user ? <NotesPage /> : <Navigate to="/onboarding" />} />
          <Route path="/analytics" element={user ? <AnalyticsPage /> : <Navigate to="/onboarding" />} />
          <Route path="/calendar" element={user ? <CalendarPage /> : <Navigate to="/onboarding" />} />
          <Route path="/privacy" element={<PrivacyPage />} />  // ← PUBLIC ROUTE (no auth)
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/onboarding" />} />
          <Route path="/onboarding" element={!user ? <OnboardingPage /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
