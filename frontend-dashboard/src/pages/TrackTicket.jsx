import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

function TrackTicket() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  
  const [searchInput, setSearchInput] = useState(ticketId || '');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ticketId) {
      fetchTicket(ticketId);
    }
  }, [ticketId]);

  const fetchTicket = async (id) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    setTicket(null);

    try {
      const res = await api.get(`/api/issues/track/${id}`);
      if (res.success && res.data?.ticket) {
        setTicket(res.data.ticket);
      } else {
        setError('Ticket not found. Please check the ID and try again.');
      }
    } catch (err) {
      setError('Could not fetch ticket details. It might not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track/${searchInput.trim()}`);
    }
  };

  // Status badge coloring
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Reported':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">Reported</span>;
      case 'Assigned':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Assigned</span>;
      case 'Inspection Started':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">Inspection Started</span>;
      case 'Resolved':
      case 'Closed':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Resolved</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-5 text-center shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 tracking-tight">
          MaintainIQ
        </h1>
      </header>
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 mt-4 md:mt-8">
        {/* Search Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-violet-100/50 border border-violet-50 p-6 md:p-8 transform transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Track Your Ticket</h2>
          <p className="text-base text-gray-500 mb-6">Enter your Ticket ID below to check the real-time status of your reported issue.</p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. TICKET-123456"
              className="flex-1 border-gray-200 bg-gray-50 rounded-2xl focus:ring-violet-500 focus:border-violet-500 p-4 text-base transition-colors"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold px-8 py-4 sm:py-0 rounded-2xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Searching...
                </>
              ) : 'Search'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {ticket && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-br from-white to-gray-50">
              <div>
                <p className="text-sm font-mono text-violet-500 font-semibold mb-1">{ticket.issue_number}</p>
                <h3 className="font-extrabold text-2xl text-gray-800">{ticket.title}</h3>
              </div>
              <div className="self-start sm:self-center scale-110 origin-left sm:origin-center">
                {getStatusBadge(ticket.status)}
              </div>
            </div>
            
            <div className="p-6 md:p-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-base">
                <div className="flex flex-col border-b border-gray-100 md:border-0 pb-4 md:pb-0">
                  <span className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Asset Info</span>
                  <span className="font-semibold text-gray-800 text-lg">
                    {ticket.asset?.name || 'Unknown Asset'}
                  </span>
                  {ticket.asset?.location && (
                    <span className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {ticket.asset.location}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col border-b border-gray-100 md:border-0 pb-4 md:pb-0">
                  <span className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Category</span>
                  <span className="font-semibold text-gray-800 text-lg">{ticket.category}</span>
                </div>
                
                <div className="flex flex-col border-b border-gray-100 md:border-0 pb-4 md:pb-0">
                  <span className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Priority</span>
                  <span className={`font-semibold text-lg ${ticket.priority === 'Critical' ? 'text-red-600' : ticket.priority === 'High' ? 'text-orange-500' : 'text-gray-800'}`}>
                    {ticket.priority}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-1">Reported On</span>
                  <span className="font-semibold text-gray-800 text-lg">
                    {new Date(ticket.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TrackTicket;
