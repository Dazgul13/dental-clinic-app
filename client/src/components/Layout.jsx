import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <nav className={`fixed inset-y-0 left-0 z-50 bg-navy-900 text-white transform transition-all duration-300 ease-in-out
        w-16 lg:w-64
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center h-16 px-4 border-b border-navy-800">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">🦷</span>
            </div>
            <span className="ml-3 text-xl font-semibold whitespace-nowrap hidden lg:block">Dental Clinic</span>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-2 py-4 lg:px-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center px-2 lg:px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-lg flex-shrink-0">{link.icon}</span>
                <span className="ml-3 font-medium whitespace-nowrap hidden lg:block">{link.label}</span>
                {/* Tooltip for collapsed state */}
                <span className="lg:hidden absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {link.label}
                </span>
              </NavLink>
            ))}
          </div>

          {/* User Profile Card */}
          <div className="p-2 lg:p-4 border-t border-navy-800">
            <div className="flex items-center space-x-2 lg:space-x-3 px-2 lg:px-4 py-2 lg:py-3 bg-navy-800 rounded-lg">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-xs lg:text-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0 hidden lg:block">
                <p className="text-sm font-medium text-white truncate">Dr. {user?.username}</p>
                <p className="text-xs text-navy-300 truncate">{user?.role === 'admin' ? 'Administrator' : 'Dentist'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-navy-300 hover:text-white transition-colors p-1 hidden lg:block"
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

      {/* Mobile Menu Button - Left side */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-40 md:hidden w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center"
      >
        {mobileMenuOpen ? (
          <span className="text-navy-900 text-xl">✕</span>
        ) : (
          <span className="text-navy-900 text-xl">☰</span>
        )}
      </button>

      {/* Main Content */}
      <main className="md:pl-16 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-6 xl:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
