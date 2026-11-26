import React from 'react';
import { Link } from 'react-router-dom';

export const JobCard = ({job}) => {
  return (
    <Link to={`/jobs/${job._id}`} className="block rounded-2xl border border-white/10 bg-slate-900/70 p-4 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-400 line-clamp-2">{job.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-300">{job.budgetType === 'hourly' ? `₹${job.budget?.min}/hr` : `₹${job.budget?.min} - ₹${job.budget?.max}`}</div>
          <div className="mt-2 text-xs text-slate-400">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(job.requiredSkills||[]).slice(0,6).map((s,i)=> <span key={i} className="rounded-full bg-indigo-600/20 px-2 py-1 text-xs text-indigo-200">{s}</span>)}
      </div>
    </Link>
  );
};

export default JobCard;
