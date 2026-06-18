import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetails from './pages/PatientDetails';
import Schedule from './pages/Schedule';
import PendingTreatments from './pages/PendingTreatments';
import ChangePassword from './pages/ChangePassword';
import AccountSettings from './pages/AccountSettings';
import SysAdminLogin from './pages/SysAdminLogin';
import SysAdminDashboard from './pages/SysAdminDashboard';
import Layout from './components/Layout';
import ComponentLibrary from './pages/ComponentLibrary';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        {/* 🔒 Protected App */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/:id" element={<PatientDetails />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="pending-treatments" element={<PendingTreatments />} />
          <Route path="account-settings" element={<AccountSettings />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* ❌ Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />

        {/* System Admin Routes */}
        <Route path="/sys-admin/login" element={<SysAdminLogin />} />
        <Route path="/sys-admin/organizations" element={<SysAdminDashboard />} />
        {import.meta.env.MODE !== 'production' && (
          <Route path="/dev/components" element={<ComponentLibrary />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
