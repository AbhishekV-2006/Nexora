import React, { useState, useRef } from 'react';

/**
 * SkillInput
 * - Allows comma or Enter separated tags
 * - Shows pills and allows removal
 * - onChange receives updated array of skills
 *
 * Tailwind notes on classes used:
 * - container: responsive width and padding
 * - input: visually hidden borders replaced with subtle shadow for modern look
 */
const SkillInput = ({ skills = [], onChange }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const [removing, setRemoving] = useState({});

  const addTag = (value) => {
    const v = value.split(',').map(s=>s.trim()).filter(Boolean);
    if (v.length === 0) return;
    const next = Array.from(new Set([...skills, ...v]));
    onChange(next);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (text.trim()) addTag(text);
    } else if (e.key === 'Backspace' && !text && skills.length) {
      // remove last tag
      const next = skills.slice(0, -1);
      onChange(next);
    }
  };

  const removeTag = (idx) => {
    const val = skills[idx];
    // mark as removing to play CSS transition
    setRemoving((r) => ({ ...r, [val]: true }));
    // after transition, remove from array
    setTimeout(() => {
      const next = skills.filter((_, i) => i !== idx);
      onChange(next);
      setRemoving((r) => {
        const copy = { ...r };
        delete copy[val];
        return copy;
      });
    }, 160);
  };

  const handlePaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    if (paste.includes(',')) {
      e.preventDefault();
      addTag(paste);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 items-center">
        {skills.map((s, i) => (
          <span key={i} className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${removing[s] ? 'opacity-0 scale-95 transition duration-150' : 'opacity-100 scale-100 transition duration-150'} bg-gradient-to-r from-indigo-50 to-white border-indigo-100 text-indigo-700`}>
            <span>{s}</span>
            <button type="button" onClick={() => removeTag(i)} className="ml-2 text-indigo-400 hover:text-indigo-600">✕</button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="flex-1 min-w-[160px] px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder="Type skills, press Enter or comma"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">Press Enter or comma to add. Click × to remove.</p>
    </div>
  );
};

export default SkillInput;
