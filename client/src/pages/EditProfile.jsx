import React, { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';
import { useAuth } from '../context/AuthContext';
import SkillTags from '../components/SkillTags';
import SkillInput from '../components/SkillInput';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';

export const EditProfile = () => {
  const api = useApi();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioErrors, setPortfolioErrors] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // initialize from current user
    if (user) {
      setBio(user.bio || '');
      setSkills(user.skills || []);
      setHourlyRate(user.hourlyRate || 0);
      setPortfolio(user.portfolio || []);
      setPreview(user.profileImage || null);
      setName(user.name || '');
      setEmail(user.email || '');
      setCountry(user.country || '');
      setCity(user.city || '');
      setLinkedin(user.linkedin || '');
      setRole(user.role || 'client');
      setTitle(user.title || '');
      setExperienceLevel(user.experienceLevel || 'mid');
      setAvailability(user.availability || 'immediate');
      setGithub(user.github || '');
      setPortfolioWebsite(user.portfolioWebsite || '');
      setCompanyName(user.companyName || '');
      setIndustry(user.industry || '');
      setCompanyWebsite(user.companyWebsite || '');
    }
  }, [user]);

  useEffect(() => {
    if (!avatarFile) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(avatarFile);
  }, [avatarFile]);

  const handleAvatarChange = (e) => {
    const f = e.target.files[0];
    if (f) setAvatarFile(f);
  };

  // New state for general and role-specific fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // Freelancer fields
  const [title, setTitle] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [availability, setAvailability] = useState('immediate');
  const [github, setGithub] = useState('');
  const [portfolioWebsite, setPortfolioWebsite] = useState('');

  // Client fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Client-side validation
    const minRate = 50; // minimum hourly rate in INR
    if (hourlyRate < minRate) {
      setError(`Hourly rate must be at least ₹${minRate}`);
      setLoading(false);
      return;
    }

    // Validate portfolio items
    const pErrors = portfolio.map((p) => {
      if (!p.title || p.title.trim().length < 2) return 'Title is required (min 2 chars)';
      if (!p.description || p.description.trim().length < 10) return 'Description must be at least 10 characters';
      if (p.link && !/^https?:\/\//.test(p.link)) return 'Link must be a valid URL starting with http(s)://';
      return null;
    });
    if (pErrors.some(Boolean)) {
      setPortfolioErrors(pErrors);
      setError('Please fix portfolio errors');
      setLoading(false);
      return;
    }

    try {
      // If avatar selected, upload first
      let updatedUser = null;
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        const res = await api.uploadAvatar(fd);
        updatedUser = res.data.user || res.data;
      }

      // Update profile fields
      const payload = {
        name,
        email,
        password: password || undefined,
        role,
        bio,
        country,
        city,
        linkedin,
        skills,
        hourlyRate,
        portfolio,
        // freelancer
        title: role === 'freelancer' ? title : undefined,
        experienceLevel: role === 'freelancer' ? experienceLevel : undefined,
        availability: role === 'freelancer' ? availability : undefined,
        github: role === 'freelancer' ? github : undefined,
        portfolioWebsite: role === 'freelancer' ? portfolioWebsite : undefined,
        // client
        companyName: role === 'client' ? companyName : undefined,
        industry: role === 'client' ? industry : undefined,
        companyWebsite: role === 'client' ? companyWebsite : undefined,
      };

      const res2 = await api.updateProfile(payload);
      updatedUser = updatedUser || res2.data.user || res2.data;

      if (updatedUser?.user) {
        updateUser(updatedUser.user);
      } else if (updatedUser) {
        updateUser(updatedUser);
      }

      // Redirect to the user's profile page to view changes
      const userId = updatedUser?.id || updatedUser?._id || user?.id || user?._id;
      if (userId) navigate(`/profile/${userId}`);
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.28em] text-indigo-300">Profile Settings</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Edit Profile</h1>
          <p className="mt-2 text-slate-400">Keep your professional presence polished and up to date.</p>
        </div>
        {error && <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Full name</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-slate-100 outline-none ring-0" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-slate-100 outline-none ring-0" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-slate-100 outline-none ring-0" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Role</label>
              <select value={role} onChange={(e)=>setRole(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-slate-100 outline-none ring-0">
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Country</label>
              <input value={country} onChange={(e)=>setCountry(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-slate-100 outline-none ring-0" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">City</label>
              <input value={city} onChange={(e)=>setCity(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-slate-100 outline-none ring-0" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">LinkedIn</label>
              <input value={linkedin} onChange={(e)=>setLinkedin(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-slate-100 outline-none ring-0" />
            </div>
          </div>

          {/* Role-specific inputs */}
          {role === 'freelancer' && (
            <div className="rounded-[28px] border border-slate-800 bg-slate-950/60 p-5">
              <h3 className="text-lg font-semibold text-white">Freelancer profile</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Title</label>
                  <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100 outline-none ring-0" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Experience Level</label>
                  <select value={experienceLevel} onChange={(e)=>setExperienceLevel(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100 outline-none ring-0">
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Availability</label>
                  <select value={availability} onChange={(e)=>setAvailability(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100 outline-none ring-0">
                    <option value="immediate">Immediate</option>
                    <option value="part-time">Part-time</option>
                    <option value="full-time">Full-time</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">GitHub</label>
                  <input value={github} onChange={(e)=>setGithub(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100 outline-none ring-0" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Portfolio Website</label>
                  <input value={portfolioWebsite} onChange={(e)=>setPortfolioWebsite(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100 outline-none ring-0" />
                </div>
              </div>
            </div>
          )}

          {role === 'client' && (
            <div className="rounded-[28px] border border-slate-800 bg-slate-950/60 p-5">
              <h3 className="text-lg font-semibold text-white">Client profile</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Company Name</label>
                  <input value={companyName} onChange={(e)=>setCompanyName(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100 outline-none ring-0" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Industry</label>
                  <input value={industry} onChange={(e)=>setIndustry(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100 outline-none ring-0" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Company Website</label>
                  <input value={companyWebsite} onChange={(e)=>setCompanyWebsite(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100 outline-none ring-0" />
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-4 rounded-[28px] border border-slate-800 bg-slate-950/60 p-5 md:flex-row md:items-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border border-slate-700 bg-slate-900">
              {preview ? <img src={preview} alt="preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>}
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-300">Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-sm text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">Max size 10MB. Images only.</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-800 bg-slate-950/60 p-5">
            <label className="mb-1 block text-sm font-medium text-slate-300">Bio</label>
            <textarea value={bio} onChange={(e)=>setBio(e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100 outline-none ring-0" />
          </div>

          <div className="rounded-[28px] border border-slate-800 bg-slate-950/60 p-5">
            <label className="mb-1 block text-sm font-medium text-slate-300">Skills</label>
            <SkillInput skills={skills} onChange={setSkills} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-slate-800 bg-slate-950/60 p-5">
              <label className="mb-1 block text-sm font-medium text-slate-300">Hourly Rate (INR)</label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">₹</span>
                <input type="number" value={hourlyRate} onChange={(e)=>setHourlyRate(Number(e.target.value))} className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-slate-100 outline-none ring-0" />
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-800 bg-slate-950/60 p-5">
              <label className="mb-1 block text-sm font-medium text-slate-300">Portfolio</label>
              <div className="space-y-3">
                {portfolio.map((p, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                    <input className="mb-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 p-2 text-sm text-slate-100" value={p.title} onChange={(e)=>{ const next=[...portfolio]; next[idx].title=e.target.value; setPortfolio(next); }} placeholder="Project title" />
                    <textarea className="mb-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 p-2 text-sm text-slate-100" value={p.description} onChange={(e)=>{ const next=[...portfolio]; next[idx].description=e.target.value; setPortfolio(next); }} placeholder="Short description" rows={2} />
                    <input className="w-full rounded-xl border border-slate-700 bg-slate-950/70 p-2 text-sm text-slate-100" value={p.link} onChange={(e)=>{ const next=[...portfolio]; next[idx].link=e.target.value; setPortfolio(next); }} placeholder="https://example.com" />
                    {portfolioErrors[idx] && <p className="mt-2 text-sm text-red-300">{portfolioErrors[idx]}</p>}
                  </div>
                ))}
                <button type="button" className="rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800" onClick={()=>{ setPortfolio([...portfolio, { title:'', description:'', link:'' }]); setPortfolioErrors([...portfolioErrors, null]); }}>+ Add item</button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button type="submit" className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

