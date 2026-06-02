// Dashboard - Premium Wellness Aesthetic
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Here's what's happening today at your practice.
        </p>
      </div>

      {/* Executive Summary Cards - Premium styling */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Today's Appointments Card */}
        <div className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-teal-100 rounded-lg p-3">
                <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Appointments</dt>
                  <dd className="text-3xl font-semibold text-navy-900">{appointments.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Link - Patients */}
        <Link to="/dashboard/patients" className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">View Patients</dt>
                  <dd className="text-lg font-semibold text-gray-900">Manage Records</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        {/* Quick Link - Schedule */}
        <Link to="/dashboard/schedule" className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Schedule</dt>
                  <dd className="text-lg font-semibold text-gray-900">View Calendar</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
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
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
