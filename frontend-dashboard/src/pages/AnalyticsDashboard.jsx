import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';

function AnalyticsDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/analytics/summary');
        if (res.success && res.data?.summary) {
          setSummary(res.data.summary);
        } else {
          setError(res.message || 'Failed to load analytics');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const statusColors = {
    'Operational': 'bg-emerald-500',
    'Issue Reported': 'bg-red-500',
    'Under Inspection': 'bg-amber-500',
    'Under Maintenance': 'bg-orange-500',
    'Out of Service': 'bg-gray-500',
    'Retired': 'bg-gray-400',
  };

  const priorityColors = {
    'Critical': 'bg-red-500',
    'High': 'bg-orange-500',
    'Medium': 'bg-yellow-500',
    'Low': 'bg-emerald-500',
  };

  const actionIcons = {
    'ISSUE_REPORTED': { icon: '⚠️', color: 'text-red-500 bg-red-50 dark:bg-red-900/30' },
    'TECHNICIAN_ASSIGNED': { icon: '👤', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' },
    'INSPECTION_STARTED': { icon: '🔍', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' },
    'MAINTENANCE_COMPLETED': { icon: '✅', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' },
    'STATUS_CHANGED': { icon: '🔄', color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/30' },
  };

  const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
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
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Analytics Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time overview of your maintenance operations</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full"></div>
                <span className="ml-3 text-gray-500">Loading analytics...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : summary && (
              <>
                {/* ─── KPI Cards Row ──────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* Total Assets */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{summary.totalAssets}</div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-1">Total Assets</div>
                  </div>

                  {/* Open Issues */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{summary.openIssues}</div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-1">Open Issues</div>
                    {summary.unassignedIssues > 0 && (
                      <div className="text-xs text-red-500 font-medium mt-1">{summary.unassignedIssues} unassigned</div>
                    )}
                  </div>

                  {/* Total Expenditure */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">${summary.totalMaintenanceCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-1">Total Maintenance Cost</div>
                  </div>

                  {/* Resolved / Total */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                      {summary.issueStatusBreakdown['Resolved'] || 0}
                      <span className="text-lg text-gray-400 font-normal">/{summary.totalIssues}</span>
                    </div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-1">Issues Resolved</div>
                  </div>
                </div>

                {/* ─── Middle Row: Status + Priority Breakdowns ──── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Asset Status Breakdown */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-6">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Asset Status Breakdown</h3>
                    <div className="space-y-3">
                      {Object.entries(summary.assetStatusBreakdown).map(([status, count]) => {
                        const percentage = summary.totalAssets > 0 ? Math.round((count / summary.totalAssets) * 100) : 0;
                        return (
                          <div key={status}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-gray-700 dark:text-gray-300">{status}</span>
                              <span className="text-gray-500">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${statusColors[status] || 'bg-gray-400'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(summary.assetStatusBreakdown).length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No assets registered yet</p>
                      )}
                    </div>
                  </div>

                  {/* Issues Priority Breakdown */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-6">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Issues by Priority</h3>
                    <div className="space-y-3">
                      {['Critical', 'High', 'Medium', 'Low'].map((priority) => {
                        const count = summary.issuePriorityBreakdown[priority] || 0;
                        const percentage = summary.totalIssues > 0 ? Math.round((count / summary.totalIssues) * 100) : 0;
                        return (
                          <div key={priority}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-gray-700 dark:text-gray-300">{priority}</span>
                              <span className="text-gray-500">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${priorityColors[priority] || 'bg-gray-400'}`}
                                style={{ width: `${Math.max(percentage, 2)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                      {summary.totalIssues === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No issues reported yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ─── Recent Activity Feed ────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-6">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-5">Recent Activity</h3>
                  {summary.recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No activity recorded yet</p>
                  ) : (
                    <div className="space-y-0">
                      {summary.recentActivity.map((event, idx) => {
                        const ai = actionIcons[event.action] || { icon: '📋', color: 'text-gray-500 bg-gray-50 dark:bg-gray-700' };
                        return (
                          <div key={event.id} className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm ${ai.color}`}>
                              {ai.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">{event.details}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {event.asset && (
                                  <span className="text-xs text-violet-500 font-medium">{event.asset.name}</span>
                                )}
                                {event.actor && (
                                  <span className="text-xs text-gray-400">by {event.actor.name}</span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{formatTimeAgo(event.created_at)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
