/**
 * Login Page Component
 * 
 * TECHNOLOGY: React with controlled form inputs and Context API
 * WHY: Authentication form manages email/password state and submits to auth API
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Routes to AuthContext.login for credential validation
 * - Redirects authenticated users to dashboard
 * - Displays server errors to guide user
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

// Shared visual tokens (copied from RegisterPage for consistency)
const INK = '#12141C';
const PAPER = '#FBF9F5';
const BORDER = '#E5E1D8';
const MUTED = '#6B7280';
const CLIENT = { main: '#3658FF', hover: '#2A45CC', tint: '#EEF1FF' };
const FREELANCER = { main: '#FF6B47', hover: '#E8553A', tint: '#FFF1ED' };

const Constellation = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <g stroke="#FFFFFF" strokeOpacity="0.06" strokeWidth="0.12">
      <line x1="8" y1="14" x2="24" y2="28" />
      <line x1="24" y1="28" x2="18" y2="46" />
      <line x1="92" y1="10" x2="76" y2="24" />
      <line x1="76" y1="24" x2="84" y2="42" />
      <line x1="10" y1="88" x2="26" y2="74" />
      <line x1="90" y1="92" x2="74" y2="78" />
      <line x1="50" y1="6" x2="50" y2="18" />
    </g>
  </svg>
);

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localErrors, setLocalErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email";
    if (!password) errors.password = "Password is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setLocalErrors(errors);
    if (Object.keys(errors).length) return;

    setIsSubmitting(true);
    const result = await login(email.toLowerCase().trim(), password);
    setIsSubmitting(false);
    if (result.success) navigate('/dashboard');
    else setLocalErrors({ form: result.error || 'Login failed' });
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: PAPER,
      fontFamily: 'Inter, sans-serif',
      '& fieldset': { borderColor: BORDER },
      '&:hover fieldset': { borderColor: CLIENT.main },
      '&.Mui-focused fieldset': { borderColor: CLIENT.main, borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': { fontFamily: 'Inter, sans-serif', color: MUTED },
    '& .MuiInputLabel-root.Mui-focused': { color: CLIENT.main },
    '& .MuiFormHelperText-root': { fontFamily: 'Inter, sans-serif', marginLeft: 0 },
    '& input': { color: INK },
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10" style={{ backgroundColor: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
        @media (prefers-reduced-motion: reduce) { .nexora-pulse, [class*="animate-"] { animation: none !important; } }
      `}</style>

      <Constellation />

      <div className="relative w-full max-w-md">
        <div className="pointer-events-none absolute -inset-2 rounded-[32px] blur-2xl opacity-20" style={{ backgroundColor: CLIENT.main }} aria-hidden="true" />

        <div className="relative rounded-[24px] p-8 shadow-2xl shadow-black/40" style={{ backgroundColor: PAPER }}>
          <div className="mb-7 h-1 w-12 rounded-full" style={{ backgroundColor: CLIENT.main }} />

          <div className="mb-7">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-semibold" style={{ backgroundColor: INK, color: PAPER, fontFamily: "'Fraunces', serif" }}>
              N
            </div>
            <h1 className="text-[2rem] leading-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: INK }}>
              Welcome back
            </h1>
            <p className="mt-2 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: MUTED }}>
              Sign in to continue to Nexora
            </p>
          </div>

          {localErrors.form && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: '#F3C8BC', backgroundColor: FREELANCER.tint, color: '#9A3412', fontFamily: 'Inter, sans-serif' }}>
              <span className="mt-0.5">⚠</span>
              <span>{localErrors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

            <div className="pt-1">
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                disableElevation
                sx={{
                  backgroundColor: CLIENT.main,
                  '&:hover': { backgroundColor: CLIENT.hover },
                  '&.Mui-disabled': { backgroundColor: CLIENT.main, opacity: 0.7, color: '#FFFFFF' },
                  borderRadius: '12px',
                  paddingY: '11px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                }}
              >
                {isSubmitting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Sign in'}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm" style={{ fontFamily: 'Inter, sans-serif', color: MUTED }}>
            Don't have an account?{' '}
            <a href="/register" className="font-semibold transition-colors duration-200" style={{ color: INK }}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
