import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import ReportIssueForm from '../components/ReportIssueForm';
import CustomDropdown from '../components/CustomDropdown';
import { useAuth } from '../contexts/AuthContext';

function Issues() {
  const { profile } = useAuth();
  const userRole = profile?.role || 'worker';
  const isAdmin = userRole === 'admin';
  const isWorkerOrTeacher = userRole === 'worker' || userRole === 'teacher';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  
  // Table state
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Form state
  const [assetCode, setAssetCode] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // AI Draft flow state
  const [reportStep, setReportStep] = useState(1); // 1 = Draft, 2 = AI Preview
  const [aiDraft, setAiDraft] = useState(null);
  const [draftAnalyzing, setDraftAnalyzing] = useState(false);

  // Categories list
  const [categories, setCategories] = useState([]);

  // Edit Issue state
  const [editIssue, setEditIssue] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', priority: '', category: '', status: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete Issue state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Assign Technician state
  const [assignIssue, setAssignIssue] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);

  // Resolve Issue state
  const [resolveIssue, setResolveIssue] = useState(null);
  const [resolveForm, setResolveForm] = useState({
    inspection_notes: '',
    work_performed: '',
    parts_replaced: '',
    cost: '0',
    time_spent: '0',
    next_service_date: ''
  });
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveError, setResolveError] = useState(null);

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/api/users/technicians');
      if (res.success && res.data?.technicians) {
        setTechnicians(res.data.technicians);
      }
    } catch (err) {
      console.error('Failed to fetch technicians:', err);
    }
  };

  const openAssign = (issue) => {
    setAssignIssue(issue);
    setSelectedTechnician(issue.assigned_technician_id || '');
    setAssignError(null);
    if (technicians.length === 0) fetchTechnicians();
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTechnician) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      const res = await api.put(`/api/issues/${assignIssue.id}/assign`, {
        assigned_technician_id: selectedTechnician,
      });
      if (res.success) {
        setAssignIssue(null);
        fetchIssues();
      } else {
        setAssignError(res.message || 'Failed to assign technician');
      }
    } catch (err) {
      setAssignError(err.message || 'An error occurred');
    } finally {
      setAssignLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      setLoading(true);
      let url = '/api/issues';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.success && res.data?.issues) {
        setIssues(res.data.issues);
      } else {
        setIssues([]);
        if (!res.success) setError(res.message || 'Failed to fetch issues');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching issues');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      if (res.success && res.data?.categories) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    if (viewMode === 'list') {
      fetchIssues();
    }
    fetchCategories();
  }, [statusFilter, priorityFilter, viewMode]);

  const handleAnalyzeDraft = async () => {
    if (!assetCode.trim() || !issueDescription.trim()) return;
    setDraftAnalyzing(true);
    setFormError(null);
    try {
      const resAssets = await api.get('/api/assets');
      const assetsList = resAssets.data?.assets || [];
      const selectedAsset = assetsList.find(a => a.id === assetCode);
      const assetName = selectedAsset ? selectedAsset.name : 'Asset';

      const res = await api.post('/api/issues/analyze-draft', {
        title: `Draft Issue for ${assetName}`,
        description: issueDescription
      });
      
      if (res.success && res.data?.analysis) {
        setAiDraft(res.data.analysis);
        setReportStep(2);
      } else {
        setFormError(res.message || "AI Analysis failed.");
      }
    } catch (err) {
      setFormError(err.message || "Failed to analyze draft.");
    } finally {
      setDraftAnalyzing(false);
    }
  };

  const handleAnalyzeAgain = async (answers) => {
    if (!assetCode.trim() || !issueDescription.trim()) return;
    setDraftAnalyzing(true);
    setFormError(null);
    try {
      const resAssets = await api.get('/api/assets');
      const assetsList = resAssets.data?.assets || [];
      const selectedAsset = assetsList.find(a => a.id === assetCode);
      const assetName = selectedAsset ? selectedAsset.name : 'Asset';

      let combinedDescription = issueDescription + '\n\nAdditional Details Provided:';
      for (const [question, answer] of Object.entries(answers)) {
        if (answer.trim()) {
          combinedDescription += `\n- ${question}: ${answer.trim()}`;
        }
      }

      const res = await api.post('/api/issues/analyze-draft', {
        title: `Draft Issue for ${assetName}`,
        description: combinedDescription
      });
      
      if (res.success && res.data?.analysis) {
        setAiDraft(res.data.analysis);
        setIssueDescription(combinedDescription);
      } else {
        setFormError(res.message || "AI Analysis failed.");
      }
    } catch (err) {
      setFormError(err.message || "Failed to analyze draft.");
    } finally {
      setDraftAnalyzing(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api.post('/api/issues', {
        asset_id: assetCode,
        title: aiDraft.title,
        description: aiDraft.description,
        category: aiDraft.category,
        priority: aiDraft.priority,
        possible_solution: aiDraft.possible_solution,
        skip_background_ai: true
      });

      if (res.success) {
        setAssetCode("");
        setIssueDescription("");
        setAiDraft(null);
        setReportStep(1);
        setViewMode('list');
        fetchIssues();
      } else {
        setFormError(res.message || "Failed to submit issue. Please try again.");
      }
    } catch (err) {
      setFormError(err.message || "Failed to submit issue.");
    } finally {
      setSubmitting(false);
    }
  };

  // Inspect Issue Action
  const handleInspect = async (id) => {
    if (!window.confirm('Do you want to start the inspection phase for this issue?')) return;
    try {
      const res = await api.post(`/api/issues/${id}/inspect`);
      if (res.success) {
        fetchIssues();
      } else {
        alert(res.message || 'Failed to start inspection');
      }
    } catch (err) {
      alert(err.message || 'An error occurred');
    }
  };

  // Edit Issue Handlers
  const handleRetryAi = async (id) => {
    try {
      const res = await api.post(`/api/issues/${id}/retry-ai`);
      if (res.success) {
        alert('AI Retry triggered! The analysis will process in the background. Please refresh in a few seconds.');
        fetchIssues();
      } else {
        alert(res.message || 'Failed to retry AI');
      }
    } catch (err) {
      alert(err.message || 'An error occurred');
    }
  };

  const openEdit = (issue) => {
    setEditIssue(issue);
    setEditForm({
      title: issue.title || '',
      description: issue.description || '',
      priority: issue.priority || 'Medium',
      category: issue.category || 'General',
      status: issue.status || 'Reported'
    });
    setEditError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await api.put(`/api/issues/${editIssue.id}`, editForm);
      if (res.success) {
        setEditIssue(null);
        fetchIssues();
      } else {
        setEditError(res.message || 'Failed to update issue');
      }
    } catch (err) {
      setEditError(err.message || 'An error occurred');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Issue Handler
  const handleDeleteSubmit = async () => {
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/api/issues/${deleteId}`);
      if (res.success) {
        setDeleteId(null);
        fetchIssues();
      } else {
        alert(res.message || 'Failed to delete issue');
      }
    } catch (err) {
      alert(err.message || 'An error occurred');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Resolve Issue Handlers
  const openResolve = (issue) => {
    setResolveIssue(issue);
    setResolveForm({
      inspection_notes: '',
      work_performed: '',
      parts_replaced: '',
      cost: '0',
      time_spent: '0',
      next_service_date: ''
    });
    setResolveError(null);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setResolveLoading(true);
    setResolveError(null);
    try {
      const res = await api.post(`/api/issues/${resolveIssue.id}/resolve`, {
        ...resolveForm,
        cost: Number(resolveForm.cost),
        time_spent: Number(resolveForm.time_spent)
      });
      if (res.success) {
        setResolveIssue(null);
        fetchIssues();
      } else {
        setResolveError(res.message || 'Failed to resolve issue');
      }
    } catch (err) {
      setResolveError(err.message || 'An error occurred');
    } finally {
      setResolveLoading(false);
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
                  {viewMode === 'list' 
                    ? 'Issues Center' 
                    : reportStep === 1 
                      ? 'Draft a New Issue' 
                      : 'Review AI Recommendation'}
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
                      onClick={() => {
                        if (reportStep === 2) setReportStep(1);
                        else {
                          setViewMode('list');
                          setReportStep(1);
                        }
                      }}
                      className="btn bg-white border-gray-200 text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {reportStep === 2 ? 'Back to Edit' : 'Cancel'}
                    </button>
                    {reportStep === 1 ? (
                      <button 
                        onClick={handleAnalyzeDraft}
                        disabled={draftAnalyzing || !assetCode.trim() || !issueDescription.trim()}
                        className="btn bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        {draftAnalyzing ? 'Analyzing...' : '✨ Analyze with AI'}
                      </button>
                    ) : (
                      <button 
                        onClick={handleFinalSubmit}
                        disabled={submitting}
                        className="btn bg-green-600 text-white hover:bg-green-700 shadow-sm disabled:opacity-50 flex items-center gap-2"
                      >
                        {submitting ? 'Submitting...' : 'Submit AI Recommendation'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-full xl:col-span-12 bg-white dark:bg-gray-800 shadow-xs rounded-xl border border-gray-200 dark:border-gray-700/60">
              {viewMode === 'list' ? (
                <>
                  <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">All Reported Issues</h2>
                    <div className="flex gap-2 items-center">
                      <CustomDropdown
                        className="w-44"
                        options={[
                          { value: '', label: 'All Statuses' },
                          { value: 'Reported', label: 'Reported' },
                          { value: 'Assigned', label: 'Assigned' },
                          { value: 'Inspection Started', label: 'Inspection Started' },
                          { value: 'Resolved', label: 'Resolved' }
                        ]}
                        value={statusFilter}
                        onChange={setStatusFilter}
                      />
                      <CustomDropdown
                        className="w-44"
                        options={[
                          { value: '', label: 'All Priorities' },
                          { value: 'Critical', label: 'Critical' },
                          { value: 'High', label: 'High' },
                          { value: 'Medium', label: 'Medium' },
                          { value: 'Low', label: 'Low' }
                        ]}
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                      />
                    </div>
                  </header>
                  <div className="p-3">
                    <div className="overflow-x-auto">
                      {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading issues...</div>
                      ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                      ) : issues.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No issues found. Everything is running smoothly!</div>
                      ) : (
                        <table className="table-auto w-full dark:text-gray-300">
                          <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 rounded-xs">
                            <tr>
                              <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Issue Code</div></th>
                              <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Asset</div></th>
                              <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Title</div></th>
                              <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Priority</div></th>
                              <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Status</div></th>
                              <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Reported On</div></th>
                              <th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">Actions</div></th>
                            </tr>
                          </thead>
                          <tbody className="text-sm font-medium divide-y divide-gray-100 dark:divide-gray-700/60">
                            {issues.map(issue => (
                              <tr key={issue.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="p-2 whitespace-nowrap">
                                  <div className="text-violet-500 font-semibold">{issue.id.substring(0,8).toUpperCase()}</div>
                                </td>
                                <td className="p-2 whitespace-nowrap">
                                  <div className="text-gray-800 dark:text-gray-100">{issue.asset?.name || issue.assets?.name || issue.asset_id}</div>
                                </td>
                                <td className="p-2">
                                  <div className="text-gray-800 dark:text-gray-100 truncate max-w-xs" title={issue.title}>{issue.title}</div>
                                </td>
                                <td className="p-2 whitespace-nowrap">
                                  <div className={`text-xs inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${
                                    issue.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                    issue.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                    issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {issue.priority}
                                  </div>
                                </td>
                                <td className="p-2 whitespace-nowrap">
                                  <div className={`text-xs inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${
                                    issue.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                    issue.status === 'Reported' ? 'bg-red-100 text-red-700' :
                                    issue.status === 'Inspection Started' ? 'bg-amber-100 text-amber-700' :
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
                                <td className="p-2 whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* Inspect Action (technician/worker/admin only, if Reported or Assigned) */}
                                    {(issue.status === 'Reported' || issue.status === 'Assigned') && (
                                      <button 
                                        onClick={() => handleInspect(issue.id)}
                                        title="Start Inspection"
                                        className="p-1 rounded text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                      </button>
                                    )}

                                    {/* Resolve Action (technician/worker/admin only, if Inspection Started) */}
                                    {issue.status === 'Inspection Started' && (
                                      <button 
                                        onClick={() => openResolve(issue)}
                                        title="Log Maintenance & Resolve"
                                        className="p-1 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </button>
                                    )}

                                    {/* Assign Technician (Admin only) */}
                                    {isAdmin && (issue.status === 'Reported' || issue.status === 'Assigned') && (
                                      <button 
                                        onClick={() => openAssign(issue)}
                                        title="Assign Technician"
                                        className="p-1 rounded text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                      </button>
                                    )}

                                    {/* Edit Action (Admin only) */}
                                    {isAdmin && (
                                      <button 
                                        onClick={() => openEdit(issue)}
                                        title="Edit Issue"
                                        className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-2-3l3 3L12 15H9v-3l9-9z" />
                                        </svg>
                                      </button>
                                    )}

                                    {/* Delete Action (Admin only) */}
                                    {isAdmin && (
                                      <button 
                                        onClick={() => setDeleteId(issue.id)}
                                        title="Delete Issue"
                                        className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
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
                </>
              ) : (
                <ReportIssueForm 
                  assetCode={assetCode} 
                  setAssetCode={setAssetCode} 
                  issueDescription={issueDescription} 
                  setIssueDescription={setIssueDescription} 
                  error={formError}
                  reportStep={reportStep}
                  aiDraft={aiDraft}
                  handleAnalyzeAgain={handleAnalyzeAgain}
                  draftAnalyzing={draftAnalyzing}
                />
              )}
            </div>

          </div>
        </main>
      </div>

      {/* ── Edit Modal ────────────────────────────── */}
      {editIssue && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setEditIssue(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto mt-10">
              <div className="flex justify-between items-center mb-5 sticky top-0 bg-white dark:bg-gray-800 pb-2 z-10 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Issue Details & Analysis</h3>
                  {editIssue.ai_status === 'Pending' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full animate-pulse flex items-center gap-1">⏳ AI Processing...</span>}
                  {editIssue.ai_status === 'Failed' && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">❌ AI Failed</span>}
                  {editIssue.ai_status === 'Completed' && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">✨ AI Analyzed</span>}
                </div>
                <div className="flex items-center gap-2">
                  {(editIssue.ai_status === 'Failed' || editIssue.ai_status === 'Pending') && (
                    <button onClick={() => handleRetryAi(editIssue.id)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-lg font-medium transition-colors">
                      Retry AI Analysis
                    </button>
                  )}
                  <button onClick={() => setEditIssue(null)} className="text-gray-400 hover:text-gray-600 ml-2">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                  </button>
                </div>
              </div>
              
              {editError && <p className="text-red-500 text-sm mb-3">{editError}</p>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Original Report & Editable Fields */}
                <div className="space-y-5">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Original User Submission</h4>
                    <div className="mb-3">
                      <span className="text-xs text-gray-400 block mb-1">Raw Title</span>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">{editIssue.title}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">Raw Description</span>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">{editIssue.description}</p>
                    </div>
                  </div>

                  <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Modify Ticket</h4>
                    <div>
                      <label className="block text-sm font-medium mb-1">Update Title</label>
                      <input className="form-input w-full" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Update Description</label>
                      <textarea rows="3" className="form-textarea w-full" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <CustomDropdown options={['Low', 'Medium', 'High', 'Critical']} value={editForm.priority} onChange={val => setEditForm({...editForm, priority: val})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <CustomDropdown options={categories.map(c => c.name)} value={editForm.category} onChange={val => setEditForm({...editForm, category: val})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <CustomDropdown options={['Reported', 'Assigned', 'Inspection Started', 'Resolved']} value={editForm.status} onChange={val => setEditForm({...editForm, status: val})} />
                    </div>
                    <div className="flex gap-2 pt-2 justify-end">
                      <button type="submit" disabled={editLoading} className="btn bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 w-full">
                        {editLoading ? 'Saving...' : 'Save Manual Changes'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column: AI Analysis */}
                <div>
                  <div className="bg-violet-50/50 dark:bg-violet-900/10 p-5 rounded-xl border border-violet-100 dark:border-violet-900/30 h-full">
                    <h4 className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Executive Analysis
                    </h4>

                    {editIssue.ai_status === 'Completed' ? (
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs text-violet-500/70 block mb-1">Suggested Title</span>
                          <p className="text-gray-900 dark:text-gray-100 font-semibold">{editIssue.ai_title}</p>
                        </div>
                        <div>
                          <span className="text-xs text-violet-500/70 block mb-1">Executive Summary</span>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{editIssue.ai_summary}</p>
                        </div>
                        <div>
                          <span className="text-xs text-violet-500/70 block mb-1">Organized Description</span>
                          <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{editIssue.ai_description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-violet-100/50 dark:border-violet-900/20">
                            <span className="text-xs text-violet-500/70 block mb-1">Detected Category</span>
                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{editIssue.ai_category}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-violet-100/50 dark:border-violet-900/20">
                            <span className="text-xs text-violet-500/70 block mb-1">Estimated Priority</span>
                            <p className={`font-medium text-sm ${
                              editIssue.ai_priority === 'Critical' ? 'text-red-600' :
                              editIssue.ai_priority === 'High' ? 'text-orange-600' :
                              editIssue.ai_priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                            }`}>{editIssue.ai_priority}</p>
                          </div>
                        </div>

                        {editIssue.ai_keywords && editIssue.ai_keywords.length > 0 && (
                          <div>
                            <span className="text-xs text-violet-500/70 block mb-2">Keywords</span>
                            <div className="flex flex-wrap gap-1.5">
                              {editIssue.ai_keywords.map((kw, i) => (
                                <span key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {editIssue.ai_missing_information && editIssue.ai_missing_information.length > 0 && (
                          <div>
                            <span className="text-xs text-rose-500/70 block mb-2">Missing Information Detected</span>
                            <ul className="list-disc list-inside text-xs text-rose-600 dark:text-rose-400 space-y-1">
                              {editIssue.ai_missing_information.map((info, i) => (
                                <li key={i}>{info}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-4">
                          <button 
                            onClick={() => {
                              setEditForm({
                                ...editForm,
                                title: editIssue.ai_title || editForm.title,
                                description: editIssue.ai_description || editForm.description,
                                category: editIssue.ai_category || editForm.category,
                                priority: editIssue.ai_priority || editForm.priority
                              });
                            }}
                            className="text-xs bg-violet-600 hover:bg-violet-700 text-white py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Apply AI Suggestions to Form
                          </button>
                        </div>
                      </div>
                    ) : editIssue.ai_status === 'Pending' ? (
                      <div className="flex flex-col items-center justify-center h-48 text-violet-500 opacity-60">
                        <svg className="w-8 h-8 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm font-medium">Analyzing report securely...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-sm">AI Analysis Failed or Unavailable</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Resolve Modal ───────────────────────────── */}
      {resolveIssue && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setResolveIssue(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Log Maintenance & Resolve</h3>
                <button onClick={() => setResolveIssue(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                </button>
              </div>
              {resolveError && <p className="text-red-500 text-sm mb-3">{resolveError}</p>}
              <form onSubmit={handleResolveSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Inspection Notes *</label>
                  <textarea rows="2" className="form-textarea w-full" value={resolveForm.inspection_notes} onChange={e => setResolveForm({...resolveForm, inspection_notes: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Work Performed *</label>
                  <textarea rows="2" className="form-textarea w-full" value={resolveForm.work_performed} onChange={e => setResolveForm({...resolveForm, work_performed: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Parts Replaced (optional)</label>
                  <input className="form-input w-full" value={resolveForm.parts_replaced} onChange={e => setResolveForm({...resolveForm, parts_replaced: e.target.value})} placeholder="e.g. Filters, Seals" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cost ($) *</label>
                    <input type="number" min="0" className="form-input w-full" value={resolveForm.cost} onChange={e => setResolveForm({...resolveForm, cost: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time Spent (hours) *</label>
                    <input type="number" min="0.1" step="0.1" className="form-input w-full" value={resolveForm.time_spent} onChange={e => setResolveForm({...resolveForm, time_spent: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Next Service Date (optional)</label>
                  <input type="date" className="form-input w-full" value={resolveForm.next_service_date} onChange={e => setResolveForm({...resolveForm, next_service_date: e.target.value})} />
                </div>
                <div className="flex gap-2 pt-2 justify-end">
                  <button type="button" onClick={() => setResolveIssue(null)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                  <button type="submit" disabled={resolveLoading} className="btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                    {resolveLoading ? 'Resolving...' : 'Confirm Resolution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Assign Technician Modal ──────────────────────── */}
      {assignIssue && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setAssignIssue(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Assign Technician</h3>
                <button onClick={() => setAssignIssue(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Issue:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400">{assignIssue.title}</span>
              </div>
              {assignError && <p className="text-red-500 text-sm mb-3">{assignError}</p>}
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Technician</label>
                  {technicians.length === 0 ? (
                    <p className="text-sm text-gray-500">Loading technicians...</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {technicians.map((tech) => (
                        <label
                          key={tech.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedTechnician === tech.id
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="technician"
                            value={tech.id}
                            checked={selectedTechnician === tech.id}
                            onChange={(e) => setSelectedTechnician(e.target.value)}
                            className="text-violet-600 focus:ring-violet-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{tech.name}</div>
                            <div className="text-xs text-gray-400">{tech.email} · {tech.role}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2 justify-end">
                  <button type="button" onClick={() => setAssignIssue(null)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                  <button type="submit" disabled={assignLoading || !selectedTechnician} className="btn bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
                    {assignLoading ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────── */}
      {deleteId && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Delete Issue?</h3>
              <p className="text-gray-500 text-sm mb-6">This will permanently delete this reported issue. This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteId(null)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                <button onClick={handleDeleteSubmit} disabled={deleteLoading} className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Issues;
