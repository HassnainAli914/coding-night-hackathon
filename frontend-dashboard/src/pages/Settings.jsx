import React, { useState, useEffect } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import CustomDropdown from '../components/CustomDropdown';

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, fetchProfile } = useAuth();

  // Profile Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('client');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get('/api/users/profile');
        if (res.success && res.data?.profile) {
          const prof = res.data.profile;
          setName(prof.name || '');
          setEmail(prof.email || '');
          setPhone(prof.phone || '');
          // Detect encrypted Base64 role (length > 20 means it's still encrypted)
          const rawRole = prof.role || '';
          const isEncrypted = rawRole.length > 20;
          setRole(isEncrypted ? (user?.user_metadata?.role || 'client') : rawRole);
          setAvatarUrl(prof.avatar_url || '');
        } else {
          setName(user?.user_metadata?.name || '');
          setEmail(user?.email || '');
          setPhone(user?.user_metadata?.phone || user?.phone || '');
          setRole(user?.user_metadata?.role || 'client');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await api.put('/api/users/profile', {
        name,
        role,
        phone,
        email,
        avatar_url: avatarUrl,
      });

      if (res.success) {
        setMessage('Profile updated successfully!');
        await fetchProfile(); // Update global auth context profile state
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} title="Profile Settings" />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                {message && (
                  <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/25 p-4 text-sm text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/25 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">
                        Full Name
                      </label>
                      <input
                        id="name"
                        className="form-input w-full py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
                        Email Address
                      </label>
                      <input
                        id="email"
                        className="form-input w-full py-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
                        type="email"
                        value={email}
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="phone">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        className="form-input w-full py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="role">
                        Account Role
                      </label>
                      <CustomDropdown
                        options={[
                          { value: 'admin', label: 'Admin' },
                          { value: 'worker', label: 'Worker' },
                          { value: 'client', label: 'Client' },
                          { value: 'student', label: 'Student' },
                          { value: 'teacher', label: 'Teacher' }
                        ]}
                        value={role}
                        onChange={setRole}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="avatarUrl">
                        Avatar Image URL
                      </label>
                      <input
                        id="avatarUrl"
                        className="form-input w-full py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100"
                        type="text"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Saving changes...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
