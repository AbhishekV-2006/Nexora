import React, { useState } from 'react';
import PageShell from '../components/PageShell';
import { useApi } from '../context/ApiContext';
import { useNavigate } from 'react-router-dom';

const StepOne = ({data,setData}) => (
  <div className="space-y-4">
    <label className="block text-sm text-slate-300">Job Title</label>
    <input value={data.title||''} onChange={(e)=>setData({...data,title:e.target.value})} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100" />
    <label className="block text-sm text-slate-300">Description</label>
    <textarea value={data.description||''} onChange={(e)=>setData({...data,description:e.target.value})} rows={6} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100" />
  </div>
);

const StepSkills = ({data,setData}) => (
  <div>
    <label className="block text-sm text-slate-300">Required Skills (comma separated)</label>
    <input value={(data.requiredSkills||[]).join(', ')} onChange={(e)=>setData({...data,requiredSkills:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100" />
  </div>
);

const StepBudget = ({data,setData}) => (
  <div className="grid gap-4 md:grid-cols-2">
    <div>
      <label className="block text-sm text-slate-300">Budget Type</label>
      <select value={data.budgetType||'fixed'} onChange={(e)=>setData({...data,budgetType:e.target.value})} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100">
        <option value="fixed">Fixed</option>
        <option value="hourly">Hourly</option>
      </select>
    </div>
    <div>
      <label className="block text-sm text-slate-300">Min Budget</label>
      <input type="number" value={data.budget?.min||0} onChange={(e)=>setData({...data,budget:{...(data.budget||{}),min: Number(e.target.value)}})} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100" />
    </div>
    <div>
      <label className="block text-sm text-slate-300">Max Budget</label>
      <input type="number" value={data.budget?.max||0} onChange={(e)=>setData({...data,budget:{...(data.budget||{}),max: Number(e.target.value)}})} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100" />
    </div>
    <div>
      <label className="block text-sm text-slate-300">Deadline</label>
      <input type="date" value={data.deadline||''} onChange={(e)=>setData({...data,deadline:e.target.value})} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100" />
    </div>
  </div>
);

export const PostJob = () => {
  const [step,setStep] = useState(0);
  const [data,setData] = useState({});
  const [loading,setLoading] = useState(false);
  const api = useApi();
  const navigate = useNavigate();

  const steps = [
    <StepOne data={data} setData={setData} key={0} />,
    <StepSkills data={data} setData={setData} key={1} />,
    <StepBudget data={data} setData={setData} key={2} />,
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...data };
      const res = await api.createJob(payload);
      const job = res.data.job;
      navigate(`/jobs/${job._id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to create job');
    } finally { setLoading(false); }
  };

  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.28em] text-indigo-300">Post a Job</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Create a new job</h1>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
          <div className="space-y-6">
            {steps[step]}
            <div className="flex items-center justify-between">
              <div>
                {step > 0 && <button onClick={()=>setStep(s=>s-1)} className="mr-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">Back</button>}
                {step < steps.length-1 && <button onClick={()=>setStep(s=>s+1)} className="rounded-full bg-slate-800 px-4 py-2 text-sm text-white">Next</button>}
              </div>
              <div>
                {step === steps.length-1 && <button onClick={handleSubmit} disabled={loading} className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2 text-white">{loading ? 'Posting...' : 'Post Job'}</button>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
};

export default PostJob;
