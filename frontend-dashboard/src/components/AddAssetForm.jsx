import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../utils/api';
import CustomDropdown from './CustomDropdown';

/* ─────────────────────────────────────────────────────────────────────────
 * CategoryDropdown
 * Uses a React Portal to render the list at document.body level so it is
 * NEVER clipped by overflow:hidden / scrollable parents or fixed headers.
 * Position is computed from the trigger's bounding rect.
 * ───────────────────────────────────────────────────────────────────────── */
function CategoryDropdown({ categories, value, onChange, required }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, direction: 'down' });

  const triggerRef = useRef(null);
  const listRef = useRef(null);

  const selected = categories.find(c => c.name === value);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  /* Compute dropdown position using trigger's bounding rect */
  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const listHeight = Math.min(filtered.length * 44 + 56, 300); // 44px per item + search
    const direction = spaceBelow < listHeight && rect.top > listHeight ? 'up' : 'down';

    setPosition({
      top: direction === 'down' ? rect.bottom + 4 : rect.top - listHeight - 4,
      left: rect.left,
      width: rect.width,
      direction,
    });
  }, [filtered.length]);

  const handleOpen = () => {
    computePosition();
    setOpen(true);
    setSearch('');
  };

  /* Recompute on scroll/resize while open */
  useEffect(() => {
    if (!open) return;
    const update = () => computePosition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, computePosition]);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        listRef.current && !listRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectItem = (cat) => {
    onChange(cat.name);
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      {/* Trigger button — looks like a native select */}
      <button
        type="button"
        ref={triggerRef}
        onClick={handleOpen}
        className={`form-input w-full text-left flex items-center justify-between gap-2 cursor-pointer
          ${!value ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              <span className="text-lg shrink-0">{selected.icon}</span>
              <span className="font-medium">{selected.name}</span>
              {selected.description && (
                <span className="text-xs text-gray-400 truncate hidden sm:inline">— {selected.description}</span>
              )}
            </>
          ) : (
            <span>— Select a category —</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 shrink-0 fill-current text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>

      {/* Hidden native input for form validation */}
      <input type="hidden" name="category" value={value} required={required} />

      {/* Portal list */}
      {open && createPortal(
        <div
          ref={listRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: position.width,
            zIndex: 9999,
          }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Search box */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400 fill-current" viewBox="0 0 20 20">
                <path d="M12.9 14.32a8 8 0 111.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 108 2a6 6 0 000 12z"/>
              </svg>
              <input
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg
                  text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="Search categories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* List */}
          <ul
            className="overflow-y-auto"
            style={{ maxHeight: 256 }}
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">No categories found</li>
            ) : (
              filtered.map(cat => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => selectItem(cat)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors group
                      ${cat.name === value ? 'bg-violet-50 dark:bg-violet-900/20' : ''}`}
                  >
                    <span className="text-xl shrink-0">{cat.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${cat.name === value ? 'text-violet-700 dark:text-violet-400' : 'text-gray-800 dark:text-gray-100'}`}>
                        {cat.name}
                      </p>
                      {cat.description && (
                        <p className="text-xs text-gray-400 truncate">{cat.description}</p>
                      )}
                    </div>
                    {cat.name === value && (
                      <svg className="w-4 h-4 text-violet-600 fill-current shrink-0" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * AddAssetForm
 * ───────────────────────────────────────────────────────────────────────── */
function AddAssetForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    location: '',
    status: 'Operational',
    condition: 'Good',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/categories').then(res => {
      if (res.success && res.data?.categories) setCategories(res.data.categories);
    });
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/assets', formData);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || 'Failed to add asset');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="add-asset-form" onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700/60">
      <div className="space-y-5 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Asset Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name" name="name" className="form-input w-full" type="text" required
              value={formData.name} onChange={handleChange} placeholder="e.g. Water Chiller 04"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="code">
              Asset Code <span className="text-red-500">*</span>
            </label>
            <input
              id="code" name="code" className="form-input w-full" type="text" required
              value={formData.code} onChange={handleChange} placeholder="e.g. CHILL-04"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <CategoryDropdown
              categories={categories}
              value={formData.category}
              onChange={(val) => setFormData(f => ({ ...f, category: val }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="location">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location" name="location" className="form-input w-full" type="text" required
              value={formData.location} onChange={handleChange} placeholder="e.g. Roof Deck B"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="status">Status</label>
            <CustomDropdown
              options={['Operational', 'Issue Reported', 'Under Inspection', 'Under Maintenance', 'Out of Service', 'Retired']}
              value={formData.status}
              onChange={(val) => setFormData(f => ({ ...f, status: val }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="condition">Condition</label>
            <CustomDropdown
              options={['Good', 'Fair', 'Poor', 'Critical']}
              value={formData.condition}
              onChange={(val) => setFormData(f => ({ ...f, condition: val }))}
            />
          </div>
        </div>

        {/* Hidden submit triggered by external "Save Asset" button (form="add-asset-form") */}
        <button type="submit" className="hidden" disabled={loading} />
      </div>
    </form>
  );
}

export default AddAssetForm;
