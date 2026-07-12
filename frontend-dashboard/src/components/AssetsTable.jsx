import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import CustomDropdown from './CustomDropdown';

function AssetsTable({ onRefresh }) {
  const { profile } = useAuth();
  const userRole = profile?.role || 'worker';

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');

  // QR panel state
  const [qrAsset, setQrAsset] = useState(null);
  const printRef = useRef();

  // Edit panel state
  const [editAsset, setEditAsset] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      let url = '/api/assets';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (conditionFilter) params.append('condition', conditionFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.success && res.data?.assets) {
        setAssets(res.data.assets);
      } else {
        setError(res.message || 'Failed to fetch assets');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [statusFilter, conditionFilter]);

  // ── QR ──────────────────────────────────────────────
  const handlePrint = () => {
    const printContent = printRef.current;
    const win = window.open('', '', 'width=600,height=600');
    win.document.write(`
      <html>
        <head>
          <title>Print QR Label</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; }
            .label-container { border: 2px dashed #ccc; padding: 20px; display: inline-block; }
            h2 { margin: 0 0 10px 0; } p { margin: 0 0 20px 0; color: #555; }
          </style>
        </head>
        <body>
          <div class="label-container">
            <h2>${qrAsset?.name}</h2>
            <p>${qrAsset?.code} — ${qrAsset?.location}</p>
            ${printContent.innerHTML}
            <p style="margin-top:15px;font-size:12px;">Scan to report issues</p>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const copyLink = (assetId) => {
    navigator.clipboard.writeText(`${window.location.origin}/public/asset/${assetId}`);
    alert('Public link copied to clipboard!');
  };

  // ── Edit ─────────────────────────────────────────────
  const openEdit = (asset) => {
    setEditAsset(asset);
    setEditForm({
      name: asset.name || '',
      code: asset.code || '',
      category: asset.category || '',
      location: asset.location || '',
      status: asset.status || '',
      condition: asset.condition || '',
    });
    setEditError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await api.put(`/api/assets/${editAsset.id}`, editForm);
      if (res.success) {
        setEditAsset(null);
        fetchAssets();
      } else {
        setEditError(res.message || 'Failed to update asset');
      }
    } catch (err) {
      setEditError(err.message || 'An error occurred');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/api/assets/${deleteId}`);
      if (res.success) {
        setDeleteId(null);
        fetchAssets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="col-span-full xl:col-span-12 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      {/* Header */}
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Assets</h2>
        <div className="flex gap-2 items-center">
          <CustomDropdown
            className="w-44"
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Operational', label: 'Operational' },
              { value: 'Issue Reported', label: 'Issue Reported' },
              { value: 'Under Inspection', label: 'Under Inspection' },
              { value: 'Under Maintenance', label: 'Under Maintenance' },
              { value: 'Out of Service', label: 'Out of Service' },
              { value: 'Retired', label: 'Retired' }
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <CustomDropdown
            className="w-44"
            options={[
              { value: '', label: 'All Conditions' },
              { value: 'Good', label: 'Good' },
              { value: 'Fair', label: 'Fair' },
              { value: 'Poor', label: 'Poor' },
              { value: 'Critical', label: 'Critical' }
            ]}
            value={conditionFilter}
            onChange={setConditionFilter}
          />
        </div>
      </header>

      <div className="p-3">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading assets...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : assets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No assets found. Add one to get started.</div>
          ) : (
            <table className="table-auto w-full dark:text-gray-300">
              <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 rounded-xs">
                <tr>
                  <th className="p-2"><div className="font-semibold text-left">Code</div></th>
                  <th className="p-2"><div className="font-semibold text-left">Name</div></th>
                  <th className="p-2"><div className="font-semibold text-left">Category</div></th>
                  <th className="p-2"><div className="font-semibold text-left">Location</div></th>
                  <th className="p-2"><div className="font-semibold text-left">Status</div></th>
                  <th className="p-2"><div className="font-semibold text-left">Condition</div></th>
                  <th className="p-2"><div className="font-semibold text-center">Actions</div></th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium divide-y divide-gray-100 dark:divide-gray-700/60">
                {assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-2">
                      <Link to={`/assets/${asset.id}`} className="text-violet-500 hover:text-violet-600 font-semibold underline">
                        {asset.code}
                      </Link>
                    </td>
                    <td className="p-2"><div className="text-gray-800 dark:text-gray-100">{asset.name}</div></td>
                    <td className="p-2"><div className="text-gray-800 dark:text-gray-100">{asset.category}</div></td>
                    <td className="p-2"><div className="text-gray-800 dark:text-gray-100">{asset.location}</div></td>
                    <td className="p-2">
                      <div className={`text-xs inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${
                        asset.status === 'Operational' ? 'bg-green-100 text-green-700' :
                        asset.status === 'Out of Service' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{asset.status}</div>
                    </td>
                    <td className="p-2">
                      <div className={`text-xs inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${
                        asset.condition === 'Good' ? 'bg-green-100 text-green-700' :
                        asset.condition === 'Poor' || asset.condition === 'Critical' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{asset.condition}</div>
                    </td>
                    {/* ── Actions Column ── */}
                    <td className="p-2">
                      <div className="flex items-center justify-center gap-1">
                        {/* QR Button */}
                        <button
                          onClick={() => setQrAsset(asset)}
                          title="Show QR Code"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
                          </svg>
                        </button>

                        {/* Edit Button (admin only) */}
                        {isAdmin && (
                          <button
                            onClick={() => openEdit(asset)}
                            title="Edit Asset"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        )}

                        {/* Delete Button (admin only) */}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteId(asset.id)}
                            title="Delete Asset"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
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

      {/* ── QR Modal ──────────────────────────────────────── */}
      {qrAsset && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setQrAsset(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{qrAsset.name}</h3>
                  <p className="text-gray-500 text-sm">{qrAsset.code} · {qrAsset.location}</p>
                </div>
                <button onClick={() => setQrAsset(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                </button>
              </div>
              <div className="flex justify-center mb-5">
                <div ref={printRef} className="bg-white p-4 rounded-xl shadow-inner border border-gray-100">
                  <QRCodeSVG value={`${window.location.origin}/public/asset/${qrAsset.id}`} size={160} level="H" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="btn flex-1 bg-violet-600 text-white hover:bg-violet-700 text-sm">
                  🖨 Print Label
                </button>
                <button onClick={() => copyLink(qrAsset.id)} className="btn flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 text-sm">
                  🔗 Copy Link
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Edit Modal ────────────────────────────────────── */}
      {editAsset && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setEditAsset(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Edit Asset</h3>
                <button onClick={() => setEditAsset(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                </button>
              </div>
              {editError && <div className="text-red-500 text-sm mb-3">{editError}</div>}
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input className="form-input w-full" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Code</label>
                    <input className="form-input w-full" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <input className="form-input w-full" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input className="form-input w-full" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <CustomDropdown
                      options={['Operational', 'Issue Reported', 'Under Inspection', 'Under Maintenance', 'Out of Service', 'Retired']}
                      value={editForm.status}
                      onChange={val => setEditForm({...editForm, status: val})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Condition</label>
                    <CustomDropdown
                      options={['Good', 'Fair', 'Poor', 'Critical']}
                      value={editForm.condition}
                      onChange={val => setEditForm({...editForm, condition: val})}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2 justify-end">
                  <button type="button" onClick={() => setEditAsset(null)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                  <button type="submit" disabled={editLoading} className="btn bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
                    {editLoading ? 'Saving...' : 'Save Changes'}
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
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Delete Asset?</h3>
              <p className="text-gray-500 text-sm mb-6">This action cannot be undone. The asset and all its history will be permanently removed.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteId(null)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                <button onClick={handleDelete} disabled={deleteLoading} className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
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

export default AssetsTable;
