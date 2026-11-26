import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";

const idOf = (value) => String(value?._id || value?.id || value || "");

export default function PaymentsPage() {
  const api = useApi();
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.getEscrowTransactions().then(({ data }) => {
      if (!cancelled) setPayments(data.payments || []);
    }).catch((err) => {
      if (!cancelled) setError(err.response?.data?.error || "Could not load payment records.");
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [api]);

  return <PageShell><main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5"><p className="font-semibold text-amber-100">Demo payments only</p><p className="mt-1 text-sm text-amber-100/80">These records simulate payment and receipt status for the project flow. No payment provider is connected and no real money is charged or transferred.</p></div>
    <h1 className="text-3xl font-semibold text-white">Payments</h1>
    <p className="mt-2 text-slate-400">Simulated payment records linked to accepted job offers.</p>
    {error && <div role="alert" className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
    {loading ? <p className="mt-6 text-slate-300">Loading records…</p> : payments.length ? <div className="mt-6 space-y-3">{payments.map((payment) => {
      const isPayer = idOf(payment.payer) === idOf(user);
      return <article key={idOf(payment)} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><Link to={`/jobs/${idOf(payment.job)}`} className="font-semibold text-white hover:text-indigo-300">{payment.job?.title || "Job"}</Link><p className="mt-1 text-sm text-slate-400">{isPayer ? `Paid to ${payment.recipient?.name || "freelancer"}` : `Received from ${payment.payer?.name || "client"}`}</p></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase text-emerald-200">{isPayer ? "Marked paid" : "Marked received"}</span></div><div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-4 text-sm"><span className="font-semibold text-white">₹{Number(payment.amount).toLocaleString("en-IN")} · {payment.currency}</span><span className="text-slate-400">Receipt {payment.receiptCode}</span><span className="text-slate-500">{new Date(payment.createdAt).toLocaleString()}</span></div><p className="mt-2 text-xs text-amber-200/80">Simulation only. No real money moved.</p></article>;
    })}</div> : <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-slate-300">No simulated payment records yet. Clients can record a demo payment for an accepted offer from their dashboard.</div>}
  </main></PageShell>;
}
