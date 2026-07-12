import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';

function MaintenanceRecords() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail modal
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/maintenance');
      if (res.success && res.data?.records) {
        setRecords(res.data.records);
      } else {
        setRecords([]);
        if (!res.success) setError(res.message || 'Failed to fetch maintenance records');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const totalCost = records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
  const totalTime = records.reduce((sum, r) => sum + (Number(r.time_spent) || 0), 0);

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
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Maintenance Records</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete log of all repair and maintenance work</p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-4">
                <div className="text-xs text-gray-500 uppercase font-medium">Total Records</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{records.length}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-4">
                <div className="text-xs text-gray-500 uppercase font-medium">Total Expenditure</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60 p-4">
                <div className="text-xs text-gray-500 uppercase font-medium">Total Time Spent</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{totalTime.toLocaleString()} hrs</div>
              </div>
            </div>

            {/* Records Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60">
              <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">All Maintenance Logs</h2>
              </header>
              <div className="p-3">
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading maintenance records...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                  ) : records.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p>No maintenance records logged yet.</p>
                    </div>
                  ) : (
                    <table className="table-auto w-full dark:text-gray-300">
                      <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 rounded-xs">
                        <tr>
                          <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Date</div></th>
                          <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Asset</div></th>
                          <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Issue</div></th>
                          <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Technician</div></th>
                          <th className="p-2 whitespace-nowrap"><div className="font-semibold text-left">Work Performed</div></th>
                          <th className="p-2 whitespace-nowrap"><div className="font-semibold text-right">Cost</div></th>
                          <th className="p-2 whitespace-nowrap"><div className="font-semibold text-right">Time</div></th>
                          <th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">Details</div></th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-medium divide-y divide-gray-100 dark:divide-gray-700/60">
                        {records.map(record => (
                          <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="p-2 whitespace-nowrap">
                              <div className="text-gray-500">{new Date(record.created_at).toLocaleDateString()}</div>
                            </td>
                            <td className="p-2 whitespace-nowrap">
                              <div className="text-gray-800 dark:text-gray-100">{record.asset?.name || 'N/A'}</div>
                              <div className="text-xs text-gray-400">{record.asset?.code || ''}</div>
                            </td>
                            <td className="p-2 whitespace-nowrap">
                              <div className="text-violet-500 font-semibold text-xs">{record.issue?.issue_number || 'N/A'}</div>
                            </td>
                            <td className="p-2 whitespace-nowrap">
                              <div className="text-gray-800 dark:text-gray-100">{record.technician?.name || 'N/A'}</div>
                            </td>
                            <td className="p-2">
                              <div className="text-gray-800 dark:text-gray-100 truncate max-w-xs">{record.work_performed || record.inspection_notes}</div>
                            </td>
                            <td className="p-2 whitespace-nowrap text-right">
                              <div className="font-semibold text-emerald-600">${Number(record.cost || 0).toFixed(2)}</div>
                            </td>
                            <td className="p-2 whitespace-nowrap text-right">
                              <div className="text-gray-600 dark:text-gray-400">{record.time_spent || 0}h</div>
                            </td>
                            <td className="p-2 whitespace-nowrap text-center">
                              <button
                                onClick={() => setSelectedRecord(record)}
                                className="p-1 rounded text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Detail Modal ────────────────────────────── */}
      {selectedRecord && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setSelectedRecord(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Maintenance Details</h3>
                <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                </button>
              </div>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 block mb-0.5">Asset</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{selectedRecord.asset?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Issue</span>
                    <span className="font-medium text-violet-500">{selectedRecord.issue?.issue_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Technician</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{selectedRecord.technician?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Date</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{new Date(selectedRecord.created_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Cost</span>
                    <span className="font-semibold text-emerald-600">${Number(selectedRecord.cost || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Time Spent</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{selectedRecord.time_spent || 0} hours</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Inspection Notes</span>
                  <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">{selectedRecord.inspection_notes || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Work Performed</span>
                  <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">{selectedRecord.work_performed || '—'}</p>
                </div>
                {selectedRecord.parts_replaced && (
                  <div>
                    <span className="text-gray-500 block mb-1">Parts Replaced</span>
                    <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">{selectedRecord.parts_replaced}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-5">
                <button onClick={() => setSelectedRecord(null)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Close</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MaintenanceRecords;
