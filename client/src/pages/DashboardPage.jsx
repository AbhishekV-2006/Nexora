/**
 * Dashboard Page Component
 * 
 * TECHNOLOGY: React with conditional rendering based on user role
 * WHY: Role-based dashboard provides different views for freelancers and clients
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Displays user-specific content based on role (freelancer/client)
 * - Protected route accessible only to authenticated users
 * - Foundation for future project listings, messaging, escrow dashboard
 */

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PageShell from '../components/PageShell';

export const DashboardPage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated()) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isDashboardContent = {
    freelancer: (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">My Jobs</h2>
        <p className="text-slate-400">Browse available projects and submit proposals with confidence.</p>
        <button onClick={()=>navigate('/jobs')} className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 font-semibold text-white transition hover:scale-[1.02]">
          View Jobs
        </button>
      </div>
    ),
    client: (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">My Projects</h2>
        <p className="text-slate-400">Create new projects and manage freelancers in a streamlined workspace.</p>
        <button onClick={()=>navigate('/jobs/new')} className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 font-semibold text-white transition hover:scale-[1.02]">
          Post a Job
        </button>
      </div>
    ),
  };

  return (
    <PageShell>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-indigo-300">Dashboard</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Welcome, {user?.name || 'there'}!</h2>
              <p className="mt-2 text-slate-400">Role: {user?.role === "freelancer" ? "🚀 Freelancer" : "💼 Client"}</p>
            </div>
            <button onClick={handleLogout} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white">
              Logout
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
          {isDashboardContent[user?.role] || (
            <div>
              <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
              <p className="mt-2 text-slate-400">Content coming soon...</p>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1">
            <h3 className="text-xl font-semibold text-white">💬 Messaging</h3>
            <p className="mt-2 text-slate-400">Real-time communication with clients and freelancers.</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1">
            <h3 className="text-xl font-semibold text-white">💰 Escrow</h3>
            <p className="mt-2 text-slate-400">Secure payment management and disputes.</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1">
            <h3 className="text-xl font-semibold text-white">⚙️ Settings</h3>
            <p className="mt-2 text-slate-400">Manage your profile and preferences.</p>
          </div>
        </div>
      </main>
    </PageShell>
  );
};
