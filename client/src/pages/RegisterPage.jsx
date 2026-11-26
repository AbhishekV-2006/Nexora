/**
 * Register Page Component
 *
 * TECHNOLOGY: React with form state management and role selection
 * WHY: Registration handles user signup with role selection (freelancer/client)
 *
 * NEXORA ARCHITECTURE FIT:
 * - Captures user info and role for role-based access control
 * - Routes to AuthContext.register for account creation
 * - Foundation for marketplace role separation
 *
 * DESIGN SYSTEM:
 * - Ink (#12141C) / Paper (#FBF9F5) base — a confident, premium two-tone backdrop
 * - Dual accent system tied to the role toggle itself:
 *     Client    -> #3658FF (cool, decisive — "I'm hiring")
 *     Freelancer-> #FF6B47 (warm, energetic — "I'm working")
 *   The whole UI (glow, focus rings, button) shifts color live as you choose
 *   your side of the marketplace — this *is* the signature interaction.
 * - Display type: Fraunces (serif, warm, premium) for the headline
 * - Body/UI type: Inter for everything functional (inputs, labels, buttons)
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

// Color tokens — keep in sync with the role toggle below.
const INK = '#12141C';
const PAPER = '#FBF9F5';
const BORDER = '#E5E1D8';
const MUTED = '#6B7280';

const CLIENT = { main: '#3658FF', hover: '#2A45CC', tint: '#EEF1FF' };
const FREELANCER = { main: '#FF6B47', hover: '#E8553A', tint: '#FFF1ED' };

const BriefcaseIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="7" width="19" height="13" rx="2.2" />
    <path d="M8 7V5.2A1.7 1.7 0 0 1 9.7 3.5h4.6A1.7 1.7 0 0 1 16 5.2V7" />
    <path d="M2.5 12.5h19" />
  </svg>
);

const SparkIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </svg>
);

// Faint constellation backdrop — quiet nod to "Nexora" (a nexus of two sides).
const Constellation = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <g stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="0.15">
      <line x1="8" y1="14" x2="24" y2="28" />
      <line x1="24" y1="28" x2="18" y2="46" />
      <line x1="92" y1="10" x2="76" y2="24" />
      <line x1="76" y1="24" x2="84" y2="42" />
      <line x1="10" y1="88" x2="26" y2="74" />
      <line x1="90" y1="92" x2="74" y2="78" />
      <line x1="50" y1="6" x2="50" y2="18" />
    </g>
    <g fill="#FFFFFF">
      <circle cx="8" cy="14" r="0.5" fillOpacity="0.25" />
      <circle cx="24" cy="28" r="0.5" fillOpacity="0.18" className="animate-[pulse_5s_ease-in-out_infinite]" />
      <circle cx="18" cy="46" r="0.4" fillOpacity="0.15" />
      <circle cx="92" cy="10" r="0.5" fillOpacity="0.2" />
      <circle cx="76" cy="24" r="0.4" fillOpacity="0.15" className="animate-[pulse_6s_ease-in-out_infinite]" />
      <circle cx="84" cy="42" r="0.45" fillOpacity="0.18" />
      <circle cx="10" cy="88" r="0.4" fillOpacity="0.15" />
      <circle cx="26" cy="74" r="0.5" fillOpacity="0.2" />
      <circle cx="90" cy="92" r="0.4" fillOpacity="0.15" />
      <circle cx="74" cy="78" r="0.45" fillOpacity="0.18" />
      <circle cx="50" cy="6" r="0.4" fillOpacity="0.15" />
    </g>
  </svg>
);

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [localErrors, setLocalErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const accent = role === 'client' ? CLIENT : FREELANCER;

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email";
    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setLocalErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSubmitting(true);
    const result = await register(name.trim(), email.toLowerCase().trim(), password, role);
    setIsSubmitting(false);
    if (result.success) navigate('/dashboard');
    else setLocalErrors({ form: result.error || 'Registration failed' });
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: PAPER,
      fontFamily: 'Inter, sans-serif',
      '& fieldset': { borderColor: BORDER },
      '&:hover fieldset': { borderColor: accent.main },
      '&.Mui-focused fieldset': { borderColor: accent.main, borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': { fontFamily: 'Inter, sans-serif', color: MUTED },
    '& .MuiInputLabel-root.Mui-focused': { color: accent.main },
    '& .MuiFormHelperText-root': { fontFamily: 'Inter, sans-serif', marginLeft: 0 },
    '& input': { color: INK },
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: INK }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
        @media (prefers-reduced-motion: reduce) {
          .nexora-pulse, [class*="animate-"] { animation: none !important; }
        }
      `}</style>

      <Constellation />

      <div className="relative w-full max-w-md">
        {/* Ambient glow that shifts with the chosen role */}
        <div
          className="pointer-events-none absolute -inset-2 rounded-[32px] blur-2xl opacity-30 transition-colors duration-500"
          style={{ backgroundColor: accent.main }}
          aria-hidden="true"
        />

        <div
          className="relative rounded-[24px] p-8 shadow-2xl shadow-black/40"
          style={{ backgroundColor: PAPER }}
        >
          {/* Accent bar */}
          <div
            className="mb-7 h-1 w-12 rounded-full transition-colors duration-300"
            style={{ backgroundColor: accent.main }}
          />

          <div className="mb-7">
            <div
              className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-semibold"
              style={{ backgroundColor: INK, color: PAPER, fontFamily: "'Fraunces', serif" }}
            >
              N
            </div>
            <h1
              className="text-[2rem] leading-tight"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: INK }}
            >
              Create your account
            </h1>
            <p className="mt-2 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: MUTED }}>
              Set up your profile to start hiring or get hired.
            </p>
          </div>

          {localErrors.form && (
            <div
              className="mb-5 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm"
              style={{ borderColor: '#F3C8BC', backgroundColor: FREELANCER.tint, color: '#9A3412', fontFamily: 'Inter, sans-serif' }}
            >
              <span className="mt-0.5">⚠</span>
              <span>{localErrors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <TextField
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              error={!!localErrors.name}
              helperText={localErrors.name}
              sx={fieldSx}
            />

            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              error={!!localErrors.email}
              helperText={localErrors.email}
              sx={fieldSx}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              error={!!localErrors.password}
              helperText={localErrors.password}
              sx={fieldSx}
            />

            <div>
              <span
                className="mb-2 block text-xs font-semibold uppercase tracking-wide"
                style={{ fontFamily: 'Inter, sans-serif', color: MUTED, letterSpacing: '0.06em' }}
              >
                I'm here to...
              </span>

              <div role="radiogroup" aria-label="Account type" className="grid grid-cols-2 gap-3">
                <label className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="client"
                    checked={role === 'client'}
                    onChange={() => setRole('client')}
                    className="peer sr-only"
                  />
                  <div
                    className="flex flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-4 text-center transition-all duration-200 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
                    style={{
                      borderColor: role === 'client' ? CLIENT.main : BORDER,
                      backgroundColor: role === 'client' ? CLIENT.tint : '#FFFFFF',
                    }}
                  >
                    <BriefcaseIcon color={role === 'client' ? CLIENT.main : MUTED} />
                    <span className="text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif', color: INK }}>
                      I'm hiring
                    </span>
                    <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: MUTED }}>
                      Client
                    </span>
                  </div>
                </label>

                <label className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="freelancer"
                    checked={role === 'freelancer'}
                    onChange={() => setRole('freelancer')}
                    className="peer sr-only"
                  />
                  <div
                    className="flex flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-4 text-center transition-all duration-200 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
                    style={{
                      borderColor: role === 'freelancer' ? FREELANCER.main : BORDER,
                      backgroundColor: role === 'freelancer' ? FREELANCER.tint : '#FFFFFF',
                    }}
                  >
                    <SparkIcon color={role === 'freelancer' ? FREELANCER.main : MUTED} />
                    <span className="text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif', color: INK }}>
                      I'm working
                    </span>
                    <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: MUTED }}>
                      Freelancer
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-1">
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                disableElevation
                sx={{
                  backgroundColor: accent.main,
                  '&:hover': { backgroundColor: accent.hover },
                  '&.Mui-disabled': { backgroundColor: accent.main, opacity: 0.7, color: '#FFFFFF' },
                  borderRadius: '12px',
                  paddingY: '11px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  transition: 'background-color 0.3s ease',
                }}
              >
                {isSubmitting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Create account'}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm" style={{ fontFamily: 'Inter, sans-serif', color: MUTED }}>
            Already have an account?{' '}
            <a
              href="/login"
              className="font-semibold transition-colors duration-200"
              style={{ color: INK }}
              onMouseEnter={(e) => (e.currentTarget.style.color = accent.main)}
              onMouseLeave={(e) => (e.currentTarget.style.color = INK)}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};