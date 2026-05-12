import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' ? 'bg-primary-700' : '';
    }
    return location.pathname.startsWith(path) ? 'bg-primary-700' : '';
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Dental Clinic</h1>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link
                  to="/dashboard"
                  className={`${isActive('/dashboard')} px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/dashboard/patients"
                  className={`${isActive('/dashboard/patients')} px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition`}
                >
                  Patients
                </Link>

                <Link
                  to="/dashboard/schedule"
                  className={`${isActive('/dashboard/schedule')} px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition`}
                >
                  Schedule
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              <span className="mr-4 text-sm">
                Welcome, {user?.username}
              </span>

              <button
                onClick={handleLogout}
                className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
