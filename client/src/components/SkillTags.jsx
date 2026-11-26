import React from 'react';

const SkillTags = ({ skills = [] }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s, i) => (
        <span key={i} className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 text-indigo-700 rounded-full text-sm">{s}</span>
      ))}
      {skills.length === 0 && <span className="text-gray-500">No skills listed</span>}
    </div>
  );
};

export default SkillTags;
