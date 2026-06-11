import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const isAdmin = user?.role === 'admin';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [staffUsername, setStaffUsername] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      setPwLoading(false);
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);

    try {
      await api.post('/organization/users', {
        username: staffUsername,
        email: staffEmail,
        password: staffPassword,
        role: 'staff'
      });
      toast.success('Staff account created successfully');
      setStaffUsername('');
      setStaffEmail('');
      setStaffPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create staff account');
    } finally {
      setStaffLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="md:pl-64">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-navy-900 mb-6">Account Settings</h1>

          {/* Change Password Section */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-navy-900">Change Password</h2>
              <p className="text-sm text-gray-500 mt-1">Update your account password</p>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter new password"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pwLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Add Staff Section - Admin Only */}
          {isAdmin && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-navy-900">Add Staff Account</h2>
                <p className="text-sm text-gray-500 mt-1">Create a new staff member account (max 2 staff per clinic)</p>
              </div>
              <form onSubmit={handleAddStaff} className="p-6 space-y-4">
                <div>
                  <label htmlFor="staffUsername" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="staffUsername"
                    type="text"
                    required
                    value={staffUsername}
                    onChange={(e) => setStaffUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label htmlFor="staffEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="staffEmail"
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label htmlFor="staffPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="staffPassword"
                    type="password"
                    required
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter password"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={staffLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {staffLoading ? 'Creating...' : 'Create Staff Account'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
