// Login Page — PearlDesk design system
// Two-step flow: 1) verify clinic slug  2) enter credentials
// SECURITY: no public org listing — slug must be known

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../pages/Home';
import api from '../utils/api';

/* ── shared input class ── */
const inputCls =
  'w-full px-3 py-2.5 text-sm border rounded-lg transition-shadow ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-0 ' +
  'border-[#E8DDD3] focus:border-[#2A9D8F] focus:ring-[rgba(42,157,143,0.15)] ' +
  'placeholder-[#A89080] bg-white';

const Login = () => {
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [clinicSlug,   setClinicSlug]   = useState('');
  const [slugVerified, setSlugVerified] = useState(false);
  const [slugLoading,  setSlugLoading]  = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const isPending  = new URLSearchParams(window.location.search).get('pending') === 'true';

  // Step 1 — verify clinic slug
  const handleVerifySlug = async (e) => {
    e.preventDefault();
    if (!clinicSlug.trim()) return;
    setSlugLoading(true);
    setError('');
    try {
      const { data } = await api.post('/organization/verify-slug', { slug: clinicSlug });
      if (data.valid) {
        setSlugVerified(true);
        toast.success('Clinic found! Enter your credentials.');
      } else {
        setError('Clinic not found. Please check your slug and try again.');
      }
    } catch {
      setError('Unable to verify clinic. Please try again.');
    } finally {
      setSlugLoading(false);
    }
  };

  // Step 2 — sign in
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await login(username, password, clinicSlug);
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        setError(result.message);
        setPassword('');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSlug = () => {
    setSlugVerified(false);
    setClinicSlug('');
    setError('');
  };

  return (
    <>
      <Navbar />

      {/* Page background — warm cream */}
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ backgroundColor: '#FDF8F3' }}
      >
        {/* Pending approval banner */}
        {isPending && (
          <div
            className="w-full max-w-md mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2"
            style={{ background: 'rgba(42,157,143,0.10)', color: '#1B7A6E', border: '1px solid rgba(42,157,143,0.2)' }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your clinic registration is pending admin approval.
          </div>
        )}

        {/* Card */}
        <div
          className="w-full max-w-md bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E8DDD3' }}
        >
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 text-center" style={{ borderBottom: '1px solid #F5EFE8' }}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#2A9D8F' }}
            >
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M14 3C10.5 3 8 5.5 7 8C6.2 10 6 12.5 6.5 15C7 17 7.5 19.5 8 21.5C8.5 23.5 9.5 25 11 25C12.5 25 13 23 13.5 21C13.8 19.5 14 18 14 18C14 18 14.2 19.5 14.5 21C15 23 15.5 25 17 25C18.5 25 19.5 23.5 20 21.5C20.5 19.5 21 17 21.5 15C22 12.5 21.8 10 21 8C20 5.5 17.5 3 14 3Z" fill="white"/>
              </svg>
            </div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: 'Lora, Georgia, serif', color: '#1C1917' }}
            >
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: '#6B5C52' }}>
              Sign in to your PearlDesk account
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center px-8 py-4" style={{ borderBottom: '1px solid #F5EFE8' }}>
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  backgroundColor: slugVerified ? '#2A9D8F' : '#2A9D8F',
                  color: 'white',
                }}
              >
                {slugVerified ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : '1'}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: slugVerified ? '#2A9D8F' : '#1C1917' }}
              >
                Verify clinic
              </span>
            </div>

            {/* Connector */}
            <div className="flex-1 h-px mx-3" style={{ backgroundColor: slugVerified ? '#2A9D8F' : '#E8DDD3' }}></div>

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  backgroundColor: slugVerified ? '#2A9D8F' : '#F5EFE8',
                  color: slugVerified ? 'white' : '#A89080',
                  border: slugVerified ? 'none' : '1px solid #E8DDD3',
                }}
              >
                2
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: slugVerified ? '#1C1917' : '#A89080' }}
              >
                Sign in
              </span>
            </div>
          </div>

          {/* Form body */}
          <div className="px-8 py-6">
            {/* Error message */}
            {error && (
              <div
                className="mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}
              >
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Step 1: Clinic slug */}
            {!slugVerified ? (
              <form onSubmit={handleVerifySlug} className="space-y-4">
                <div>
                  <label htmlFor="clinicSlug" className="block text-sm font-medium mb-1.5" style={{ color: '#6B5C52' }}>
                    Clinic Slug
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="clinicSlug"
                      name="clinicSlug"
                      type="text"
                      required
                      value={clinicSlug}
                      onChange={(e) => setClinicSlug(e.target.value.toLowerCase().trim())}
                      className={inputCls + ' flex-1'}
                      placeholder="e.g., bright-smiles-clinic"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button
                      type="submit"
                      disabled={slugLoading || !clinicSlug.trim()}
                      className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg flex-shrink-0 transition-colors disabled:opacity-50"
                      style={{ backgroundColor: '#2A9D8F', minWidth: 80 }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1B7A6E'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2A9D8F'}
                    >
                      {slugLoading ? (
                        <svg className="animate-spin w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : 'Verify'}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs" style={{ color: '#A89080' }}>
                    Enter your clinic's unique identifier to continue
                  </p>
                </div>
              </form>
            ) : (
              /* Step 2: Credentials */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Verified clinic badge */}
                <div
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: 'rgba(42,157,143,0.08)', border: '1px solid rgba(42,157,143,0.2)' }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" style={{ color: '#2A9D8F' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium" style={{ color: '#1B7A6E' }}>{clinicSlug}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetSlug}
                    className="text-xs font-medium underline-offset-2 hover:underline"
                    style={{ color: '#6B5C52' }}
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-1.5" style={{ color: '#6B5C52' }}>
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputCls}
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#6B5C52' }}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#2A9D8F', marginTop: 8 }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#1B7A6E'; }}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2A9D8F'}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Signing in…
                    </>
                  ) : 'Sign In'}
                </button>
              </form>
            )}
          </div>

          {/* Card footer */}
          <div
            className="px-8 py-4 text-center text-sm"
            style={{ background: '#F5EFE8', borderTop: '1px solid #E8DDD3', color: '#6B5C52' }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold hover:underline underline-offset-2"
              style={{ color: '#2A9D8F' }}
            >
              Register your clinic
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs" style={{ color: '#A89080' }}>
          © 2025 PearlDesk · Your practice, perfectly managed.
        </p>
      </div>
    </>
  );
};

export default Login;
