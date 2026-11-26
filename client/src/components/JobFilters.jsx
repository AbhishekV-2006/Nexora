import React, { useState } from 'react';

export const JobFilters = ({onChange, initial={}}) => {
  const [skill,setSkill] = useState(initial.skill||'');
  const [minBudget,setMinBudget] = useState(initial.minBudget||'');
  const [maxBudget,setMaxBudget] = useState(initial.maxBudget||'');
  const [category,setCategory] = useState(initial.category||'');

  const apply = () => {
    onChange({ skill, minBudget, maxBudget, category });
  };

  return (
    <div className="space-y-4 rounded-xl border border-white/5 bg-slate-900/60 p-4">
      <h4 className="text-sm font-semibold text-white">Filters</h4>
      <div>
        <label className="text-xs text-slate-400">Skill</label>
        <input value={skill} onChange={(e)=>setSkill(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/50 p-2 text-sm text-slate-100" placeholder="e.g. React" />
      </div>
      <div className="grid gap-2 grid-cols-2">
        <div>
          <label className="text-xs text-slate-400">Min</label>
          <input value={minBudget} onChange={(e)=>setMinBudget(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/50 p-2 text-sm text-slate-100" />
        </div>
        <div>
          <label className="text-xs text-slate-400">Max</label>
          <input value={maxBudget} onChange={(e)=>setMaxBudget(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/50 p-2 text-sm text-slate-100" />
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-400">Category</label>
        <input value={category} onChange={(e)=>setCategory(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/50 p-2 text-sm text-slate-100" placeholder="e.g. Web Dev" />
      </div>
      <div className="flex items-center justify-between">
        <button onClick={()=>{ setSkill(''); setMinBudget(''); setMaxBudget(''); setCategory(''); onChange({}) }} className="text-sm text-slate-400">Clear</button>
        <button onClick={apply} className="rounded-full bg-indigo-600 px-3 py-1 text-sm text-white">Apply</button>
      </div>
    </div>
  );
};

export default JobFilters;
