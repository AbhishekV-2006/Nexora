import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";

const idOf = (value) => String(value?._id || value?.id || value || "");
const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const DashboardPage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [offersByJob, setOffersByJob] = useState({});
  const [myOffers, setMyOffers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const paymentResult = await api.getEscrowTransactions();
      setPayments(paymentResult.data.payments || []);
      if (user?.role === "client") {
        const result = await api.getMyJobs();
        const ownJobs = result.data.jobs || [];
        setJobs(ownJobs);
        const pairs = await Promise.all(ownJobs.map(async (job) => {
          try { return [idOf(job), (await api.getJobOffers(idOf(job))).data.offers || []]; }
          catch { return [idOf(job), []]; }
        }));
        setOffersByJob(Object.fromEntries(pairs));
      } else {
        const result = await api.getMyOffers();
        setMyOffers(result.data.offers || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [api, user?.role]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (!isAuthenticated()) {
    navigate("/login");
    return null;
  }

  const act = async (key, action) => {
    setWorking(key);
    setError("");
    try { await action(); await loadDashboard(); }
    catch (err) { setError(err.response?.data?.error || "That action could not be completed."); }
    finally { setWorking(""); }
  };

  const logoutUser = () => { logout(); navigate("/"); };

  return (
    <PageShell>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm uppercase tracking-[0.28em] text-indigo-300">Dashboard</p><h1 className="mt-2 text-3xl font-semibold text-white">Welcome, {user?.name || "there"}</h1><p className="mt-2 capitalize text-slate-400">{user?.role} workspace</p></div>
          <div className="flex flex-wrap gap-2"><Link to="/jobs" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">Browse jobs</Link>{user?.role === "client" && <Link to="/jobs/new" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Post a job</Link>}<button onClick={logoutUser} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">Logout</button></div>
        </div>

        {error && <div role="alert" className="mb-5 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
        {loading ? <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-slate-300">Loading your work…</div> : user?.role === "client" ? (
          <section className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Jobs you posted</h2>
            {!jobs.length && <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-slate-300">You haven’t posted a job yet. <Link className="text-indigo-300 underline" to="/jobs/new">Post your first job</Link>.</div>}
            {jobs.map((job) => {
              const offers = offersByJob[idOf(job)] || [];
              const payment = payments.find((item) => idOf(item.job) === idOf(job));
              return <article key={idOf(job)} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><Link to={`/jobs/${idOf(job)}`} className="text-xl font-semibold text-white hover:text-indigo-300">{job.title}</Link><p className="mt-1 text-sm text-slate-400">{money(job.budget?.min)}{job.budget?.max ? ` – ${money(job.budget.max)}` : ""} · {offers.length} offer{offers.length === 1 ? "" : "s"}</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs capitalize text-slate-300">{job.status}</span></div>
                {job.freelancerId && <p className="mt-3 text-sm text-slate-300">Accepted freelancer: <span className="font-semibold text-white">{job.freelancerId.name}</span></p>}

                {offers.length > 0 && <div className="mt-5 space-y-3"><h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Freelancer offers</h3>{offers.map((offer) => <div key={idOf(offer)} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold text-white">{offer.freelancer?.name || "Freelancer"} <span className="ml-2 text-indigo-300">{money(offer.amount)}</span></p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{offer.message}</p></div><span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize text-slate-300">{offer.status}</span></div>{job.status === "open" && offer.status === "pending" && <div className="mt-3 flex gap-2"><button disabled={Boolean(working)} onClick={() => act(idOf(offer), () => api.acceptOffer(idOf(job), idOf(offer)))} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{working === idOf(offer) ? "Saving…" : "Accept offer"}</button><button disabled={Boolean(working)} onClick={() => act(`reject-${idOf(offer)}`, () => api.rejectOffer(idOf(job), idOf(offer)))} className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-300 disabled:opacity-50">Reject</button></div>}</div>)}</div>}

                {job.status === "in-progress" && !payment && <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4"><p className="text-sm font-semibold text-amber-100">Demo payment only</p><p className="mt-1 text-xs text-slate-400">This records a simulated paid/received status. It will not charge you or transfer money.</p><button disabled={Boolean(working)} onClick={() => act(`pay-${idOf(job)}`, () => api.simulatePayment(idOf(job)))} className="mt-3 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">{working === `pay-${idOf(job)}` ? "Recording…" : "Record demo payment"}</button></div>}
                {payment && <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm"><p className="font-semibold text-emerald-200">Demo payment marked paid and received</p><p className="mt-1 text-slate-300">{money(payment.amount)} · Receipt {payment.receiptCode}</p><p className="mt-1 text-xs text-slate-400">Simulated record only; no real money moved.</p></div>}
                {job.status === "in-progress" && payment && <button disabled={Boolean(working)} onClick={() => act(`complete-${idOf(job)}`, () => api.completeJob(idOf(job)))} className="mt-4 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Mark job completed</button>}
                {job.status === "completed" && <Link to={`/jobs/${idOf(job)}`} className="mt-4 inline-block rounded-full border border-indigo-400/40 px-4 py-2 text-sm text-indigo-200">Leave / view reviews</Link>}
              </article>;
            })}
          </section>
        ) : (
          <section className="space-y-5">
            <h2 className="text-2xl font-semibold text-white">Your offers</h2>
            {!myOffers.length && <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-slate-300">You haven’t sent an offer yet. <Link className="text-indigo-300 underline" to="/jobs">Browse open jobs</Link>.</div>}
            {myOffers.map((offer) => <article key={idOf(offer)} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><div className="flex flex-wrap justify-between gap-3"><div><Link to={`/jobs/${idOf(offer.job)}`} className="font-semibold text-white hover:text-indigo-300">{offer.job?.title || "Job"}</Link><p className="mt-1 text-sm text-slate-400">{money(offer.amount)} · Client {offer.job?.clientId?.name || ""}</p></div><span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize text-slate-300">{offer.status}{offer.job?.status ? ` · ${offer.job.status}` : ""}</span></div><p className="mt-3 text-sm text-slate-300">{offer.message}</p></article>)}
          </section>
        )}
      </main>
    </PageShell>
  );
};
