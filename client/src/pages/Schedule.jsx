// Schedule Page Component
// Displays appointments in day, week, or month view with premium calendar styling

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import AppointmentModal from '../components/AppointmentModal';

const Schedule = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]); // All fetched appointments
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Currently selected date (YYYY-MM-DD format)
  const [showModal, setShowModal] = useState(false); // Controls appointment creation modal
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', or 'month' view
  const [weekDates, setWeekDates] = useState([]); // Array of 7 dates for week view
  const [monthDates, setMonthDates] = useState([]); // Array of dates for month view
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which appointment is being updated
  
  // Reschedule modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Initialize date arrays and fetch appointments when date or view mode changes
  useEffect(() => {
    if (viewMode === 'week') {
      generateWeekDates();
    } else if (viewMode === 'month') {
      generateMonthDates();
    }
    fetchAppointments();
  }, [selectedDate, viewMode]);

  // Generate array of 7 consecutive dates starting from selected date (for week view)
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

  // Generate array of all dates in the selected month (for month view)
  const generateMonthDates = () => {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    
    // Number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Generate array of dates for the month
    const dates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      dates.push(currentDate.toISOString().split('T')[0]);
    }
    
    setMonthDates(dates);
  };

  // Fetch appointments based on current view mode (day/week/month)
  // Uses query parameters startDate/endDate for week and month views
  // Uses date parameter for single day view
  const fetchAppointments = async () => {
    try {
      if (viewMode === 'week') {
        // Week view: fetch 7 days starting from selected date
        const startDate = selectedDate;
        const endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 6);
        
        const { data } = await api.get(`/appointments?startDate=${startDate}&endDate=${endDate.toISOString().split('T')[0]}`);
        setAppointments(data);
      } else if (viewMode === 'month') {
        // Month view: fetch all appointments within the selected month
        // Get first day of month (day 1)
        const startDate = new Date(selectedDate);
        startDate.setDate(1);
        // Get last day of month (day 0 of next month)
        const endDate = new Date(selectedDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of the month
        
        const { data } = await api.get(`/appointments?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`);
        setAppointments(data);
      } else {
        // Day view: fetch appointments for single selected date
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

  // Callback when a new appointment is added via modal
  const handleAppointmentAdded = () => {
    setShowModal(false);
    setLoading(true);
    fetchAppointments();
  };

  // Update appointment status
  // If reschedule is selected, open the reschedule modal with pre-filled date/time
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (newStatus === 'reschedule') {
      // Find the appointment to reschedule
      const appointment = appointments.find(apt => apt._id === appointmentId);
      if (!appointment) {
        toast.error('Appointment not found');
        return;
      }
      setRescheduleAppointment(appointment);
      
      // Safely parse ISO date string to extract date and time
      // appointment.date is in ISO format: "2026-06-04T10:30:00.000Z"
      // Handle potential undefined/null values gracefully
      const dateStr = appointment.date || '';
      const parts = typeof dateStr === 'string' ? dateStr.split('T') : [''];
      
      // Extract date (first part before T) - validates the split was successful
      const datePart = parts[0] || '';
      setRescheduleDate(datePart);
      
      // Extract time (second part after T) - format as HH:MM using regex
      // Handles formats: "10:30:00.000Z", "10:30:00+00:00", or already formatted time
      let timePart = '';
      if (parts[1]) {
        const timeMatch = parts[1].match(/^(\d{2}:\d{2})/);
        timePart = timeMatch ? timeMatch[1] : '';
      }
      setRescheduleTime(timePart);
      setShowRescheduleModal(true);
      return;
    }

    setUpdatingStatus(appointmentId);
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      
      setAppointments(prev => 
        prev.map(apt => apt._id === appointmentId ? { ...apt, status: newStatus } : apt)
      );
      
      toast.success(`Appointment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle rescheduling - saves new date/time to the appointment
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
      
      setAppointments(prev => prev.map(apt => apt._id === rescheduleAppointment._id ? { ...apt, date: newDateTime.toISOString(), status: 'scheduled' } : apt));
      
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

  // Get appointments for a specific date (helper for week/month views)
  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    return appointments.filter(apt => apt.date?.split('T')[0] === date).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Premium formatters
  // Format time from ISO date string - handles null/undefined gracefully
  const formatTime = (date) => {
    if (!date) return 'N/A';
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return 'Invalid Date';
    return parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatShortDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isToday = (date) => {
    if (!date) return false;
    return date === new Date().toISOString().split('T')[0];
  };

  // Premium status colors for appointment status badges
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-teal-100 text-teal-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'reschedule': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format month and year for display (e.g., "June 2026")
  const formatMonthYear = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="px-4 sm:px-0">
      {/* Premium Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Schedule</h1>
          <p className="mt-2 text-sm text-gray-600">View and manage appointments with premium calendar workflow</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg shadow-sm space-x-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                viewMode === 'day' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } transition`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium border-t border-r border-b ${
                viewMode === 'week' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } transition`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${
                viewMode === 'month' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } transition`}
            >
              Month
            </button>
          </div>
          {/* Schedule Button */}
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Schedule Appointment
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="mb-6 flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {viewMode === 'week' ? 'Week Starting' : viewMode === 'month' ? 'Month' : 'Select Date'}
          </label>
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm transition"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="pt-6">
          <span className="text-sm text-navy-600 font-medium">
            {viewMode === 'month' ? formatMonthYear(selectedDate) : viewMode === 'week' ? `${formatShortDate(selectedDate)} - ${formatShortDate(weekDates[6] || selectedDate)}` : formatDate(selectedDate)}
          </span>
        </div>
      </div>

      {/* Week View - Premium calendar grid */}
      {viewMode === 'week' && (
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-navy-900">Weekly Schedule</h3>
          </div>
          <div className="grid grid-cols-7 gap-0 bg-gray-100">
            {weekDates.map((date) => {
              const dayAppointments = getAppointmentsForDate(date);
              return (
                <div key={date} className="bg-white min-h-[200px] border-r border-gray-100 last:border-r-0">
                  <div className={`p-3 text-center border-b ${
                    isToday(date) ? 'bg-teal-50 text-teal-700 font-semibold' : 'bg-gray-50'
                  }`}>
                    <div className="text-sm font-medium">{formatShortDate(date)}</div>
                    {isToday(date) && <div className="text-xs text-teal-600">Today</div>}
                  </div>
                  <div className="p-2 space-y-1">
                    {dayAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        onClick={() => {
                          if (appointment.patientId?._id) {
                            navigate(`/dashboard/patients/${appointment.patientId._id}?tab=treatment`);
                          }
                        }}
                        className="text-xs p-2 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="font-medium text-navy-900 truncate">{appointment.patientId?.firstName} {appointment.patientId?.lastName}</div>
                        <div className="text-gray-500">{formatTime(appointment.date)}</div>
                        <div className="mt-1">
                          <select
                            value={appointment.status}
                            onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                            disabled={updatingStatus === appointment._id}
                            className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(appointment.status)} ${updatingStatus === appointment._id ? 'opacity-50' : ''} cursor-pointer`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="reschedule">Reschedule</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {dayAppointments.length === 0 && <div className="text-xs text-gray-400 text-center py-4">No appointments</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month View - Premium calendar grid */}
      {viewMode === 'month' && (
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-navy-900">Monthly Schedule</h3>
          </div>
          <div className="grid grid-cols-7 gap-0 bg-gray-50">
            {/* Weekday headers */}
            <div className="text-center font-semibold text-gray-700 px-3 py-2">Sun</div>
            <div className="text-center font-semibold text-gray-700 px-3 py-2">Mon</div>
            <div className="text-center font-semibold text-gray-700 px-3 py-2">Tue</div>
            <div className="text-center font-semibold text-gray-700 px-3 py-2">Wed</div>
            <div className="text-center font-semibold text-gray-700 px-3 py-2">Thu</div>
            <div className="text-center font-semibold text-gray-700 px-3 py-2">Fri</div>
            <div className="text-center font-semibold text-gray-700 px-3 py-2">Sat</div>
            {/* Calendar days */}
            {monthDates.map((date) => {
              const dayAppointments = getAppointmentsForDate(date);
              const dayNumber = new Date(date).getDate();
              const isTodayDate = isToday(date);
              
              return (
                <div key={date} className="border-r border-b border-gray-200 last:border-r-0 min-h-[120px] relative">
                  <div className="p-2">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs font-medium">{dayNumber}</div>
                      {isTodayDate && <div className="text-xs bg-teal-100 text-teal-800 rounded-full px-1 py-0.5">Today</div>}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((appointment) => (
                        <div key={`${appointment._id}-0`} className="px-2 py-1 bg-teal-50 text-teal-800 text-xs rounded">
                          {appointment.patientId?.firstName?.[0]}{appointment.patientId?.lastName?.[0]} {formatTime(appointment.date)}
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="px-2 py-1 bg-teal-200 text-teal-600 text-xs rounded">
                          +{dayAppointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                  {dayAppointments.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                      No appointments
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View - Premium card layout */}
      {viewMode === 'day' && (
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-navy-900">Appointments for {formatDate(selectedDate)}</h3>
          </div>
          <div className="px-6 py-5">
            {loading ? (
              <p className="text-gray-500">Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <p className="text-gray-500">No appointments scheduled for this date.</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    onClick={() => {
                      if (appointment.patientId?._id) {
                        navigate(`/dashboard/patients/${appointment.patientId._id}?tab=treatment`);
                      }
                    }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                          <span className="text-teal-600 font-medium text-lg">{appointment.patientId?.firstName?.[0]}{appointment.patientId?.lastName?.[0]}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-base font-medium text-navy-900">{appointment.patientId?.firstName} {appointment.patientId?.lastName}</p>
                        <p className="text-sm text-gray-600">{formatTime(appointment.date)} • Dr. {appointment.dentistId?.username}</p>
                        <p className="text-sm text-gray-500">{appointment.patientId?.phone} • {appointment.patientId?.email}</p>
                      </div>
                    </div>
                    <select
                      value={appointment.status}
                      onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                      disabled={updatingStatus === appointment._id}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(appointment.status)} ${updatingStatus === appointment._id ? 'opacity-50' : ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="reschedule">Reschedule</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showModal && (
        <AppointmentModal onClose={() => setShowModal(false)} onSuccess={handleAppointmentAdded} />
      )}

      {/* Reschedule Modal - Premium styling */}
      {showRescheduleModal && rescheduleAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-xl rounded-xl bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-navy-900">Reschedule Appointment</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4 p-3 bg-teal-50 rounded-lg">
              <p className="text-sm font-medium text-navy-900">{rescheduleAppointment.patientId?.firstName} {rescheduleAppointment.patientId?.lastName}</p>
              <p className="text-sm text-gray-600">Current: {formatDate(rescheduleAppointment.date)} at {formatTime(rescheduleAppointment.date)}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowRescheduleModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleReschedule} disabled={rescheduling} className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition">{rescheduling ? 'Rescheduling...' : 'Reschedule'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
