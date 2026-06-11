import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TreatmentPlanList = ({ patientId, treatments, onUpdateStatus }) => {
  const [updating, setUpdating] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    toothNumber: '',
    surface: '',
    procedure: '',
    cost: ''
  });

  const handleUpdateStatus = async (planId, newStatus) => {
    setUpdating(planId);
    try {
      const { data } = await api.patch(`/patients/${patientId}/treatment-plans/${planId}`, { status: newStatus });
      onUpdateStatus(data);
      toast.success('Treatment plan status updated');
    } catch (error) {
      console.error('Error updating treatment plan:', error);
      toast.error(error.response?.data?.message || 'Failed to update treatment plan');
    } finally {
      setUpdating(null);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!newPlan.procedure.trim()) {
      toast.error('Procedure is required');
      return;
    }

    setCreating(true);
    try {
      const { data } = await api.post(`/patients/${patientId}/treatment-plans`, {
        toothNumber: newPlan.toothNumber || null,
        surface: newPlan.surface || null,
        procedure: newPlan.procedure.trim(),
        cost: newPlan.cost ? parseFloat(newPlan.cost) : null
      });
      onUpdateStatus(data);
      setNewPlan({ toothNumber: '', surface: '', procedure: '', cost: '' });
      setShowForm(false);
      toast.success('Treatment plan created successfully');
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      toast.error(error.response?.data?.message || 'Failed to create treatment plan');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Proposed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Treatment Plan Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Treatment Plans</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition"
          >
            {showForm ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Plan
              </>
            )}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreatePlan} className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label htmlFor="toothNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Tooth Number
                </label>
                <input
                  type="text"
                  id="toothNumber"
                  placeholder="e.g., 18 or A"
                  value={newPlan.toothNumber}
                  onChange={(e) => setNewPlan({ ...newPlan, toothNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="surface" className="block text-sm font-medium text-gray-700 mb-1">
                  Surface
                </label>
                <input
                  type="text"
                  id="surface"
                  placeholder="e.g., MOD, O, M"
                  value={newPlan.surface}
                  onChange={(e) => setNewPlan({ ...newPlan, surface: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label htmlFor="procedure" className="block text-sm font-medium text-gray-700 mb-1">
                  Procedure <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="procedure"
                  required
                  placeholder="e.g., Composite Filling"
                  value={newPlan.procedure}
                  onChange={(e) => setNewPlan({ ...newPlan, procedure: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                  Cost (₱)
                </label>
                <input
                  type="number"
                  id="cost"
                  step="0.01"
                  placeholder="0.00"
                  value={newPlan.cost}
                  onChange={(e) => setNewPlan({ ...newPlan, cost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {creating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Treatment Plan'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Treatment Plans Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-[640px] divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Procedure
                </th>
                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tooth / Surface
                </th>
                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {treatments.length > 0 ? (
                treatments.map((plan, idx) => (
                  <tr key={`${plan.patientId}-${plan._id}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 break-words">{plan.procedure}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="text-xs sm:text-sm text-gray-900 flex flex-wrap gap-1">
                        {plan.toothNumber ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {plan.toothNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Full arch</span>
                        )}
                        {plan.surface && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {plan.surface}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">
                        {plan.cost
                          ? `₱${plan.cost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : <span className="text-gray-400 font-normal">—</span>
                        }
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(plan.status)}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {formatDate(plan.createdAt)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-right text-xs sm:text-sm">
                      {plan.status !== 'Completed' && plan.status !== 'Cancelled' && (
                        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                          {plan.status === 'Proposed' && (
                            <button
                              onClick={() => handleUpdateStatus(plan._id, 'In Progress')}
                              disabled={updating === plan._id}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 disabled:opacity-50 transition"
                              title="Start treatment"
                            >
                              {updating === plan._id ? '...' : 'Start'}
                            </button>
                          )}
                          {plan.status === 'In Progress' && (
                            <button
                              onClick={() => handleUpdateStatus(plan._id, 'Completed')}
                              disabled={updating === plan._id}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50 transition"
                              title="Mark as completed"
                            >
                              {updating === plan._id ? '...' : 'Complete'}
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(plan._id, 'Cancelled')}
                            disabled={updating === plan._id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition"
                            title="Cancel plan"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">No treatment plans yet</p>
                      <p className="text-xs text-gray-400 mt-1">Click "Add Plan" to create one.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlanList;
