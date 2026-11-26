import React, { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import { useApi } from '../context/ApiContext';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';

export const JobListPage = () => {
  const api = useApi();
  const [filters,setFilters] = useState({});
  const [jobs,setJobs] = useState([]);
  const [page,setPage] = useState(1);
  const [total,setTotal] = useState(0);
  const limit = 12;

  const load = async () => {
    const params = { ...filters, page, limit };
    try {
      const res = await api.listJobs(params);
      setJobs(res.data.jobs || []);
      setTotal(res.data.total || 0);
    } catch (err) { console.error(err); }
  };

  useEffect(()=>{ load(); }, [filters, page]);

  return (
    <PageShell>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-4">
          <aside className="md:col-span-1 hidden md:block">
            <JobFilters onChange={(f)=>{ setFilters(f); setPage(1); }} initial={filters} />
          </aside>
          <section className="md:col-span-3 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map(j => <JobCard key={j._id} job={j} />)}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">Showing {jobs.length} of {total}</div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">Prev</button>
                <div className="text-sm text-slate-300">Page {page}</div>
                <button onClick={()=>setPage(p=>p+1)} className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">Next</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </PageShell>
  );
};

export default JobListPage;
