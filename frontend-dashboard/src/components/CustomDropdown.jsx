import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/* ─────────────────────────────────────────────────────────────────────────
 * CustomDropdown
 * A premium portal-based select replacement to prevent clipping and layout
 * issues in scrollable containers.
 * ───────────────────────────────────────────────────────────────────────── */
function CustomDropdown({
  options = [], // Can be array of strings or array of { value, label, icon, description }
  value,
  onChange,
  placeholder = 'Select an option',
  required = false,
  searchable = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, direction: 'down' });

  const triggerRef = useRef(null);
  const listRef = useRef(null);

  // Normalize options to object format
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selected = normalizedOptions.find(o => o.value === value);

  const filtered = normalizedOptions.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const listHeight = Math.min(filtered.length * 40 + (searchable ? 56 : 10), 280);
    const direction = spaceBelow < listHeight && rect.top > listHeight ? 'up' : 'down';

    setPosition({
      top: direction === 'down' ? rect.bottom + 4 : rect.top - listHeight - 4,
      left: rect.left,
      width: rect.width,
      direction,
    });
  }, [filtered.length, searchable]);

  const handleOpen = () => {
    computePosition();
    setOpen(true);
    setSearch('');
  };

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

  const selectItem = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        ref={triggerRef}
        onClick={handleOpen}
        className={`form-input w-full text-left flex items-center justify-between gap-2 cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg px-3 py-2 text-sm
          ${!value ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              {selected.icon && <span className="text-base shrink-0">{selected.icon}</span>}
              <span className="font-medium">{selected.label}</span>
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 shrink-0 fill-current text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>

      {/* Hidden input for form constraint validation */}
      <input type="hidden" value={value || ''} required={required} />

      {/* Dropdown Portal */}
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
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden font-sans"
        >
          {/* Optional Search */}
          {searchable && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400 fill-current" viewBox="0 0 20 20">
                  <path d="M12.9 14.32a8 8 0 111.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 108 2a6 6 0 000 12z"/>
                </svg>
                <input
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg
                    text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <ul className="overflow-y-auto py-1" style={{ maxHeight: 224 }}>
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-center text-xs text-gray-400">No options found</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => selectItem(opt)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-left hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors text-xs
                      ${opt.value === value ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400' : 'text-gray-800 dark:text-gray-100'}`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="text-base shrink-0">{opt.icon}</span>}
                      <span className="font-medium truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="text-[10px] text-gray-400 truncate">— {opt.description}</span>
                      )}
                    </span>
                    {opt.value === value && (
                      <svg className="w-3.5 h-3.5 text-violet-600 fill-current shrink-0" viewBox="0 0 20 20">
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
    </div>
  );
}

export default CustomDropdown;
