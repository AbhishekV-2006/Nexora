import React, { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';
import { useParams, Link } from 'react-router-dom';
import SkillTags from '../components/SkillTags';
import VerificationBadge from '../components/VerificationBadge';
import { useAuth } from '../context/AuthContext';
import PageShell from '../components/PageShell';

export const ProfilePage = () => {
  const { id } = useParams();
  const api = useApi();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : (import.meta.env.DEV ? 'http://localhost:5001' : '');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.getUser(id);
        setUser(res.data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    api.getUserReviews(user._id).then((res) => {
      if (!cancelled) setReviews(res.data.reviews || []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [api, user?._id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-transparent text-slate-200">Loading profile...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-transparent text-slate-200">User not found</div>;

  const isFreelancer = user?.role === 'freelancer';
  const avatarSrc = user.profileImage && user.profileImage.startsWith('/uploads')
    ? `${API_BASE}${user.profileImage}`
    : (user.profileImage || '/placeholder-avatar.png');

  const statCards = isFreelancer
    ? [
        { label: 'Projects Completed', value: user.projectsCompleted || user.completedProjects || 0 },
        { label: 'Average Rating', value: reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '—' },
        { label: 'Success Rate', value: user.successRate || '—' },
      ]
    : [
        { label: 'Jobs Posted', value: user.jobsPosted || 0 },
        { label: 'Freelancers Hired', value: user.freelancersHired || 0 },
        { label: 'Total Spent', value: user.totalSpent ? `₹${Number(user.totalSpent).toLocaleString('en-IN')}` : '—' },
        { label: 'Average Rating Received', value: reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '—' },
      ];

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="h-28 w-28 overflow-hidden rounded-[24px] border-4 border-slate-800 shadow-lg">
                <img src={avatarSrc} alt="avatar" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold text-white">{user.name || 'Unnamed User'}</h1>
                  <VerificationBadge verified={user.verificationBadge} />
                  {currentUser && currentUser.id !== user._id && <Link to={`/messages?with=${user._id}`} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Message</Link>}
                </div>
                {isFreelancer ? (
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-indigo-300">{user.title || 'Professional'}</p>
                    <p className="text-sm text-slate-400">{[user.country, user.city].filter(Boolean).join(', ') || 'Location not added yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-indigo-300">{user.companyName || 'Company'}</p>
                    <p className="text-sm text-slate-400">{[user.country, user.city].filter(Boolean).join(', ') || 'Location not added yet'}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                  <span className="rounded-full bg-slate-800 px-3 py-1">{user.role === 'freelancer' ? 'Freelancer' : 'Client'}</span>
                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-indigo-300">{user.completionPercentage || 0}% complete</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {currentUser && String(currentUser.id) === String(user.id) && (
                <Link to="/profile/edit" className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:scale-[1.01]">
                  Edit Profile
                </Link>
              )}
              <Link to="/dashboard" className="rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((card, index) => (
            <div key={index} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
              <h2 className="text-xl font-semibold text-white">Reviews</h2>
              <div className="mt-5 space-y-3">
                {reviews.map((review) => <article key={review._id} className="rounded-2xl border border-white/10 bg-slate-800/60 p-4"><div className="flex items-center justify-between gap-2"><p className="font-semibold text-white">{review.reviewer?.name || 'Nexora member'}</p><span className="text-amber-300">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div><p className="mt-2 text-sm text-slate-300">{review.comment}</p><p className="mt-2 text-xs text-slate-500">{review.job?.title || 'Completed job'}</p></article>)}
                {!reviews.length && <p className="text-sm text-slate-400">No reviews yet.</p>}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Bio / About Me</h2>
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <p className="mt-4 leading-7 text-slate-400">
                {user.bio || 'No bio added yet. Tell people more about your expertise and what you are looking for.'}
              </p>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
              <h2 className="text-xl font-semibold text-white">Skills</h2>
              <div className="mt-4">
                {(user.skills && user.skills.length > 0) ? <SkillTags skills={user.skills} /> : <p className="text-slate-400">No skills added yet.</p>}
              </div>
            </section>

            {isFreelancer ? (
              <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                <h2 className="text-xl font-semibold text-white">Professional Details</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-800/70 p-4">
                    <p className="text-sm text-slate-400">Hourly Rate</p>
                    <p className="mt-1 text-lg font-semibold text-white">₹{user.hourlyRate ? Number(user.hourlyRate).toLocaleString('en-IN') : '—'} / hr</p>
                  </div>
                  <div className="rounded-2xl bg-slate-800/70 p-4">
                    <p className="text-sm text-slate-400">Experience Level</p>
                    <p className="mt-1 text-lg font-semibold text-white">{user.experienceLevel || '—'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-800/70 p-4">
                    <p className="text-sm text-slate-400">Availability</p>
                    <p className="mt-1 text-lg font-semibold text-white">{user.availability || '—'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-800/70 p-4">
                    <p className="text-sm text-slate-400">Location</p>
                    <p className="mt-1 text-lg font-semibold text-white">{[user.country, user.city].filter(Boolean).join(', ') || '—'}</p>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                <h2 className="text-xl font-semibold text-white">Company Details</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-800/70 p-4">
                    <p className="text-sm text-slate-400">Industry</p>
                    <p className="mt-1 text-lg font-semibold text-white">{user.industry || '—'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-800/70 p-4">
                    <p className="text-sm text-slate-400">Company Website</p>
                    <p className="mt-1 text-lg font-semibold text-white">{user.companyWebsite ? <a href={user.companyWebsite} target="_blank" rel="noreferrer" className="text-indigo-300 hover:underline">{user.companyWebsite}</a> : '—'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-800/70 p-4">
                    <p className="text-sm text-slate-400">Active Projects</p>
                    <p className="mt-1 text-lg font-semibold text-white">{user.activeProjects || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-800/70 p-4">
                    <p className="text-sm text-slate-400">Recent Projects</p>
                    <p className="mt-1 text-lg font-semibold text-white">{user.recentProjects || 0}</p>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
              <h2 className="text-xl font-semibold text-white">{isFreelancer ? 'Portfolio Projects' : 'Recent Projects'}</h2>
              <div className="mt-5 space-y-4">
                {(user.portfolio && user.portfolio.length > 0) ? user.portfolio.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-white">{item.title || 'Untitled Project'}</h3>
                      {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-300 hover:underline">View Project</a>}
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{item.description || 'No description provided.'}</p>
                  </div>
                )) : <p className="text-slate-400">No portfolio projects added yet.</p>}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
              <h2 className="text-xl font-semibold text-white">Contact & Links</h2>
              <div className="mt-5 space-y-3">
                {user.github && <a href={user.github} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"> <span>GitHub</span><span className="text-indigo-300">Open</span></a>}
                {user.linkedin && <a href={user.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"> <span>LinkedIn</span><span className="text-indigo-300">Open</span></a>}
                {user.portfolioWebsite && <a href={user.portfolioWebsite} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"> <span>Portfolio Website</span><span className="text-indigo-300">Open</span></a>}
                {!user.github && !user.linkedin && !user.portfolioWebsite && !user.companyWebsite && <p className="text-slate-400">No links added yet.</p>}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
              <h2 className="text-xl font-semibold text-white">Quick Profile</h2>
              <div className="mt-5 space-y-3 text-sm text-slate-400">
                <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 px-4 py-3">
                  <span>Full Name</span><span className="font-semibold text-white">{user.name || '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 px-4 py-3">
                  <span>{isFreelancer ? 'Professional Title' : 'Company Name'}</span><span className="font-semibold text-white">{isFreelancer ? user.title || '—' : user.companyName || '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 px-4 py-3">
                  <span>Country</span><span className="font-semibold text-white">{user.country || '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 px-4 py-3">
                  <span>City</span><span className="font-semibold text-white">{user.city || '—'}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
};
