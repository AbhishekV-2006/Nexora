/**
 * Home Page Component
 * 
 * TECHNOLOGY: React functional component with Tailwind CSS
 * WHY: Landing page provides clear entry points for different user types
 * 
 * NEXORA ARCHITECTURE FIT:
 * - First page users see when visiting the marketplace
 * - Directs users to login/register or browse projects
 * - Role-specific buttons (Hire Freelancer vs Earn Money)
 */
import PageShell from '../components/PageShell';

export const HomePage = () => {
  return (
    <PageShell>
      <div className="w-full max-w-6xl rounded-[32px] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10 lg:p-14 mx-auto">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="text-white">
            <div className="inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200">
              Premium freelance networking
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Hire elite talent. Build with confidence.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Nexora brings together founders, clients, and top-tier freelancers in one refined space with secure workflows and beautiful collaboration.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.02]">
                💼 I want to hire
              </button>
              <button className="rounded-full border border-slate-700 bg-slate-800/70 px-6 py-3 font-semibold text-slate-100 transition hover:border-indigo-400 hover:text-white">
                🚀 I want to earn
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-inner shadow-black/20">
            <h2 className="text-2xl font-semibold text-white">Why teams choose Nexora</h2>
            <ul className="mt-6 space-y-4 text-slate-300">
              <li className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">✅ Secure escrow and transparent payments</li>
              <li className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">✅ Real-time collaboration and messaging</li>
              <li className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">✅ Role-aware dashboards for clients and freelancers</li>
              <li className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">✅ Premium profile pages with trust signals and portfolios</li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
};
