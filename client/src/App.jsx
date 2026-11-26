/**
 * Main App Component with React Router
 * 
 * TECHNOLOGY: React Router v6 for client-side routing
 * WHY: Single Page Application (SPA) provides fast navigation without page refreshes
 * - Browser history management for back/forward buttons
 * - Protected routes ensure only authenticated users access restricted pages
 * - Dynamic route loading optimizes initial page load
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Root component wraps all context providers (Auth, API)
 * - Routes defined for public (Home, Login, Register) and protected (Dashboard) pages
 * - Protected route wrapper prevents unauthorized access
 * - Foundation for later additions: Projects, Messaging, Escrow, Settings
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ApiProvider } from "./context/ApiContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Header from './components/Header';
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EditProfile } from "./pages/EditProfile";
import JobListPage from "./pages/JobListPage";
import PostJob from "./pages/PostJob";
import JobDetailPage from "./pages/JobDetailPage";
import MessagesPage from "./pages/MessagesPage";

/**
 * Protected Route Wrapper
 * Redirects unauthenticated users to login
 */

/**
 * Main App Component
 * Provides all contexts and defines routes
 */
function App() {
  return (
    <ApiProvider>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/jobs/new" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />

            {/* Placeholder Routes (Coming Soon) */}
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <h1 className="text-3xl font-bold text-gray-900">Projects - Coming Soon</h1>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <h1 className="text-3xl font-bold text-gray-900">Escrow Payments - Coming Soon</h1>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* 404 Not Found */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-6">Page not found</p>
                    <a href="/" className="text-primary font-bold hover:underline">
                      Go back home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApiProvider>
  );
}

export default App;
