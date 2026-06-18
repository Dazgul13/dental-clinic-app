import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DentalChart from '../components/DentalChart';
import PediatricDentalChart from '../components/PediatricDentalChart';
import TreatmentPlanList from '../components/TreatmentPlanList';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const tabFromUrl = searchParams.get('tab');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [updatingNote, setUpdatingNote] = useState(false);
  const [deletingNote, setDeletingNote] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    const allowed = ['info', 'dental', 'treatment', 'notes'];
    return allowed.includes(tabFromUrl) ? tabFromUrl : 'info';
  });
  
  // Pagination for notes
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 5;

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const { data } = await api.get(`/patients/${id}`);
      setPatient(data);
      setEditForm({
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob.split('T')[0], // Format for date input
        phone: data.phone,
        email: data.email,
        allergies: data.medicalHistory?.allergies?.join(', ') || '',
        conditions: data.medicalHistory?.conditions?.join(', ') || ''
      });
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Failed to load patient details');
      if (error.response?.status === 404) {
        navigate('/dashboard/patients');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setAddingNote(true);
    try {
      const { data } = await api.post(`/patients/${id}/notes`, { text: noteText });
      setPatient(data);
      setNoteText('');
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Client-side validation
      if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
        toast.error('First name and last name are required');
        setSaving(false);
        return;
      }

      if (!editForm.email.includes('@')) {
        toast.error('Please enter a valid email address');
        setSaving(false);
        return;
      }

      const phoneDigits = editForm.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        toast.error('Please enter a valid phone number');
        setSaving(false);
        return;
      }

      const updatedData = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        dob: editForm.dob,
        phone: editForm.phone.trim(),
        email: editForm.email.trim().toLowerCase(),
        medicalHistory: {
          allergies: editForm.allergies.split(',').map(a => a.trim()).filter(Boolean),
          conditions: editForm.conditions.split(',').map(c => c.trim()).filter(Boolean)
        }
      };

      const { data } = await api.put(`/patients/${id}`, updatedData);
      setPatient(data);
      setIsEditing(false);
      toast.success('Patient information updated successfully');
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error(error.response?.data?.message || 'Failed to update patient');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Check if there are unsaved changes
    const hasChanges = 
      editForm.firstName !== patient.firstName ||
      editForm.lastName !== patient.lastName ||
      editForm.dob !== patient.dob.split('T')[0] ||
      editForm.phone !== patient.phone ||
      editForm.email !== patient.email ||
      editForm.allergies !== (patient.medicalHistory?.allergies?.join(', ') || '') ||
      editForm.conditions !== (patient.medicalHistory?.conditions?.join(', ') || '');

    if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }

    setEditForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dob: patient.dob.split('T')[0],
      phone: patient.phone,
      email: patient.email,
      allergies: patient.medicalHistory?.allergies?.join(', ') || '',
      conditions: patient.medicalHistory?.conditions?.join(', ') || ''
    });
    setIsEditing(false);
  };

  const handleDeletePatient = async () => {
    setDeleting(true);
    try {
      await api.delete(`/patients/${id}`);
      toast.success('Patient deleted successfully');
      navigate('/dashboard/patients');
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error(error.response?.data?.message || 'Failed to delete patient');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note._id);
    setEditNoteText(note.note);
  };

  const handleUpdateNote = async (noteId) => {
    if (!editNoteText.trim()) {
      toast.error('Note text cannot be empty');
      return;
    }

    setUpdatingNote(true);
    try {
      const { data } = await api.put(`/patients/${id}/notes/${noteId}`, { text: editNoteText });
      setPatient(data);
      setEditingNote(null);
      setEditNoteText('');
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error(error.response?.data?.message || 'Failed to update note');
    } finally {
      setUpdatingNote(false);
    }
  };

  // Handle treatment plan status updates
  const handleUpdateTreatmentStatus = async (updatedPatient) => {
    setPatient(updatedPatient);
    toast.success('Treatment plan updated');
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    setDeletingNote(noteId);
    try {
      await api.delete(`/patients/${id}/notes/${noteId}`);
      // Refresh patient data to get updated notes
      fetchPatient();
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(error.response?.data?.message || 'Failed to delete note');
    } finally {
      setDeletingNote(null);
    }
  };

  const handleCancelEditNote = () => {
    setEditingNote(null);
    setEditNoteText('');
  };

  const handleDentalChartUpdate = (updatedPatient) => {
    setPatient(updatedPatient);
  };

  // Pagination logic for notes
  const reversedNotes = patient?.clinicalNotes ? [...patient.clinicalNotes].reverse() : [];
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = reversedNotes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(reversedNotes.length / notesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setEditingNote(null); // Close any open edit forms when changing pages
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading patient details...</div>;
  }

  if (!patient) {
    return <div className="text-center py-8">Patient not found</div>;
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/patients')}
          className="inline-flex items-center text-sm font-medium hover:opacity-75 transition-opacity"
          style={{ color: '#2A9D8F' }}
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Patients
        </button>
      </div>

      {/* Patient header card */}
      <div className="bg-white rounded-xl border p-5 mb-5 flex flex-col sm:flex-row sm:items-center gap-4" style={{ borderColor: '#E8DDD3', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #52C5B6, #2A9D8F)' }}>
          {patient.firstName?.[0]}{patient.lastName?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Lora, Georgia, serif', color: '#1C1917' }}>
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B5C52' }}>
            DOB: {formatDate(patient.dob)} &nbsp;·&nbsp; Age: {patient.age ?? '—'} &nbsp;·&nbsp; {patient.phone}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {patient.medicalHistory?.allergies?.length > 0 && (
            <StatusBadge status="danger">Allergies</StatusBadge>
          )}
          <StatusBadge status="success">Active</StatusBadge>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex px-2 sm:px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('info')}
              className={`${
                activeTab === 'info'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-2 sm:py-4 sm:px-1 border-b-2 font-medium text-xs sm:text-sm`}
            >
              Patient Info
            </button>
            <button
              onClick={() => setActiveTab('dental')}
              className={`${
                activeTab === 'dental'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-2 sm:py-4 sm:px-1 border-b-2 font-medium text-xs sm:text-sm`}
            >
              Dental Chart
            </button>
            <button
              onClick={() => setActiveTab('treatment')}
              className={`${
                activeTab === 'treatment'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-2 sm:py-4 sm:px-1 border-b-2 font-medium text-xs sm:text-sm`}
            >
              Treatment Plan
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`${
                activeTab === 'notes'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-2 sm:py-4 sm:px-1 border-b-2 font-medium text-xs sm:text-sm`}
            >
              Notes ({patient.clinicalNotes?.length || 0})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-6">
          {/* Patient Information Tab */}
          {activeTab === 'info' && (
            <>
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input name="firstName" required value={editForm.firstName} onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input name="lastName" required value={editForm.lastName} onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input type="date" name="dob" required value={editForm.dob} onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" name="phone" required value={editForm.phone} onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" required value={editForm.email} onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allergies <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                    <input name="allergies" value={editForm.allergies} onChange={handleEditChange}
                      placeholder="e.g., Penicillin, Latex"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                    <input name="conditions" value={editForm.conditions} onChange={handleEditChange}
                      placeholder="e.g., Diabetes, Hypertension"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm" />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(patient.dob)}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.phone}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patient.email}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Allergies</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {patient.medicalHistory?.allergies?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.medicalHistory.allergies.map((allergy, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">None reported</span>
                    )}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Medical Conditions</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {patient.medicalHistory?.conditions?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.medicalHistory.conditions.map((condition, index) => (
                          <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            {condition}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">None reported</span>
                    )}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex space-x-3">
                <Button onClick={() => setIsEditing(true)} variant="primary">Edit Patient</Button>
                <Button onClick={() => setShowDeleteConfirm(true)} variant="danger">Delete Patient</Button>
              </div>
                </>
              )}
            </>
          )}
          {/* Dental Chart Tab */}
          {activeTab === 'dental' && (
            <div>
              {patient && patient.age != null && patient.age <= 7 ? (
                <>
                  <div className="bg-blue-50 p-2 text-blue-800 text-xs font-semibold rounded mb-4">
                    👶 Pediatric View Active (Primary Teeth Charting) - Age: {patient.age}
                  </div>
                  <PediatricDentalChart
                    patientId={id}
                    dentalChart={patient.dentalChart}
                    onUpdate={handleDentalChartUpdate}
                  />
                </>
              ) : (
                <>
                  <div className="bg-green-50 p-2 text-green-800 text-xs font-semibold rounded mb-4">
                    🦷 Standard View Active (Permanent Teeth Charting) - Age: {patient?.age ?? 'Unknown'}
                  </div>
                  <DentalChart
                    patientId={id}
                    dentalChart={patient.dentalChart}
                    onUpdate={handleDentalChartUpdate}
                  />
                </>
              )}
            </div>
          )}
          {/* Treatment Plan Tab */}
          {activeTab === 'treatment' && (
            <TreatmentPlanList
              patientId={id}
              treatments={patient?.treatmentPlans || []}
              onUpdateStatus={handleUpdateTreatmentStatus}
            />
          )}
          {/* Clinical Notes Tab */}
          {activeTab === 'notes' && (
            <div>
              <form onSubmit={handleAddNote} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add New Note</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter clinical note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={addingNote || !noteText.trim()}
                  className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  {addingNote ? 'Adding...' : 'Add Note'}
                </button>
              </form>
              <div className="space-y-4">
                {currentNotes.length > 0 ? (
                  currentNotes.map((note) => (
                    <div key={note._id} className="bg-gray-50 p-4 rounded-lg">
                      {editingNote === note._id ? (
                        <div className="space-y-3">
                          <textarea
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            value={editNoteText}
                            onChange={(e) => setEditNoteText(e.target.value)}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateNote(note._id)}
                              disabled={updatingNote}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                              {updatingNote ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelEditNote}
                              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-gray-900 flex-1">{note.note}</p>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleEditNote(note)}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note._id)}
                                disabled={deletingNote === note._id}
                                className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50"
                              >
                                {deletingNote === note._id ? (
                                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="font-medium">{note.dentist?.username || 'Unknown'}</span>
                            <span className="mx-2">•</span>
                            <span>{formatDateTime(note.date)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No notes yet. Add the first note above.</p>
                )}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstNote + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(indexOfLastNote, reversedNotes.length)}</span> of{' '}
                        <span className="font-medium">{reversedNotes.length}</span> notes
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === index + 1
                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Patient</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <strong>{patient.firstName} {patient.lastName}</strong>? 
                  This action cannot be undone and will permanently remove all patient data including medical history and notes.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePatient}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Patient'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;