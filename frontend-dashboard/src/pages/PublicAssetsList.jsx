import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { QRCodeSVG } from 'qrcode.react';
import Header from '../components/landing/ui/header';
import Footer from '../components/landing/ui/footer';

function PublicAssetsList({ isDashboardMode = false }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [qrAsset, setQrAsset] = useState(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/assets');
      if (res.success) {
        setAssets(res.data.assets || []);
      } else {
        setError(res.message || 'Failed to fetch assets');
      }
    } catch (err) {
      setError('An error occurred while fetching the assets.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/public/asset/${id}`);
    alert('Link copied to clipboard!');
  };

  return (
    <div className={`flex flex-col ${isDashboardMode ? 'w-full' : 'min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip bg-gray-50 text-gray-900 font-sans'}`}>
      {!isDashboardMode && (
        <Header 
          isPublicRoute={true} 
          searchBar={
            <div className="flex-1 max-w-xs relative ml-2 sm:ml-6">
              <input
                type="text"
                placeholder="Search by name, code, or category..."
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-violet-500 focus:border-violet-500 p-1.5 pl-8 text-xs sm:text-sm text-gray-100 placeholder-gray-400 transition-colors shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          }
        />
      )}

      <main className={`grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col gap-8 ${isDashboardMode ? 'pt-8' : 'pt-28 md:pt-36 lg:pt-40'}`}>
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-violet-100/50 border border-violet-50 p-6 md:p-8 transform transition-all duration-300">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Public Asset Directory</h2>
          <p className="text-base text-gray-500">Find an asset to view details or report an issue.</p>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full shadow-lg"></div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center text-red-700 shadow-sm">
            <h3 className="font-bold text-xl mb-2">Oops!</h3>
            <p>{error}</p>
            <button onClick={fetchAssets} className="mt-4 bg-white border border-red-200 px-6 py-2 rounded-xl hover:bg-red-100 font-semibold transition-colors">Try Again</button>
          </div>
        )}

        {/* Asset Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredAssets.length > 0 ? (
              filteredAssets.map(asset => (
                <div key={asset.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col group">
                  
                  {/* Card Header (Gradient & Status) */}
                  <div className={`p-6 text-white relative overflow-hidden ${
                    asset.status === 'Operational' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-rose-500 to-red-600'
                  }`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10 flex justify-between items-start mb-2">
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-white/20">
                        {asset.status}
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-white/20">
                        {asset.status === 'Operational' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-extrabold relative z-10 drop-shadow-sm leading-tight truncate">{asset.name}</h3>
                    <p className="text-white/80 font-mono text-sm relative z-10 truncate mt-1">{asset.code}</p>
                  </div>

                  {/* Card Body (Details) */}
                  <div className="p-6 flex-1 flex flex-col justify-between bg-white/70 backdrop-blur-md">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Location</span>
                        <span className="font-semibold text-gray-800 text-sm">{asset.location}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Category</span>
                        <span className="font-semibold text-gray-800 text-sm">{asset.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Condition</span>
                        <span className="font-semibold text-gray-800 text-sm">{asset.condition}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        to={`/public/asset/${asset.id}`}
                        className="flex-1 bg-gray-50 text-violet-600 border border-violet-100 font-bold py-3 rounded-xl hover:bg-violet-600 hover:text-white transition-all shadow-sm hover:shadow-md text-center group-hover:bg-violet-50"
                      >
                        View &amp; Report
                      </Link>
                      <button
                        onClick={() => setQrAsset(asset)}
                        className="p-3 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl hover:bg-gray-200 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                        title="Show QR Code"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                      </button>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Assets Found</h3>
                <p className="text-gray-500">We couldn't find any assets matching your search criteria.</p>
              </div>
            )}
          </div>
        )}
        
        {/* QR Modal */}
        {qrAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setQrAsset(null)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-10 transform transition-all p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{qrAsset.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{qrAsset.code} · {qrAsset.location || 'No Location'}</p>
                </div>
                <button onClick={() => setQrAsset(null)} className="text-gray-400 hover:text-gray-600 p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex justify-center bg-gray-50 p-6 rounded-2xl mb-5 border border-gray-100">
                <QRCodeSVG value={`${window.location.origin}/public/asset/${qrAsset.id}`} size={180} level="H" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => copyLink(qrAsset.id)} className="flex-1 bg-gray-50 text-gray-700 border border-gray-200 font-bold py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm">
                  Copy Link
                </button>
                <Link to={`/public/asset/${qrAsset.id}`} className="flex-1 bg-violet-600 text-white font-bold py-2.5 rounded-xl hover:bg-violet-700 transition-colors text-sm text-center flex items-center justify-center">
                  View Asset
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      {!isDashboardMode && <Footer border={true} />}
    </div>
  );
}

export default PublicAssetsList;
