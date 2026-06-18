import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navLinks = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/dashboard/patients',
    label: 'Patients',
    end: false,
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/dashboard/schedule',
    label: 'Schedule',
    end: false,
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/dashboard/pending-treatments',
    label: 'Pending Treatments',
    end: false,
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6M5 6h14M5 20h14" />
      </svg>
    ),
  },
  {
    to: '/dashboard/account-settings',
    label: 'Settings',
    end: false,
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const SIDEBAR_BG   = '#1C1917';
const BORDER_COLOR = 'rgba(255,255,255,0.08)';
const ACTIVE_BG    = '#2A9D8F';
const HOVER_BG     = 'rgba(255,255,255,0.06)';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials  = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Staff';

  // Page title from current route for the mobile top bar
  const pageTitle = navLinks.find(l =>
    l.end
      ? location.pathname === l.to
      : location.pathname.startsWith(l.to)
  )?.label ?? 'PearlDesk';

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ backgroundColor: '#FDF8F3' }}>

      {/* ── SIDEBAR (desktop always visible, mobile slide-in) ── */}
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-64
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        {/* Brand */}
        <div
          className="flex items-center h-16 px-5 flex-shrink-0"
          style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: ACTIVE_BG }}
          >
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 3C10.5 3 8 5.5 7 8C6.2 10 6 12.5 6.5 15C7 17 7.5 19.5 8 21.5C8.5 23.5 9.5 25 11 25C12.5 25 13 23 13.5 21C13.8 19.5 14 18 14 18C14 18 14.2 19.5 14.5 21C15 23 15.5 25 17 25C18.5 25 19.5 23.5 20 21.5C20.5 19.5 21 17 21.5 15C22 12.5 21.8 10 21 8C20 5.5 17.5 3 14 3Z" fill="white"/>
            </svg>
          </div>
          <span
            className="ml-3 text-white font-semibold text-base truncate"
            style={{ fontFamily: 'Lora, Georgia, serif' }}
          >
            PearlDesk
          </span>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden flex items-center justify-center w-8 h-8 rounded-md transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 group"
              style={({ isActive }) => ({
                backgroundColor: isActive ? ACTIVE_BG : undefined,
                color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.style.backgroundColor?.includes('2A9D8F')) {
                  e.currentTarget.style.backgroundColor = HOVER_BG;
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.style.backgroundColor?.includes('2A9D8F')) {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                }
              }}
            >
              {link.icon}
              <span className="font-medium text-sm">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: `1px solid ${BORDER_COLOR}` }}>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{ backgroundColor: HOVER_BG }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
              style={{ backgroundColor: ACTIVE_BG }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{roleLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              title="Sign out"
              aria-label="Sign out"
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar — only visible below lg */}
        <header
          className="lg:hidden flex items-center h-14 px-4 flex-shrink-0 border-b"
          style={{ backgroundColor: 'white', borderColor: '#E8DDD3' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-lg mr-3 flex-shrink-0"
            style={{ border: '1px solid #E8DDD3' }}
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: ACTIVE_BG }}
            >
              <svg width="12" height="12" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M14 3C10.5 3 8 5.5 7 8C6.2 10 6 12.5 6.5 15C7 17 7.5 19.5 8 21.5C8.5 23.5 9.5 25 11 25C12.5 25 13 23 13.5 21C13.8 19.5 14 18 14 18C14 18 14.2 19.5 14.5 21C15 23 15.5 25 17 25C18.5 25 19.5 23.5 20 21.5C20.5 19.5 21 17 21.5 15C22 12.5 21.8 10 21 8C20 5.5 17.5 3 14 3Z" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold text-sm truncate" style={{ color: '#1C1917' }}>
              {pageTitle}
            </span>
          </div>

          <div
            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
            style={{ backgroundColor: ACTIVE_BG }}
          >
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
