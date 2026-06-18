// Dashboard - Premium Wellness Aesthetic
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import StatCard from '../components/ui/StatCard'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalPatients, setTotalPatients] = useState(null);
  const [pendingPlans, setPendingPlans] = useState(null);

  useEffect(() => {
    if (user?.branches && user.branches.length) {
      setBranches(user.branches);
      setCurrentBranch(user.branches[0].id || user.branches[0]);
    }

    (async () => {
      try {
        const [{ data: notifData }, { data: statsData }] = await Promise.all([
          api.get('/notifications/unread-count').catch(() => ({ data: { count: 0 } })),
          api.get('/stats').catch(() => ({ data: null }))
        ]);

        if (notifData && typeof notifData.count === 'number') setUnreadCount(notifData.count);
        if (statsData) {
          setTotalPatients(statsData.totalPatients ?? null);
          setPendingPlans(statsData.pendingPlans ?? null);
          // keep appointments length from existing appointments fetch
          setAppointments(prev => prev);
          // if todaysAppointments present, set loading false if not already
        }
      } catch (err) {
        // ignore
      }
    })();
  }, [user]);

  // Persist selected branch so `api` can read it for headers
  useEffect(() => {
    if (currentBranch) {
      localStorage.setItem('currentBranch', currentBranch);
    }
  }, [currentBranch]);

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await api.get(`/appointments?date=${today}`);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="px-4 sm:px-0">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Welcome back! Here's what's happening today at your practice.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-3 py-2 border rounded-lg bg-white"
            aria-label="Branch switcher"
            value={currentBranch ?? ''}
            onChange={(e) => setCurrentBranch(e.target.value)}
          >
            {(branches.length ? branches : [{ name: 'Default Clinic', id: 'default' }]).map((b) => (
              <option key={b.id || b} value={b.id || b}>{b.name || b}</option>
            ))}
          </select>
          
          {/* store branch selection to localStorage for api header */}
          

          <div style={{ position: 'relative' }}>
            <button className="relative" aria-label="Notifications">
              <i className="bi bi-bell" style={{ fontSize: 20 }} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6 }}>
                  <span className="px-1.5 py-0.5 rounded-full bg-danger text-white text-xs">{unreadCount}</span>
                </span>
              )}
            </button>
          </div>

          <div>
            <Button variant="ghost" onClick={() => {}}>Profile</Button>
          </div>
        </div>
      </div>

      {/* Persist selected branch for API header usage */}

      {/* Executive Summary Cards - moved to StatCard */}
      <div className="bg-white shadow-sm rounded-xl mb-8">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <>
                <StatCard to="/dashboard/schedule" icon="bi-calendar-check" label="Today's Appointments" value={appointments.length} sub="vs yesterday" />
                <StatCard to="/dashboard/patients" icon="bi-people" label="Total Patients" value={totalPatients ?? '—'} sub={totalPatients === null ? 'loading' : ''} />
                <StatCard to="/dashboard/pending-treatments" icon="bi-wallet2" label="Pending Treatment Plans" value={pendingPlans ?? '—'} sub={pendingPlans === null ? '—' : ''} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Today's Appointments - Clean list view */}
      <div className="bg-white shadow-sm rounded-xl">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-navy-900">
            Upcoming Appointments Today
          </h3>
        </div>
        <div className="px-6 py-5">
          {loading ? (
            <p className="text-gray-500">Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-500">No appointments scheduled for today.</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-teal-600 font-medium">
                        {appointment.patientId?.firstName?.[0]}{appointment.patientId?.lastName?.[0]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatTime(appointment.date)} • Dr. {appointment.dentistId?.username}
                    </p>
                  </div>
                </div>
                <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'scheduled' ? 'bg-teal-100 text-teal-800' :
                  appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
