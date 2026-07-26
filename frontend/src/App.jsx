import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import HomePage from './pages/HomePage.jsx';
import TherapistsPage from './pages/TherapistsPage.jsx';
import TherapistDetailPage from './pages/TherapistDetailPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SessionDetailPage from './pages/SessionDetailPage.jsx';
import AISupportPage from './pages/AISupportPage.jsx';
import AIAnalyserPage from './pages/AIAnalyserPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TherapistPortalLoginPage from './pages/TherapistPortalLoginPage.jsx';
import TherapistPortalSelectPage from './pages/TherapistPortalSelectPage.jsx';
import TherapistPortalEditPage from './pages/TherapistPortalEditPage.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/therapists" element={<TherapistsPage />} />
          <Route path="/therapists/:id" element={<TherapistDetailPage />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/sessions/:id"
            element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>}
          />
          <Route
            path="/ai-support"
            element={<ProtectedRoute><AISupportPage /></ProtectedRoute>}
          />
          <Route
            path="/ai-analyser"
            element={<ProtectedRoute><AIAnalyserPage /></ProtectedRoute>}
          />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/therapist-portal/login" element={<TherapistPortalLoginPage />} />
          <Route path="/therapist-portal/select" element={<TherapistPortalSelectPage />} />
          <Route path="/therapist-portal/edit/:id" element={<TherapistPortalEditPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
 