import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', icon: '📦' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  // Edit
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await api.get('/api/categories');
    if (res.success) setCategories(res.data.categories);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  // ── Add ─────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);

    const categoryName = addForm.name.trim();
    if (!categoryName) return;

    // Create optimistic category object
    const tempId = `temp-${Date.now()}`;
    const newCategory = {
      id: tempId,
      name: categoryName,
      description: addForm.description,
      icon: addForm.icon || '📦',
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    // Save previous state for rollback
    const previousCategories = [...categories];

    // Optimistically update UI (sorted alphabetically)
    const optimisticallyUpdated = [...previousCategories, newCategory].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    setCategories(optimisticallyUpdated);

    // Reset form and hide add panel instantly
    setAddForm({ name: '', description: '', icon: '📦' });
    setShowAdd(false);

    try {
      const res = await api.post('/api/categories', {
        name: categoryName,
        description: addForm.description,
        icon: addForm.icon
      });

      if (res.success && res.data?.category) {
        // Swap temp item with actual server item
        setCategories(prev =>
          prev.map(cat => cat.id === tempId ? res.data.category : cat)
        );
      } else {
        // Rollback
        setCategories(previousCategories);
        setAddError(res.message || 'Failed to create category');
        setShowAdd(true); // Open the form again so they can retry
        setAddForm({ name: categoryName, description: addForm.description, icon: addForm.icon || '📦' });
      }
    } catch (err) {
      // Rollback
      setCategories(previousCategories);
      setAddError(err.message || 'An error occurred while creating category');
      setShowAdd(true);
      setAddForm({ name: categoryName, description: addForm.description, icon: addForm.icon || '📦' });
    } finally {
      setAddLoading(false);
    }
  };

  // ── Edit ─────────────────────────────────────────
  const openEdit = (cat) => {
    setEditItem(cat);
    setEditForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '📦' });
    setEditError(null);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    const res = await api.put(`/api/categories/${editItem.id}`, editForm);
    if (res.success) {
      setEditItem(null);
      fetchCategories();
    } else {
      setEditError(res.message || 'Failed to update category');
    }
    setEditLoading(false);
  };

  // ── Delete ───────────────────────────────────────
  const handleDelete = async () => {
    setDeleteLoading(true);
    await api.delete(`/api/categories/${deleteId}`);
    setDeleteId(null);
    setDeleteLoading(false);
    fetchCategories();
  };

  return (
    <div className="col-span-full xl:col-span-12 bg-white dark:bg-gray-800 shadow-xs rounded-xl border border-gray-200 dark:border-gray-700/60">
      {/* Header */}
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Asset Categories</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage the categories used when registering assets</p>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setAddError(null); }}
          className="btn bg-violet-600 text-white hover:bg-violet-700 text-sm shadow-sm"
        >
          <svg className="w-4 h-4 fill-current opacity-50 shrink-0 mr-1" viewBox="0 0 16 16">
            <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
          </svg>
          Add Category
        </button>
      </header>

      {/* Inline Add Form */}
      {showAdd && (
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 bg-violet-50 dark:bg-violet-900/10">
          <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Icon (emoji)</label>
              <input
                className="form-input w-16 text-center text-xl"
                value={addForm.icon}
                onChange={e => setAddForm({ ...addForm, icon: e.target.value })}
                maxLength={4}
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Category Name *</label>
              <input
                className="form-input w-full"
                placeholder="e.g. HVAC"
                value={addForm.name}
                onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
            </div>
            <div className="flex-[2] min-w-[200px]">
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Description</label>
              <input
                className="form-input w-full"
                placeholder="Short description (optional)"
                value={addForm.description}
                onChange={e => setAddForm({ ...addForm, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">Cancel</button>
              <button type="submit" disabled={addLoading} className="btn bg-violet-600 text-white hover:bg-violet-700 text-sm disabled:opacity-50">
                {addLoading ? 'Adding...' : 'Add'}
              </button>
            </div>
            {addError && <p className="w-full text-red-500 text-sm mt-1">{addError}</p>}
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="p-5">
        {loading && categories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No categories yet. Add one above.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`flex items-center justify-between gap-2 p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 hover:border-violet-200 dark:hover:border-violet-700 transition-colors group ${
                  cat.isOptimistic ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0">{cat.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-400 truncate">{cat.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    title="Edit"
                    className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    title="Delete"
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit Modal ────────────────────────────── */}
      {editItem && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setEditItem(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Edit Category</h3>
                <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                </button>
              </div>
              {editError && <p className="text-red-500 text-sm mb-3">{editError}</p>}
              <form onSubmit={handleEdit} className="space-y-3">
                <div className="flex gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Icon</label>
                    <input className="form-input w-16 text-center text-xl" value={editForm.icon} onChange={e => setEditForm({...editForm, icon: e.target.value})} maxLength={4} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input className="form-input w-full" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input className="form-input w-full" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Short description" />
                </div>
                <div className="flex gap-2 pt-2 justify-end">
                  <button type="button" onClick={() => setEditItem(null)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">Cancel</button>
                  <button type="submit" disabled={editLoading} className="btn bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirm ───────────────────────── */}
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
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Delete Category?</h3>
              <p className="text-gray-500 text-sm mb-6">This will permanently remove this category. Existing assets using it won't be affected.</p>
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

export default CategoriesManager;
