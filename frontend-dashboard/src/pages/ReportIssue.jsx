import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { useAuth } from '../contexts/AuthContext';
import ReportIssueForm from '../components/ReportIssueForm';
import CustomDropdown from '../components/CustomDropdown';

function ReportIssue() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const { user } = useAuth();
  
  // Table state
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Form state
  const [assetCode, setAssetCode] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      let url = '/api/issues'; // Assuming a backend route that filters by current user OR returns all issues that we filter locally
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.success && res.data?.issues) {
        setIssues(res.data.issues);
      } else {
        setIssues([]);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching your issues');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'list') {
      fetchMyIssues();
    }
  }, [statusFilter, viewMode]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!assetCode.trim() || !issueDescription.trim()) return;
    
    setSubmitting(true);
    setFormError(null);
    try {
      // Find asset category and name first to send to the backend
      const resAssets = await api.get('/api/assets');
      const assetsList = resAssets.data?.assets || [];
      const selectedAsset = assetsList.find(a => a.id === assetCode);
      const assetName = selectedAsset ? selectedAsset.name : 'Asset';
      const assetCategory = selectedAsset ? selectedAsset.category : 'General';

      const res = await api.post('/api/issues', {
        asset_id: assetCode,
        title: `Issue reported for ${assetName}`,
        description: issueDescription,
        category: assetCategory,
        priority: 'Medium'
      });

      if (res.success) {
        setAssetCode("");
        setIssueDescription("");
        setViewMode('list');
      } else {
        setFormError(res.message || "Failed to submit issue. Please try again.");
      }
    } catch (err) {
      setFormError(err.message || "Failed to submit issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900">
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  {viewMode === 'list' ? 'My Reported Issues' : 'Report a New Issue'}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {viewMode === 'list' ? (
                  <button 
                    onClick={() => setViewMode('form')}
                    className="btn bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current opacity-50 shrink-0" viewBox="0 0 16 16">
                      <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                    </svg>
                    <span className="hidden xs:block ml-2">Report New Issue</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setViewMode('list')}
                      className="btn bg-white border-gray-200 text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Back to Issues List
                    </button>
                    <button 
                      type="submit"
                      form="issue-form"
                      onClick={handleSubmit}
                      disabled={submitting || !assetCode.trim() || !issueDescription.trim()}
                      className="btn bg-violet-600 text-white hover:bg-violet-700 shadow-sm disabled:opacity-50"
                    >
                      {submitting ? 'Analyzing and Submitting...' : 'Submit Report'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-full xl:col-span-12 bg-white dark:bg-gray-800 shadow-xs rounded-xl border border-gray-200 dark:border-gray-700/60">
              {viewMode === 'list' ? (
                <>
                  <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">History</h2>
                    <div className="flex gap-2 items-center">
                      <CustomDropdown
                        className="w-44"
                        options={[
                          { value: '', label: 'All Statuses' },
                          { value: 'Open', label: 'Open' },
                          { value: 'In Progress', label: 'In Progress' },
                          { value: 'Resolved', label: 'Resolved' }
                        ]}
                        value={statusFilter}
                        onChange={setStatusFilter}
                      />
                    </div>
                  </header>
                  <div className="p-3">
                    <div className="overflow-x-auto">
                      {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading your issues...</div>
                      ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                      ) : issues.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p>You haven't reported any issues yet.</p>
                        </div>
                      ) : (
                        <table className="table-auto w-full dark:text-gray-300">
                          <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 rounded-xs">
                            <tr>
                              <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Asset</div></th>
                              <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Title</div></th>
                              <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Status</div></th>
                              <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Date</div></th>
                            </tr>
                          </thead>
                          <tbody className="text-sm font-medium divide-y divide-gray-100 dark:divide-gray-700/60">
                            {issues.map(issue => (
                              <tr key={issue.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                 <td className="p-2 whitespace-nowrap">
                                   <div className="text-gray-800 dark:text-gray-100 font-semibold">{issue.asset?.name || issue.assets?.name || issue.asset_id}</div>
                                 </td>
                                <td className="p-2">
                                  <div className="text-gray-800 dark:text-gray-100 truncate max-w-xs">{issue.title}</div>
                                </td>
                                <td className="p-2 whitespace-nowrap">
                                  <div className={`text-xs inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${
                                    issue.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                    issue.status === 'Open' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {issue.status}
                                  </div>
                                </td>
                                <td className="p-2 whitespace-nowrap">
                                  <div className="text-gray-500 dark:text-gray-400">
                                    {new Date(issue.created_at).toLocaleDateString()}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <ReportIssueForm 
                  assetCode={assetCode} 
                  setAssetCode={setAssetCode} 
                  issueDescription={issueDescription} 
                  setIssueDescription={setIssueDescription} 
                  error={formError} 
                />
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default ReportIssue;
