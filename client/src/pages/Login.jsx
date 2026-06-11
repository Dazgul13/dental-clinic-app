// Login Page Component
// Handles user authentication with secure slug-based clinic lookup
// ANTI-SPAM: No public organization listing - users must know their clinic slug

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../pages/Home';
import api from '../utils/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // SECURITY: Removed public organizations dropdown - prevents enumeration attacks
  // Users now enter their clinic slug to verify existence
  const [clinicSlug, setClinicSlug] = useState('');
  const [slugVerified, setSlugVerified] = useState(false);
  const [slugLoading, setSlugLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // SECURITY: Verify clinic slug via POST endpoint to prevent caching/enumeration
  // Rate-limited on backend to prevent automated scraping
  const handleVerifySlug = async (e) => {
    e.preventDefault();
    if (!clinicSlug.trim()) return;

    setSlugLoading(true);
    setError('');

    try {
      const { data } = await api.post('/organization/verify-slug', { slug: clinicSlug });

      if (data.valid) {
        setSlugVerified(true);
        toast.success('Clinic found! Please enter your credentials.');
      } else {
        setError('Clinic not found. Please check your slug and try again.');
        toast.error('Clinic not found');
      }
    } catch (err) {
      setError('Unable to verify clinic. Please try again.');
      toast.error('Verification failed');
    } finally {
      setSlugLoading(false);
    }
  };

  // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    if (!slugVerified || !clinicSlug.trim()) {
      setError('Please verify your clinic first');
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password, clinicSlug);

      if (result.success) {
        toast.success('Login successful! Welcome back.');
        navigate('/dashboard');
      } else {
        setError(result.message);
        toast.error(result.message);
        setPassword('');
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  // Reset slug verification to allow user to change clinic
  const handleResetSlug = () => {
    setSlugVerified(false);
    setClinicSlug('');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Dental Clinic Management</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to your account
              {new URLSearchParams(window.location.search).get('pending') === 'true' && (
                <span className="block mt-1 text-blue-600">Your clinic is pending admin approval</span>
              )}
            </p>
          </div>

          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
            )}

            <form onSubmit={slugVerified ? handleSubmit : handleVerifySlug} className="space-y-6">
              {/* Step 1: Clinic Slug Verification */}
              {!slugVerified ? (
                <div>
                  <label htmlFor="clinicSlug" className="block text-sm font-medium text-gray-700 mb-1">
                    Clinic Slug
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="clinicSlug"
                      name="clinicSlug"
                      type="text"
                      required
                      value={clinicSlug}
                      onChange={(e) => setClinicSlug(e.target.value.toLowerCase().trim())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., bright-smiles-clinic"
                    />
                    <button
                      type="submit"
                      disabled={slugLoading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                    >
                      {slugLoading ? 'Checking...' : 'Verify'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your clinic's unique slug to begin login
                  </p>
                </div>
              ) : (
                /* Step 2: Credentials after slug verification */
                <>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your password"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Clinic: <strong>{clinicSlug}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleResetSlug}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      Change Clinic
                    </button>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </div>
                </>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Need to register your clinic?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Contact administrator
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;