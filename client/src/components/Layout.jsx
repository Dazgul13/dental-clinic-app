import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

// Premium Layout with Persistent Sidebar Navigation
const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Premium navigation links - Clean Mint/Teal theme
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/dashboard/patients', label: 'Patients', icon: '👥' },
    { to: '/dashboard/schedule', label: 'Schedule', icon: '📅' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Navigation Sidebar - Royal Navy theme */}
      <nav className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand Section */}
          <div className="flex items-center h-16 px-6 border-b border-navy-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🦷</span>
              </div>
              <span className="text-xl font-semibold">Dental Clinic</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <span className="mr-3 text-lg">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* User Profile Card */}
          <div className="p-4 border-t border-navy-800">
            <div className="flex items-center space-x-3 px-4 py-3 bg-navy-800 rounded-lg">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Dr. {user?.username}</p>
                <p className="text-xs text-navy-300 truncate">{user?.role === 'admin' ? 'Administrator' : 'Dentist'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-navy-300 hover:text-white transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l-4-4m0 0l-4 4m4-4v12M22 12a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 right-4 z-40 md:hidden w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center"
      >
        {mobileMenuOpen ? (
          <span className="text-navy-900 text-xl">✕</span>
        ) : (
          <span className="text-navy-900 text-xl">☰</span>
        )}
      </button>

      {/* Main Content */}
      <main className="md:pl-64 min-h-screen">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
