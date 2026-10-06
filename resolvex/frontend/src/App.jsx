import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import NotFoundPage from './pages/NotFoundPage';

import DashboardPage from './pages/DashboardPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import ComplaintHistoryPage from './pages/ComplaintHistoryPage';
import ComplaintDetailsPage from './pages/ComplaintDetailsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage';
import AdminActivityLogsPage from './pages/admin/AdminActivityLogsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public marketing pages */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Auth pages (no shell) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

            {/* Authenticated app shell */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Student / Faculty */}
                <Route element={<RoleRoute roles={['student', 'faculty']} />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/complaints/new" element={<SubmitComplaintPage />} />
                </Route>

                {/* Staff */}
                <Route element={<RoleRoute roles={['staff']} />}>
                  <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
                </Route>

                {/* Admin */}
                <Route element={<RoleRoute roles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
                  <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
                  <Route path="/admin/activity-logs" element={<AdminActivityLogsPage />} />
                </Route>

                {/* Shared across all authenticated roles */}
                <Route path="/complaints" element={<ComplaintHistoryPage />} />
                <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          <ToastContainer position="top-right" autoClose={4000} newestOnTop />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
