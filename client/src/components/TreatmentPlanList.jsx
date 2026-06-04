import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TreatmentPlanList = ({ patientId, treatments, onUpdateStatus }) => {
  const [updating, setUpdating] = useState(null); // ID of the treatment plan being updated

  const handleUpdateStatus = async (planId, newStatus) => {
    setUpdating(planId);
    try {
      const { data } = await api.patch(`/patients/${patientId}/treatment-plans/${planId}`, { status: newStatus });
      // Assuming the API returns the updated patient object
      onUpdateStatus(data);
      toast.success('Treatment plan status updated');
    } catch (error) {
      console.error('Error updating treatment plan:', error);
      toast.error(error.response?.data?.message || 'Failed to update treatment plan');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tooth/Surf</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Procedure</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {treatments.length > 0 ? (
            treatments.map((plan) => (
              <tr key={plan._id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {plan.toothNumber || 'Full'} {plan.surface}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{plan.procedure}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${plan.status === 'Completed' ? 'bg-green-100 text-green-800' : plan.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                    {plan.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {plan.status !== 'Completed' && (
                    <button 
                      onClick={() => handleUpdateStatus(plan._id, 'Completed')}
                      disabled={updating === plan._id}
                      className="text-teal-600 hover:text-teal-900 text-xs font-bold"
                    >
                      {updating === plan._id ? 'Updating...' : 'Mark Completed'}
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                No treatment plans yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TreatmentPlanList;