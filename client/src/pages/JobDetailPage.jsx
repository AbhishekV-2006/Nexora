import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";

const idOf = (value) => String(value?._id || value?.id || value || "");
const errorText = (err) => typeof err.response?.data?.error === "string" ? err.response.data.error : "Could not complete that action.";

export default function JobDetailPage() {
  const { id } = useParams();
  const api = useApi();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [myOffer, setMyOffer] = useState(null);
  const [amount, setAmount] = useState("");
  const [proposal, setProposal] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [hasPayment, setHasPayment] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const apiOrigin = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001/api" : "/api")).replace(/\/api\/?$/, "");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.getJob(id);
        if (!cancelled) setJob(data.job);
      } catch (err) { if (!cancelled) setError(errorText(err)); }
    };
    load();
    return () => { cancelled = true; };
  }, [api, id]);

  useEffect(() => {
    if (user?.role !== "freelancer") return;
    let cancelled = false;
    api.getMyOffers().then(({ data }) => {
      const existing = (data.offers || []).find((offer) => idOf(offer.job) === id);
      if (!cancelled) setMyOffer(existing || null);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [api, id, user?.role]);

  useEffect(() => {
    if (!job) return;
    let cancelled = false;
    Promise.all([api.getJobReviews(id), user ? api.getEscrowTransactions().catch(() => ({ data: { payments: [] } })) : Promise.resolve({ data: { payments: [] } })])
      .then(([reviewResult, paymentResult]) => {
        if (cancelled) return;
        setReviews(reviewResult.data.reviews || []);
        setHasPayment((paymentResult.data.payments || []).some((payment) => idOf(payment.job) === idOf(job)));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [api, id, job, user]);

  if (!job) return <PageShell><main className="mx-auto max-w-4xl px-4 py-8 text-slate-200">{error || "Loading job…"}</main></PageShell>;

  const isClient = idOf(user) === idOf(job.clientId);
  const isAssignedFreelancer = idOf(user) === idOf(job.freelancerId);
  const myReview = reviews.find((review) => idOf(review.reviewer) === idOf(user));

  const submitOffer = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      await api.submitOffer(id, { amount: Number(amount), message: proposal });
      setMyOffer({ amount: Number(amount), message: proposal, status: "pending" });
      setNotice("Offer sent to the client."); setProposal("");
    } catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  };

  const submitReview = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const { data } = await api.submitReview(id, { rating: Number(rating), comment });
      setReviews((current) => [...current, data.review]); setComment(""); setNotice("Your review was saved.");
    } catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  };

  return (
    <PageShell>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error && <div role="alert" className="mb-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
        {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{notice}</div>}
        <article className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full border border-white/10 px-3 py-1 text-xs capitalize text-slate-300">{job.status}</span><h1 className="mt-3 text-2xl font-semibold text-white">{job.title}</h1></div><div className="text-right"><p className="text-sm text-slate-400">Budget</p><p className="text-lg text-white">₹{job.budget?.min || 0}{job.budget?.max ? ` – ₹${job.budget.max}` : ""}{job.budgetType === "hourly" ? "/hr" : ""}</p></div></div>
          <p className="mt-4 whitespace-pre-wrap text-slate-300">{job.description}</p>
          {!!job.requiredSkills?.length && <div className="mt-4 flex flex-wrap gap-2">{job.requiredSkills.map((skill) => <span key={skill} className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">{skill}</span>)}</div>}
          <div className="mt-5 flex flex-wrap gap-4 border-t border-white/10 pt-4 text-sm text-slate-300"><span>Client: {job.clientId?.name}</span>{job.freelancerId && <span>Freelancer: {job.freelancerId.name}</span>}{job.deadline && <span>Due: {new Date(job.deadline).toLocaleDateString()}</span>}</div>
          {user && !isClient && <Link to={`/messages?with=${idOf(job.clientId)}`} className="mt-4 inline-block rounded-full border border-indigo-400/40 px-4 py-2 text-sm text-indigo-200">Message client</Link>}
        </article>

        {user?.role === "freelancer" && job.status === "open" && !isClient && (myOffer ? <div className="mt-5 rounded-2xl border border-indigo-400/20 bg-indigo-400/5 p-5"><p className="font-semibold text-white">You sent an offer for ₹{Number(myOffer.amount).toLocaleString("en-IN")}</p><p className="mt-1 text-sm capitalize text-indigo-200">Status: {myOffer.status}</p><p className="mt-2 text-sm text-slate-300">{myOffer.message}</p></div> : <form onSubmit={submitOffer} className="mt-5 rounded-3xl border border-white/10 bg-slate-900/80 p-6"><h2 className="text-xl font-semibold text-white">Send an offer</h2><p className="mt-1 text-sm text-slate-400">The client can accept one offer. Your proposal and amount are visible to them.</p><label className="mt-4 block text-sm text-slate-300" htmlFor="offer-amount">Your amount (₹)</label><input id="offer-amount" required min="1" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"/><label className="mt-4 block text-sm text-slate-300" htmlFor="offer-message">Proposal</label><textarea id="offer-message" required minLength="10" maxLength="2000" rows="4" value={proposal} onChange={(event) => setProposal(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white" placeholder="Describe how you would deliver this work"/><button disabled={busy} className="mt-4 rounded-full bg-indigo-600 px-5 py-2 font-semibold text-white disabled:opacity-50">{busy ? "Sending…" : "Send offer"}</button></form>)}

        {job.status === "completed" && hasPayment && (isClient || isAssignedFreelancer) && <section className="mt-5 rounded-3xl border border-white/10 bg-slate-900/80 p-6"><h2 className="text-xl font-semibold text-white">Reviews</h2><div className="mt-4 space-y-3">{reviews.map((review) => <div key={idOf(review)} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><div className="flex items-center justify-between"><p className="font-semibold text-white">{review.reviewer?.name} reviewed {review.reviewee?.name}</p><span className="text-amber-300">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div><p className="mt-2 text-sm text-slate-300">{review.comment}</p></div>)}</div>{!myReview && <form onSubmit={submitReview} className="mt-5 border-t border-white/10 pt-5"><h3 className="font-semibold text-white">Leave your review</h3><label className="mt-3 block text-sm text-slate-300" htmlFor="review-rating">Rating</label><select id="review-rating" value={rating} onChange={(event) => setRating(event.target.value)} className="mt-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n === 1 ? "" : "s"}</option>)}</select><label className="mt-3 block text-sm text-slate-300" htmlFor="review-comment">Feedback</label><textarea id="review-comment" required minLength="5" maxLength="1500" rows="3" value={comment} onChange={(event) => setComment(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white" placeholder="Share what it was like working together"/><button disabled={busy} className="mt-3 rounded-full bg-indigo-600 px-5 py-2 font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Submit review"}</button></form>}{myReview && <p className="mt-4 text-sm text-emerald-200">You’ve already reviewed this job.</p>}</section>}
      </main>
    </PageShell>
  );
}
