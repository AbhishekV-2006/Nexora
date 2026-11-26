import React, { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import { useApi } from '../context/ApiContext';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const JobDetailPage = () => {
  const { id } = useParams();
  const api = useApi();
  const [job,setJob] = useState(null);
  const { user } = useAuth();
  const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

  useEffect(()=>{
    const load = async () => {
      try {
        const res = await api.getJob(id);
        setJob(res.data.job);
      } catch (err) { console.error(err); }
    };
    load();
  }, [id]);

  if (!job) return <PageShell><main className="mx-auto max-w-4xl px-4 py-8">Loading...</main></PageShell>;

  return (
    <PageShell>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-white">{job.title}</h1>
              <p className="mt-2 text-slate-400">{job.description}</p>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-white">Skills</h4>
                <div className="mt-2 flex flex-wrap gap-2">{(job.requiredSkills||[]).map((s,i)=><span key={i} className="rounded-full bg-indigo-600/20 px-2 py-1 text-xs text-indigo-200">{s}</span>)}</div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm text-slate-400">Budget</h4>
                  <div className="text-lg text-white mt-1">{job.budgetType === 'hourly' ? `₹${job.budget?.min}/hr` : `₹${job.budget?.min} - ₹${job.budget?.max}`}</div>
                </div>
                <div>
                  <h4 className="text-sm text-slate-400">Deadline</h4>
                  <div className="text-lg text-white mt-1">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}</div>
                </div>
              </div>
            </div>

            <aside className="w-64">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
                <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full bg-slate-800">
                  {job.clientId?.profileImage ? <img src={job.clientId.profileImage.startsWith('/uploads') ? `${apiOrigin}${job.clientId.profileImage}` : job.clientId.profileImage} alt="client" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>}
                </div>
                <div className="text-sm font-semibold text-white">{job.clientId?.name}</div>
                <div className="text-xs text-slate-400">{job.clientId?.companyName || ''}</div>
                {user && user.id !== job.clientId?._id && <Link to={`/messages?with=${job.clientId?._id}`} className="mt-4 block w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2 text-center text-white">Message client</Link>}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </PageShell>
  );
};

export default JobDetailPage;
