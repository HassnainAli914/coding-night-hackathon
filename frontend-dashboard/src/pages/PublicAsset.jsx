import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';

function PublicAsset() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [issueDescription, setIssueDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");

  // AI Triage states
  const [triaging, setTriaging] = useState(false);
  const [triageResult, setTriageResult] = useState(null);

  // Editable triage fields
  const [editedTitle, setEditedTitle] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedPriority, setEditedPriority] = useState("");

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await api.get(`/api/assets`);
        if (res.success && res.data?.assets) {
          const found = res.data.assets.find(a => a.id === id);
          if (found) {
            setAsset(found);
          } else {
            setError("Asset not found. It may have been removed.");
          }
        }
      } catch (err) {
        setError("Failed to load asset details.");
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  // Step 1: Submit complaint to AI triage
  const handleTriage = async (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;

    setTriaging(true);
    try {
      const res = await api.post('/api/ai/triage', {
        complaint: issueDescription,
        asset_context: asset ? { name: asset.name, code: asset.code, category: asset.category, location: asset.location } : null,
      });

      if (res.success && res.data?.triage) {
        const t = res.data.triage;
        setTriageResult(t);
        setEditedTitle(t.title);
        setEditedCategory(t.category);
        setEditedPriority(t.priority);
      } else {
        // Fallback: still show form with defaults
        setTriageResult({
          title: 'Reported issue',
          category: asset?.category || 'General',
          priority: 'Medium',
          possible_causes: 'Unable to determine automatically',
          initial_checks: 'A technician will inspect the issue',
        });
        setEditedTitle('Reported issue');
        setEditedCategory(asset?.category || 'General');
        setEditedPriority('Medium');
      }
    } catch (err) {
      // On failure, provide fallback
      setTriageResult({
        title: 'Reported issue',
        category: asset?.category || 'General',
        priority: 'Medium',
        possible_causes: 'Unable to determine automatically',
        initial_checks: 'A technician will inspect the issue',
      });
      setEditedTitle('Reported issue');
      setEditedCategory(asset?.category || 'General');
      setEditedPriority('Medium');
    } finally {
      setTriaging(false);
    }
  };

  // Step 2: Confirm and submit the issue
  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/api/issues', {
        asset_id: id,
        title: editedTitle,
        description: issueDescription,
        category: editedCategory,
        priority: editedPriority,
        reporter_name: reporterName || 'Anonymous',
        reporter_email: reporterEmail || null,
      });

      if (res.success) {
        setSubmitted(true);
        setSubmittedTicket(res.data?.ticket);
      } else {
        alert(res.message || 'Failed to submit issue');
      }
    } catch (err) {
      alert('Failed to submit issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setSubmittedTicket(null);
    setTriageResult(null);
    setIssueDescription("");
    setReporterName("");
    setReporterEmail("");
    setEditedTitle("");
    setEditedCategory("");
    setEditedPriority("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-6 h-6 border-4 border-violet-500 border-t-transparent rounded-full"></div>
          <span className="text-gray-500">Loading asset...</span>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Asset</h1>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4 text-center">
        <h1 className="text-xl font-bold text-violet-600 tracking-tight">MaintainIQ</h1>
      </header>
      
      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col gap-6">
        
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center mt-6">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${asset.status === 'Operational' ? 'bg-green-100' : 'bg-red-100'}`}>
            {asset.status === 'Operational' ? (
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{asset.name}</h2>
          <p className="text-gray-500 font-mono mb-4">{asset.code}</p>
          
          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${asset.status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {asset.status}
          </div>
        </div>

        {/* Info List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Location</span>
            <span className="font-medium text-gray-800">{asset.location}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Category</span>
            <span className="font-medium text-gray-800">{asset.category}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Condition</span>
            <span className="font-medium text-gray-800">{asset.condition}</span>
          </div>
        </div>

        {/* ── Report Issue Flow ──────────────────────── */}
        {!submitted ? (
          <>
            {/* Step 1: Describe the issue */}
            {!triageResult ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
                <h3 className="font-bold text-gray-800 mb-2">Report an Issue</h3>
                <p className="text-sm text-gray-500 mb-4">Describe the problem below. Our AI will analyze it and suggest the right category and priority.</p>
                
                <form onSubmit={handleTriage}>
                  <textarea
                    className="w-full border-gray-200 rounded-xl focus:ring-violet-500 focus:border-violet-500 mb-3 p-3 text-sm"
                    rows="4"
                    placeholder="e.g. The AC is blowing hot air and making a rattling sound..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      className="w-full border-gray-200 rounded-xl focus:ring-violet-500 focus:border-violet-500 p-2.5 text-sm"
                      placeholder="Your name (optional)"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                    />
                    <input
                      type="email"
                      className="w-full border-gray-200 rounded-xl focus:ring-violet-500 focus:border-violet-500 p-2.5 text-sm"
                      placeholder="Email (optional)"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={triaging || !issueDescription.trim()}
                    className="w-full bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {triaging ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        AI is analyzing...
                      </>
                    ) : (
                      'Analyze & Continue'
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Step 2: AI Triage Preview — editable before submit */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">🤖</span>
                  </div>
                  <h3 className="font-bold text-gray-800">AI Triage Results</h3>
                </div>

                {/* Warning banner if critical */}
                {triageResult.warning && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
                    <strong>⚠️ Warning:</strong> {triageResult.warning}
                  </div>
                )}

                {/* AI analysis cards */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs uppercase font-medium">Possible Causes</span>
                    <p className="text-gray-700 mt-0.5">{triageResult.possible_causes}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase font-medium">Recommended Checks</span>
                    <p className="text-gray-700 mt-0.5">{triageResult.initial_checks}</p>
                  </div>
                </div>

                {/* Editable fields */}
                <form onSubmit={handleSubmitIssue} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Issue Title</label>
                    <input
                      type="text"
                      className="w-full border-gray-200 rounded-xl focus:ring-violet-500 focus:border-violet-500 p-2.5 text-sm"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                      <input
                        type="text"
                        className="w-full border-gray-200 rounded-xl focus:ring-violet-500 focus:border-violet-500 p-2.5 text-sm"
                        value={editedCategory}
                        onChange={(e) => setEditedCategory(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                      <select
                        className="w-full border-gray-200 rounded-xl focus:ring-violet-500 focus:border-violet-500 p-2.5 text-sm"
                        value={editedPriority}
                        onChange={(e) => setEditedPriority(e.target.value)}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setTriageResult(null)}
                      className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition text-sm"
                    >
                      ← Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 bg-violet-600 text-white font-semibold py-2.5 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition text-sm flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Submitting...
                        </>
                      ) : (
                        'Confirm & Submit'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          /* Step 3: Success */
          <div className="bg-green-50 rounded-2xl border border-green-200 p-6 text-center mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-green-800 mb-2">Report Submitted!</h3>
            {submittedTicket && (
              <p className="text-sm text-green-700 mb-1">
                Ticket: <span className="font-mono font-semibold">{submittedTicket.issue_number}</span>
              </p>
            )}
            <p className="text-sm text-green-700">Thank you. The maintenance team has been notified and a ticket has been generated.</p>
            <button 
              onClick={resetForm}
              className="mt-4 text-green-700 font-semibold text-sm underline"
            >
              Report another issue
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default PublicAsset;
