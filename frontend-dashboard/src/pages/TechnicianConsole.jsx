import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { useAuth } from '../contexts/AuthContext';

function TechnicianConsole() {
  const { user, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Resolve modal state
  const [resolveIssue, setResolveIssue] = useState(null);
  const [resolveForm, setResolveForm] = useState({
    inspection_notes: '',
    work_performed: '',
    parts_replaced: '',
    cost: '0',
    time_spent: '0',
    next_service_date: '',
  });
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveError, setResolveError] = useState(null);

  const fetchAssignedIssues = async () => {
    try {
      setLoading(true);
      let url = '/api/issues';
      const params = new URLSearchParams();
      if (user?.id) params.append('assigned_technician_id', user.id);
      if (statusFilter) params.append('status', statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.success && res.data?.issues) {
        setIssues(res.data.issues);
      } else {
        setIssues([]);
        if (!res.success) setError(res.message || 'Failed to fetch assigned issues');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedIssues();
  }, [statusFilter]);

  const handleInspect = async (id) => {
    if (!window.confirm('Start inspection for this issue?')) return;
    try {
      const res = await api.post(`/api/issues/${id}/inspect`);
      if (res.success) {
        fetchAssignedIssues();
      } else {
        alert(res.message || 'Failed to start inspection');
      }
    } catch (err) {
      alert(err.message || 'An error occurred');
    }
  };

  const openResolve = (issue) => {
    setResolveIssue(issue);
    setResolveForm({
      inspection_notes: '',
      work_performed: '',
      parts_replaced: '',
      cost: '0',
      time_spent: '0',
      next_service_date: '',
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
        time_spent: Number(resolveForm.time_spent),
      });
      if (res.success) {
        setResolveIssue(null);
        fetchAssignedIssues();
      } else {
        setResolveError(res.message || 'Failed to resolve issue');
      }
    } catch (err) {
      setResolveError(err.message || 'An error occurred');
    } finally {
      setResolveLoading(false);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      'Assigned': 'bg-blue-100 text-blue-700',
      'Inspection Started': 'bg-amber-100 text-amber-700',
      'Maintenance In Progress': 'bg-orange-100 text-orange-700',
      'Resolved': 'bg-green-100 text-green-700',
      'Reported': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const priorityBadge = (priority) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-700',
      'High': 'bg-orange-100 text-orange-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'Low': 'bg-green-100 text-green-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Technician Console</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Your assigned tickets and active work orders
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  className="form-select text-sm rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Inspection Started">Inspection Started</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{issues.filter(i => i.status === 'Assigned').length}</div>
                  <div className="text-xs text-gray-500 uppercase">Awaiting Inspection</div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{issues.filter(i => i.status === 'Inspection Started').length}</div>
                  <div className="text-xs text-gray-500 uppercase">Under Inspection</div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{issues.filter(i => i.status === 'Resolved').length}</div>
                  <div className="text-xs text-gray-500 uppercase">Resolved</div>
                </div>
              </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60">
              <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Assigned Tickets ({issues.length})</h2>
              </header>
              <div className="p-3">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading your assigned tickets...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">{error}</div>
                ) : issues.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p>No tickets assigned to you right now. Great work!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {issues.map((issue) => (
                      <div
                        key={issue.id}
                        className="border border-gray-100 dark:border-gray-700/60 rounded-xl p-4 hover:shadow-sm transition-shadow bg-gray-50/50 dark:bg-gray-900/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-violet-500 font-semibold">{issue.issue_number || issue.id.substring(0, 8).toUpperCase()}</span>
                              <span className={`text-xs inline-flex font-medium rounded-full px-2 py-0.5 ${priorityBadge(issue.priority)}`}>
                                {issue.priority}
                              </span>
                              <span className={`text-xs inline-flex font-medium rounded-full px-2 py-0.5 ${statusBadge(issue.status)}`}>
                                {issue.status}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{issue.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{issue.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                              <span>Asset: {issue.asset?.name || 'N/A'}</span>
                              <span>•</span>
                              <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            {(issue.status === 'Assigned' || issue.status === 'Reported') && (
                              <button
                                onClick={() => handleInspect(issue.id)}
                                className="btn text-xs bg-amber-500 text-white hover:bg-amber-600 px-3 py-1.5 rounded-lg"
                              >
                                Start Inspection
                              </button>
                            )}
                            {issue.status === 'Inspection Started' && (
                              <button
                                onClick={() => openResolve(issue)}
                                className="btn text-xs bg-emerald-500 text-white hover:bg-emerald-600 px-3 py-1.5 rounded-lg"
                              >
                                Log & Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Resolve Modal ───────────────────────────── */}
      {resolveIssue && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setResolveIssue(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Log Maintenance & Resolve</h3>
                <button onClick={() => setResolveIssue(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Issue:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400">{resolveIssue.title}</span>
              </div>
              {resolveError && <p className="text-red-500 text-sm mb-3">{resolveError}</p>}
              <form onSubmit={handleResolveSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Inspection Notes *</label>
                  <textarea rows="2" className="form-textarea w-full" value={resolveForm.inspection_notes} onChange={e => setResolveForm({...resolveForm, inspection_notes: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Work Performed *</label>
                  <textarea rows="2" className="form-textarea w-full" value={resolveForm.work_performed} onChange={e => setResolveForm({...resolveForm, work_performed: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Parts Replaced (optional)</label>
                  <input className="form-input w-full" value={resolveForm.parts_replaced} onChange={e => setResolveForm({...resolveForm, parts_replaced: e.target.value})} placeholder="e.g. Filters, Seals" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Cost ($) *</label>
                    <input type="number" min="0" className="form-input w-full" value={resolveForm.cost} onChange={e => setResolveForm({...resolveForm, cost: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Time Spent (hours) *</label>
                    <input type="number" min="0.1" step="0.1" className="form-input w-full" value={resolveForm.time_spent} onChange={e => setResolveForm({...resolveForm, time_spent: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Next Service Date (optional)</label>
                  <input type="date" className="form-input w-full" value={resolveForm.next_service_date} onChange={e => setResolveForm({...resolveForm, next_service_date: e.target.value})} />
                </div>
                <div className="flex gap-2 pt-2 justify-end">
                  <button type="button" onClick={() => setResolveIssue(null)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                  <button type="submit" disabled={resolveLoading} className="btn bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
                    {resolveLoading ? 'Resolving...' : 'Confirm Resolution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TechnicianConsole;
