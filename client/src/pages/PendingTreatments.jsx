import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import TreatmentPlanList from '../components/TreatmentPlanList';

export default function PendingTreatments() {
  const [pendingPlans, setPendingPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch all patients and aggregate pending treatment plans client-side
        const { data: patients } = await api.get('/patients');
        const plans = [];
        patients.forEach(p => {
          if (Array.isArray(p.treatmentPlans)) {
            p.treatmentPlans.forEach(tp => {
              if (tp.status === 'Proposed' || tp.status === 'pending') {
                plans.push({ ...tp, patientId: p._id, patientName: `${p.firstName} ${p.lastName}`, patientRef: p });
              }
            });
          }
        });
        setPendingPlans(plans);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load pending treatments');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpdate = (updatedPlan) => {
    setPendingPlans(prev => prev.map(p => p._id === updatedPlan._id ? { ...p, ...updatedPlan } : p));
  };

  // Convert pendingPlans into the shape expected by TreatmentPlanList (grouped by patient)
  const groupedByPatient = {};
  pendingPlans.forEach(p => {
    const pid = p.patientId;
    if (!groupedByPatient[pid]) groupedByPatient[pid] = { patientId: pid, patientName: p.patientName || '', treatments: [] };
    groupedByPatient[pid].treatments.push(p);
  });

  const flatList = Object.values(groupedByPatient).map(g => ({ patientId: g.patientId, patientName: g.patientName, treatments: g.treatments }));

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Pending Treatment Plans</h1>
        <p className="text-sm text-gray-600">All treatment plans currently pending or proposed.</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : flatList.length === 0 ? (
        <p className="text-gray-500">No pending treatment plans.</p>
      ) : (
        <div className="space-y-6">
          {flatList.map(group => (
            <div key={group.patientId} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="mb-3">
                <div className="text-sm font-medium">{group.patientName} — <span className="text-gray-500">{group.patientId}</span></div>
              </div>
              <TreatmentPlanList patientId={group.patientId} treatments={group.treatments} onUpdateStatus={handleUpdate} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
