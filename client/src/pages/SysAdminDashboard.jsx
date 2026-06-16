import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const SysAdminDashboard = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sys-admin/organizations', {
        headers: { 'X-System-Admin': 'true' }
      });
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orgId, newStatus) => {
    setUpdating(orgId);
    try {
      const { data } = await api.put(`/sys-admin/organizations/${orgId}/status`, 
        { status: newStatus },
        { headers: { 'X-System-Admin': 'true' } }
      );
      toast.success(data.message);
      fetchOrganizations();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error(error.response?.data?.message || 'Failed to update organization');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('sysAdminToken');
    localStorage.removeItem('sysAdmin');
    navigate('/sys-admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage clinic organizations and approvals</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow-sm rounded-xl">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Total Organizations</div>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{organizations.length}</div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-xl">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Pending Approval</div>
              <div className="mt-1 text-3xl font-semibold text-yellow-600">
                {organizations.filter(o => o.status === 'Pending').length}
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-xl">
            <div className="p-5">
              <div className="text-sm font-medium text-gray-500">Active</div>
              <div className="mt-1 text-3xl font-semibold text-green-600">
                {organizations.filter(o => o.status === 'Approved').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">All Organizations</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading organizations...</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No organizations found.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizations.map((org) => (
                  <tr key={org._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-sm text-gray-500">slug: {org.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{org.email}</div>
                      <div className="text-sm text-gray-500">{org.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{org.userCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(org.status)}`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(org.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-wrap gap-2">
                        {org.status !== 'Approved' && (
                          <button
                            onClick={() => handleUpdateStatus(org._id, 'Approved')}
                            disabled={updating === org._id}
                            className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs font-medium hover:bg-green-100 disabled:opacity-50"
                          >
                            {updating === org._id ? '...' : 'Approve'}
                          </button>
                        )}
                        {org.status !== 'Suspended' && (
                          <button
                            onClick={() => handleUpdateStatus(org._id, 'Suspended')}
                            disabled={updating === org._id}
                            className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                          >
                            {updating === org._id ? '...' : 'Suspend'}
                          </button>
                        )}
                        {org.status !== 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(org._id, 'Pending')}
                            disabled={updating === org._id}
                            className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md text-xs font-medium hover:bg-yellow-100 disabled:opacity-50"
                          >
                            {updating === org._id ? '...' : 'Set Pending'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SysAdminDashboard;
