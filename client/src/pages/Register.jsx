// Register Page — PearlDesk design system
// Creates a new clinic (organization) + admin account
// Requires SysAdmin approval before login is allowed

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Home';

/* ── shared input class ── */
const inputCls =
  'w-full px-3 py-2.5 text-sm border rounded-lg transition-shadow ' +
  'focus:outline-none focus:ring-2 focus:ring-offset-0 ' +
  'border-[#E8DDD3] focus:border-[#2A9D8F] focus:ring-[rgba(42,157,143,0.15)] ' +
  'placeholder-[#A89080] bg-white';

/* ── section heading ── */
const SectionHeading = ({ icon, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-4">
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ backgroundColor: 'rgba(42,157,143,0.10)' }}
    >
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-semibold" style={{ color: '#1C1917' }}>{title}</h3>
      <p className="text-xs mt-0.5" style={{ color: '#A89080' }}>{subtitle}</p>
    </div>
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    username:          '',
    email:             '',
    password:          '',
    confirmPassword:   '',
    organizationName:  '',
    organizationEmail: '',
    organizationPhone: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const navigate   = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!formData.organizationName.trim() || !formData.organizationEmail.trim() || !formData.organizationPhone.trim()) {
      setError('Please fill in all clinic details.');
      return;
    }

    setLoading(true);
    const result = await register({
      username:          formData.username,
      email:             formData.email,
      password:          formData.password,
      organizationName:  formData.organizationName,
      organizationEmail: formData.organizationEmail,
      organizationPhone: formData.organizationPhone,
    });

    if (result.success) {
      toast.success('Clinic registered! Awaiting system administrator approval.');
      navigate('/login?pending=true');
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />

      {/* Page background — warm cream */}
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ backgroundColor: '#FDF8F3' }}
      >
        {/* Card */}
        <div
          className="w-full max-w-lg bg-white rounded-2xl overflow-hidden"
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
              Register your clinic
            </h1>
            <p className="text-sm" style={{ color: '#6B5C52' }}>
              Create a PearlDesk account for your practice
            </p>
          </div>

          {/* Approval notice */}
          <div
            className="mx-8 mt-6 px-4 py-3 rounded-lg text-xs flex items-start gap-2"
            style={{ background: 'rgba(42,157,143,0.08)', color: '#1B7A6E', border: '1px solid rgba(42,157,143,0.2)' }}
          >
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            New clinic registrations require system administrator approval before you can sign in.
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            {/* Error message */}
            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}
              >
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* ── SECTION 1: Clinic details ── */}
            <div>
              <SectionHeading
                icon={
                  <svg className="w-5 h-5" style={{ color: '#2A9D8F' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                title="Clinic Details"
                subtitle="Information about your dental practice"
              />
              <div className="space-y-3">
                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium mb-1.5" style={{ color: '#6B5C52' }}>
                    Clinic Name <span style={{ color: '#E76F51' }}>*</span>
                  </label>
                  <input
                    id="organizationName" name="organizationName" type="text" required
                    placeholder="e.g., Bright Smile Dental"
                    value={formData.organizationName} onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                {/* Mobile: stack; sm+: side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="organizationEmail" className="block text-sm font-medium mb-1.5" style={{ color: '#6B5C52' }}>
                      Clinic Email <span style={{ color: '#E76F51' }}>*</span>
                    </label>
                    <input
                      id="organizationEmail" name="organizationEmail" type="email" required
                      placeholder="clinic@example.com"
                      value={formData.organizationEmail} onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="organizationPhone" className="block text-sm font-medium mb-1.5" style={{ color: '#6B5C52' }}>
                      Clinic Phone <span style={{ color: '#E76F51' }}>*</span>
                    </label>
                    <input
                      id="organizationPhone" name="organizationPhone" type="tel" required
                      placeholder="+63 912 345 6789"
                      value={formData.organizationPhone} onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #F5EFE8' }}></div>

            {/* ── SECTION 2: Admin account ── */}
            <div>
              <SectionHeading
                icon={
                  <svg className="w-5 h-5" style={{ color: '#2A9D8F' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                title="Admin Account"
                subtitle="Credentials for the clinic administrator"
              />
              <div className="space-y-3">
                {/* Username + email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1.5" style={{ color: '#6B5C52' }}>
                      Username <span style={{ color: '#E76F51' }}>*</span>
                    </label>
                    <input
                      id="username" name="username" type="text" required
                      placeholder="admin"
                      value={formData.username} onChange={handleChange}
                      className={inputCls}
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#6B5C52' }}>
                      Your Email <span style={{ color: '#E76F51' }}>*</span>
                    </label>
                    <input
                      id="email" name="email" type="email" required
                      placeholder="you@example.com"
                      value={formData.email} onChange={handleChange}
                      className={inputCls}
                      autoComplete="email"
                    />
                  </div>
                </div>
                {/* Password + confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#6B5C52' }}>
                      Password <span style={{ color: '#E76F51' }}>*</span>
                    </label>
                    <input
                      id="password" name="password" type="password" required
                      placeholder="Min. 8 characters"
                      value={formData.password} onChange={handleChange}
                      className={inputCls}
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: '#6B5C52' }}>
                      Confirm Password <span style={{ color: '#E76F51' }}>*</span>
                    </label>
                    <input
                      id="confirmPassword" name="confirmPassword" type="password" required
                      placeholder="Repeat password"
                      value={formData.confirmPassword} onChange={handleChange}
                      className={inputCls}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <p className="text-xs" style={{ color: '#A89080' }}>
                  Must be at least 8 characters with uppercase, lowercase, and a number.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: '#2A9D8F' }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#1B7A6E'; }}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2A9D8F'}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating clinic…
                </>
              ) : 'Create Clinic Account'}
            </button>
          </form>

          {/* Card footer */}
          <div
            className="px-8 py-4 text-center text-sm"
            style={{ background: '#F5EFE8', borderTop: '1px solid #E8DDD3', color: '#6B5C52' }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold hover:underline underline-offset-2"
              style={{ color: '#2A9D8F' }}
            >
              Sign in
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

export default Register;
