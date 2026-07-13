import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Transition from '../utils/Transition';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const AVAILABLE_PAGES = [
  { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'technician', 'worker', 'client', 'reporter', 'student', 'teacher'] },
  { name: 'Report Issue', path: '/report-issue', roles: ['client', 'reporter', 'worker', 'student', 'teacher'] },
  { name: 'Assets', path: '/assets', roles: ['admin', 'technician', 'worker', 'teacher'] },
  { name: 'Issues', path: '/issues', roles: ['admin', 'technician', 'worker', 'teacher'] },
  { name: 'My Work (Technician Console)', path: '/technician', roles: ['technician', 'worker'] },
  { name: 'Analytics', path: '/analytics', roles: ['admin', 'technician', 'worker', 'teacher'] },
  { name: 'Maintenance', path: '/maintenance', roles: ['admin', 'technician', 'worker', 'teacher'] },
  { name: 'Settings', path: '/settings', roles: ['admin', 'technician', 'worker', 'client', 'reporter', 'student', 'teacher'] },
];

function ModalSearch({ id, searchId, modalOpen, setModalOpen }) {
  const modalContent = useRef(null);
  const searchInput = useRef(null);
  const { user, profile } = useAuth();
  
  const rawRole = profile?.role || user?.role || user?.user_metadata?.role || 'reporter';
  const isEncrypted = rawRole && rawRole.length > 20;
  const userRole = isEncrypted ? (user?.user_metadata?.role || 'reporter') : rawRole;

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ assets: [], issues: [], profiles: [] });
  const [pageResults, setPageResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [qrAsset, setQrAsset] = useState(null);
  const printRef = useRef();

  const handlePrint = (e) => {
    if (e) e.stopPropagation();
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
            <p>${qrAsset?.code} — ${qrAsset?.location || 'No Location'}</p>
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

  const copyLink = (assetId, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/public/asset/${assetId}`);
    alert('Public link copied to clipboard!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // close on click outside
  useEffect(() => {
    const clickHandler = (e) => {
      // Don't close if clicking inside the QR modal
      if (qrAsset) return;
      if (!modalOpen || modalContent.current.contains(e.target)) return;
      setModalOpen(false);
    };
    document.addEventListener('click', clickHandler, true);
    return () => document.removeEventListener('click', clickHandler, true);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!modalOpen || keyCode !== 27) return;
      setModalOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    modalOpen && searchInput.current.focus();
  }, [modalOpen]);

  // Handle local page filtering synchronously
  useEffect(() => {
    if (!searchTerm.trim()) {
      setPageResults([]);
      return;
    }
    const lowerQuery = searchTerm.toLowerCase();
    const matchedPages = AVAILABLE_PAGES.filter(page => {
      // 1. Must be allowed for the user's role
      const isAllowed = page.roles.includes(userRole);
      // 2. Name must match query
      const matchesName = page.name.toLowerCase().includes(lowerQuery);
      return isAllowed && matchesName;
    });
    setPageResults(matchedPages);
  }, [searchTerm, userRole]);

  // Debounced database search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults({ assets: [], issues: [], profiles: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const hasResults = pageResults.length > 0 || results.assets.length > 0 || results.issues.length > 0 || results.profiles.length > 0;

  return (
    <>
      <Transition
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 transition-opacity"
        show={modalOpen}
        enter="transition ease-out duration-200"
        enterStart="opacity-0"
        enterEnd="opacity-100"
        leave="transition ease-out duration-100"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
        aria-hidden="true"
      />
      <Transition
        id={id}
        className="fixed inset-0 z-50 overflow-hidden flex items-start top-20 mb-4 justify-center px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
        show={modalOpen}
        enter="transition ease-in-out duration-200"
        enterStart="opacity-0 translate-y-4"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-in-out duration-200"
        leaveStart="opacity-100 translate-y-0"
        leaveEnd="opacity-0 translate-y-4"
      >
        <div
          ref={modalContent}
          className="bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700/60 overflow-hidden max-w-2xl w-full max-h-full flex flex-col rounded-lg shadow-lg"
        >
          <form className="border-b border-gray-200 dark:border-gray-700/60 shrink-0">
            <div className="relative">
              <label htmlFor={searchId} className="sr-only">
                Search
              </label>
              <input
                id={searchId}
                className="w-full dark:text-gray-300 bg-white dark:bg-gray-800 border-0 focus:ring-transparent placeholder-gray-400 dark:placeholder-gray-500 appearance-none py-3 pl-10 pr-4"
                type="search"
                placeholder="Search Pages, Assets, Issues, or Users…"
                ref={searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-0 right-auto flex items-center ml-4 mr-2">
                {loading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full"></div>
                ) : (
                  <svg
                    className="shrink-0 fill-current text-gray-400 dark:text-gray-500"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                    <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
                  </svg>
                )}
              </div>
            </div>
          </form>

          <div className="py-4 px-2 overflow-y-auto min-h-[300px]">
            {searchTerm.trim() === '' ? (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-12">
                Type something to start searching...
              </div>
            ) : hasResults ? (
              <div className="space-y-4">
                {pageResults.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2 mb-2">Pages 📄</div>
                    <ul className="text-sm">
                      {pageResults.map(page => (
                        <li key={`page-${page.path}`}>
                          <Link
                            className="flex items-center p-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/20 rounded-lg"
                            to={page.path}
                            onClick={() => setModalOpen(false)}
                          >
                            <span className="w-6 h-6 mr-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500 rounded flex items-center justify-center">
                              🔗
                            </span>
                            <div className="truncate">
                              <span className="font-medium">{page.name}</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.assets.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2 mb-2">Assets</div>
                    <ul className="text-sm">
                      {results.assets.map(asset => (
                        <li key={`asset-${asset.id}`}>
                          <Link
                            className="flex items-center justify-between p-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/20 rounded-lg group"
                            to={`/assets/${asset.id}`}
                            onClick={() => setModalOpen(false)}
                          >
                            <div className="flex items-center truncate">
                              <span className="w-6 h-6 mr-3 shrink-0 bg-violet-100 dark:bg-violet-500/20 text-violet-500 rounded flex items-center justify-center">
                                📦
                              </span>
                              <div className="truncate">
                                <span className="font-medium">{asset.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">#{asset.code}</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQrAsset(asset);
                              }}
                              title="Show QR Code"
                              className="p-1.5 shrink-0 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                                <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
                              </svg>
                            </button>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.issues.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2 mb-2">Issues</div>
                    <ul className="text-sm">
                      {results.issues.map(issue => (
                        <li key={`issue-${issue.id}`}>
                          <Link
                            className="flex items-center justify-between p-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/20 rounded-lg"
                            to={`/issues`}
                            onClick={() => setModalOpen(false)}
                          >
                            <div className="flex items-center truncate">
                              <span className="w-6 h-6 mr-3 shrink-0 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded flex items-center justify-center">
                                ⚠️
                              </span>
                              <div className="truncate">
                                <span className="font-medium">{issue.title}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({issue.status})</span>
                              </div>
                            </div>
                            {issue.created_at && (
                              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 ml-2">
                                {formatDate(issue.created_at)}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.profiles.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2 mb-2">Users</div>
                    <ul className="text-sm">
                      {results.profiles.map(profile => (
                        <li key={`profile-${profile.id}`}>
                          <div className="flex items-center p-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/20 rounded-lg cursor-default">
                            <span className="w-6 h-6 mr-3 bg-blue-100 dark:bg-blue-500/20 text-blue-500 rounded flex items-center justify-center">
                              👤
                            </span>
                            <div className="truncate">
                              <span className="font-medium">{profile.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{profile.email}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : !loading ? (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-12">
                No results found for "{searchTerm}"
              </div>
            ) : null}
          </div>
        </div>
      </Transition>

      {/* ── QR Modal ──────────────────────────────────────── */}
      {qrAsset && (
        <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={(e) => { e.stopPropagation(); setQrAsset(null); }}></div>
          <div className="fixed inset-0 z-[100] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{qrAsset.name}</h3>
                    <p className="text-gray-500 text-sm">{qrAsset.code} · {qrAsset.location || 'No Location'}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setQrAsset(null); }} className="text-gray-400 hover:text-gray-600 p-1">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                  </button>
                </div>
                <div className="flex justify-center mb-5">
                  <div ref={printRef} className="bg-white p-4 rounded-xl shadow-inner border border-gray-100">
                    <QRCodeSVG value={`${window.location.origin}/public/asset/${qrAsset.id}`} size={160} level="H" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handlePrint} className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 text-sm font-medium transition-colors">
                    🖨 Print Label
                  </button>
                  <button onClick={(e) => copyLink(qrAsset.id, e)} className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 text-sm font-medium transition-colors">
                    🔗 Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalSearch;
