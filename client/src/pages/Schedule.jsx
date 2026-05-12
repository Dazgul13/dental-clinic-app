import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import AppointmentModal from '../components/AppointmentModal';

const Schedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('week'); // 'day' or 'week'
  const [weekDates, setWeekDates] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    generateWeekDates();
    fetchAppointments();
  }, [selectedDate, viewMode]);

  const generateWeekDates = () => {
    const startDate = new Date(selectedDate);
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    setWeekDates(dates);
  };

  const fetchAppointments = async () => {
    try {
      if (viewMode === 'week') {
        // Fetch appointments for the entire week
        const startDate = selectedDate;
        const endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 6);
        
        const { data } = await api.get(`/appointments?startDate=${startDate}&endDate=${endDate.toISOString().split('T')[0]}`);
        setAppointments(data);
      } else {
        // Fetch appointments for single day
        const { data } = await api.get(`/appointments?date=${selectedDate}`);
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAdded = () => {
    setShowModal(false);
    setLoading(true);
    fetchAppointments();
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (newStatus === 'reschedule') {
      const appointment = appointments.find(apt => apt._id === appointmentId);
      setRescheduleAppointment(appointment);
      setRescheduleDate(appointment.date.split('T')[0]);
      setRescheduleTime(appointment.date.split('T')[1].substring(0, 5));
      setShowRescheduleModal(true);
      return;
    }

    setUpdatingStatus(appointmentId);
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      
      // Update the appointment in the local state
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      );
      
      toast.success(`Appointment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('Please select both date and time');
      return;
    }

    setRescheduling(true);
    try {
      const newDateTime = new Date(`${rescheduleDate}T${rescheduleTime}`);
      
      await api.put(`/appointments/${rescheduleAppointment._id}`, { 
        date: newDateTime.toISOString(),
        status: 'scheduled'
      });
      
      // Update the appointment in the local state
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === rescheduleAppointment._id 
            ? { ...apt, date: newDateTime.toISOString(), status: 'scheduled' }
            : apt
        )
      );
      
      toast.success('Appointment rescheduled successfully');
      setShowRescheduleModal(false);
      setRescheduleAppointment(null);
      setRescheduleDate('');
      setRescheduleTime('');
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error('Failed to reschedule appointment');
    } finally {
      setRescheduling(false);
    }
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => 
      apt.date.split('T')[0] === date
    ).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (date) => {
    return date === new Date().toISOString().split('T')[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'reschedule':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="mt-2 text-sm text-gray-600">View and manage appointments</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'day'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'week'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Schedule Appointment
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {viewMode === 'week' ? 'Week Starting' : 'Select Date'}
          </label>
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="pt-6">
          <span className="text-sm text-gray-600">
            {viewMode === 'week' 
              ? `${formatShortDate(selectedDate)} - ${formatShortDate(weekDates[6] || selectedDate)}`
              : formatDate(selectedDate)
            }
          </span>
        </div>
      </div>

      {viewMode === 'week' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Weekly Schedule
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-1 bg-gray-200">
            {weekDates.map((date, index) => {
              const dayAppointments = getAppointmentsForDate(date);
              return (
                <div key={date} className="bg-white min-h-[200px]">
                  <div className={`p-3 text-center border-b ${
                    isToday(date) ? 'bg-primary-50 text-primary-700 font-semibold' : 'bg-gray-50'
                  }`}>
                    <div className="text-sm font-medium">
                      {formatShortDate(date)}
                    </div>
                    {isToday(date) && (
                      <div className="text-xs text-primary-600">Today</div>
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    {dayAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="text-xs p-2 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="font-medium text-gray-900 truncate">
                          {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                        </div>
                        <div className="text-gray-500">
                          {formatTime(appointment.date)}
                        </div>
                        <div className="mt-1">
                          <select
                            value={appointment.status}
                            onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                            disabled={updatingStatus === appointment._id}
                            className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(appointment.status)} ${
                              updatingStatus === appointment._id ? 'opacity-50' : 'cursor-pointer'
                            }`}
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="reschedule">Reschedule</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {dayAppointments.length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-4">
                        No appointments
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Appointments for {formatDate(selectedDate)}
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <p className="text-gray-500">Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <p className="text-gray-500">No appointments scheduled for this date.</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-lg">
                            {appointment.patientId?.firstName?.[0]}{appointment.patientId?.lastName?.[0]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-base font-medium text-gray-900">
                          {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTime(appointment.date)} • Dr. {appointment.dentistId?.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.patientId?.phone} • {appointment.patientId?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select
                        value={appointment.status}
                        onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                        disabled={updatingStatus === appointment._id}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(appointment.status)} ${
                          updatingStatus === appointment._id ? 'opacity-50' : 'cursor-pointer'
                        }`}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="reschedule">Reschedule</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <AppointmentModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAppointmentAdded}
        />
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && rescheduleAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Reschedule Appointment</h3>
              <button 
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {rescheduleAppointment.patientId?.firstName} {rescheduleAppointment.patientId?.lastName}
              </p>
              <p className="text-sm text-gray-500">
                Current: {formatDate(rescheduleAppointment.date)} at {formatTime(rescheduleAppointment.date)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={rescheduling}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {rescheduling ? 'Rescheduling...' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
