import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../utils/api';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { useAuth } from '../contexts/AuthContext';
import AssetHistoryTimeline from '../components/AssetHistoryTimeline';

function AssetDetails() {
  const { user, profile } = useAuth();
  const userRole = profile?.role || user?.user_metadata?.role || "worker";

  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const printRef = useRef();

  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await api.get(`/api/assets`);
        if (res.success && res.data?.assets) {
          const found = res.data.assets.find(a => a.id === id);
          if (found) {
            setAsset(found);
          } else {
            setError("Asset not found");
          }
        }
      } catch (err) {
        setError("Failed to load asset details");
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`/api/assets/${id}/history`);
      if (res.success && res.data?.history) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleHistory = () => {
    if (!showHistory && history.length === 0) {
      fetchHistory();
    }
    setShowHistory(!showHistory);
  };

  const publicUrl = `${window.location.origin}/public/asset/${id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    alert('Public link copied to clipboard!');
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowPrint = window.open('', '', 'width=600,height=600');
    windowPrint.document.write(`
      <html>
        <head>
          <title>Print QR Label</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; }
            .label-container { border: 2px dashed #ccc; padding: 20px; display: inline-block; }
            h2 { margin: 0 0 10px 0; }
            p { margin: 0 0 20px 0; color: #555; }
          </style>
        </head>
        <body>
          <div class="label-container">
            <h2>${asset?.name}</h2>
            <p>${asset?.code} - ${asset?.location}</p>
            ${printContent.innerHTML}
            <p style="margin-top: 15px; font-size: 12px;">Scan to report issues</p>
          </div>
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    windowPrint.print();
    windowPrint.close();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="grow p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/assets" className="text-violet-500 hover:text-violet-600 font-medium text-sm flex items-center">
                &larr; Back to Assets
              </Link>
            </div>

            {loading ? (
              <div className="text-center">Loading asset...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : asset && (
              <>
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row gap-8">
                  
                  {/* Details Section */}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{asset.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Code: {asset.code}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">Status</span>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${asset.status === 'Operational' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {asset.status}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">Condition</span>
                        <span className="inline-block text-gray-800 dark:text-gray-100 font-medium">{asset.condition}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">Category</span>
                        <span className="inline-block text-gray-800 dark:text-gray-100">{asset.category}</span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500 mb-1">Location</span>
                        <span className="inline-block text-gray-800 dark:text-gray-100">{asset.location}</span>
                      </div>
                    </div>
                    
                    <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Actions</h3>
                      <div className="flex gap-3">
                        {userRole === 'admin' && (
                          <button className="btn bg-gray-900 text-white hover:bg-gray-800">Edit Asset</button>
                        )}
                        <button 
                          onClick={toggleHistory}
                          className={`btn border ${showHistory ? 'bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-900/30 dark:border-violet-700 dark:text-violet-300' : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        >
                          {showHistory ? 'Hide History' : 'View History'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Public QR Label</h3>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6" ref={printRef}>
                      <QRCodeSVG value={publicUrl} size={150} level={"H"} />
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                      <button onClick={handlePrint} className="btn w-full bg-violet-500 text-white hover:bg-violet-600">
                        Print Label
                      </button>
                      <button onClick={copyLink} className="btn w-full bg-white border-gray-200 text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                        Copy Public Link
                      </button>
                    </div>
                  </div>

                </div>

                {/* History Timeline Section */}
                {showHistory && (
                  <div className="mt-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Asset History Timeline</h3>
                    <AssetHistoryTimeline history={history} loading={historyLoading} />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AssetDetails;
