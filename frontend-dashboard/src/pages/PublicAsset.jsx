import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

  const [missingAnswers, setMissingAnswers] = useState({});

  useEffect(() => {
    setMissingAnswers({});
  }, [triageResult]);

  const onAnswerChange = (question, val) => {
    setMissingAnswers(prev => ({ ...prev, [question]: val }));
  };

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await api.get(`/api/assets/${id}`);
        if (res.success && res.data?.asset) {
          setAsset(res.data.asset);
        } else {
          setError("Asset not found. It may have been removed.");
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
      const res = await api.post('/api/issues/analyze-draft', {
        title: `Draft Issue for ${asset ? asset.name : 'Asset'}`,
        description: issueDescription
      });

      if (res.success && res.data?.analysis) {
        const analysis = res.data.analysis;
        setTriageResult(analysis);
        setEditedTitle(analysis.title);
        setEditedCategory(analysis.category);
        setEditedPriority(analysis.priority);
      } else {
        // Fallback: still show form with defaults
        setTriageResult({
          title: 'Reported issue',
          description: issueDescription,
          category: asset?.category || 'General',
          priority: 'Medium',
          possible_solution: 'A technician will inspect the issue',
        });
        setEditedTitle('Reported issue');
        setEditedCategory(asset?.category || 'General');
        setEditedPriority('Medium');
      }
    } catch (err) {
      // On failure, provide fallback
      setTriageResult({
        title: 'Reported issue',
        description: issueDescription,
        category: asset?.category || 'General',
        priority: 'Medium',
        possible_solution: 'A technician will inspect the issue',
      });
      setEditedTitle('Reported issue');
      setEditedCategory(asset?.category || 'General');
      setEditedPriority('Medium');
    } finally {
      setTriaging(false);
    }
  };

  const handleReAnalyze = async () => {
    if (!issueDescription.trim()) return;

    setTriaging(true);
    try {
      let combinedDescription = issueDescription + '\n\nAdditional Details Provided:';
      for (const [question, answer] of Object.entries(missingAnswers)) {
        if (answer.trim()) {
          combinedDescription += `\n- ${question}: ${answer.trim()}`;
        }
      }

      const res = await api.post('/api/issues/analyze-draft', {
        title: `Draft Issue for ${asset ? asset.name : 'Asset'}`,
        description: combinedDescription
      });

      if (res.success && res.data?.analysis) {
        const analysis = res.data.analysis;
        setTriageResult(analysis);
        setIssueDescription(combinedDescription);
        setEditedTitle(analysis.title);
        setEditedCategory(analysis.category);
        setEditedPriority(analysis.priority);
      } else {
        alert("AI Re-Analysis failed. You can still submit the current draft.");
      }
    } catch (err) {
      alert("Failed to analyze draft again.");
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
        description: triageResult.description || issueDescription,
        category: editedCategory,
        priority: editedPriority,
        possible_solution: triageResult.possible_solution,
        skip_background_ai: true,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-5 text-center shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 tracking-tight">
          MaintainIQ
        </h1>
      </header>
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 md:mt-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Asset Details */}
          <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-24 lg:self-start">
            {/* Status Card */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl shadow-xl border border-violet-500/30 p-6 text-center text-white relative overflow-hidden transform transition-all hover:scale-[1.01]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full blur-xl -ml-10 -mb-10"></div>
              
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow-inner backdrop-blur-sm ${asset.status === 'Operational' ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'}`}>
                {asset.status === 'Operational' ? (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <h2 className="text-2xl font-extrabold mb-1 drop-shadow-md relative z-10">{asset.name}</h2>
              <p className="text-violet-200 font-mono mb-4 text-sm relative z-10 opacity-80">{asset.code}</p>
              
              <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold relative z-10 shadow-md ${asset.status === 'Operational' ? 'bg-green-500/20 text-green-100 border border-green-400/30' : 'bg-red-500/20 text-red-100 border border-red-400/30'}`}>
                {asset.status}
              </div>
            </div>

            {/* Info List */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg border border-white p-5 mt-4">
              <div className="flex justify-between py-2 border-b border-gray-100/50">
                <span className="text-gray-500 font-medium">Location</span>
                <span className="font-bold text-gray-800 text-right">{asset.location}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100/50">
                <span className="text-gray-500 font-medium">Category</span>
                <span className="font-bold text-gray-800 text-right">{asset.category}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 font-medium">Condition</span>
                <span className="font-bold text-gray-800 text-right">{asset.condition}</span>
              </div>
            </div>
          </div>
          
          {/* Right Column: Interactive Flow */}
          <div className="lg:col-span-7 flex flex-col">

        {/* ── Report Issue Flow ──────────────────────── */}
        {!submitted ? (
          <>
            {/* Step 1: Describe the issue */}
            {!triageResult ? (
              <div className="bg-white rounded-3xl shadow-xl shadow-violet-100/50 border border-violet-50 p-6 md:p-8 mb-8 transform transition-all duration-300">
                <h3 className="font-extrabold text-2xl text-gray-800 mb-2">Report an Issue</h3>
                <p className="text-base text-gray-500 mb-6">Describe the problem below. Our AI will analyze it and suggest the right category and priority.</p>
                
                <form onSubmit={handleTriage}>
                  <textarea
                    className="w-full bg-gray-50 border-gray-200 rounded-2xl focus:ring-violet-500 focus:border-violet-500 mb-4 p-4 text-base transition-colors"
                    rows="5"
                    placeholder="e.g. The AC is blowing hot air and making a rattling sound..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <input
                      type="text"
                      className="w-full bg-gray-50 border-gray-200 rounded-2xl focus:ring-violet-500 focus:border-violet-500 p-4 text-base transition-colors"
                      placeholder="Your name (optional)"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                    />
                    <input
                      type="email"
                      className="w-full bg-gray-50 border-gray-200 rounded-2xl focus:ring-violet-500 focus:border-violet-500 p-4 text-base transition-colors"
                      placeholder="Email (optional)"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={triaging || !issueDescription.trim()}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-2xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg"
                  >
                    {triaging ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
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
              <div className="bg-white rounded-3xl shadow-xl shadow-violet-100/50 border border-violet-50 p-6 md:p-8 mb-8 transform transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-inner">
                    <span className="text-xl">🤖</span>
                  </div>
                  <h3 className="font-extrabold text-2xl text-gray-800">AI Triage Results</h3>
                </div>

                {/* Warning banner if critical */}
                {triageResult.warning && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-sm text-red-700 font-medium shadow-sm">
                    <strong>⚠️ Warning:</strong> {triageResult.warning}
                  </div>
                )}

                {/* AI analysis cards */}
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-5 text-base border border-gray-100">
                  <div>
                    <span className="text-gray-500 text-xs uppercase font-bold tracking-wider block mb-2">Structured Description</span>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-gray-800 whitespace-pre-wrap">
                      {triageResult.description}
                    </div>
                  </div>
                  {triageResult.possible_solution && (
                    <div>
                      <span className="text-violet-600 text-xs uppercase font-bold tracking-wider block mb-2 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Possible Solution
                      </span>
                      <div className="bg-violet-50 p-4 rounded-xl border border-violet-100 shadow-sm text-violet-900 whitespace-pre-wrap font-medium">
                        {triageResult.possible_solution}
                      </div>
                    </div>
                  )}
                  {triageResult.missing_information && triageResult.missing_information.length > 0 && (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mt-4 shadow-sm">
                      <span className="text-rose-700 text-xs font-extrabold uppercase tracking-wider block mb-2">Missing Details Requested by AI</span>
                      <p className="text-rose-600 text-sm mb-4">Please provide these details for a better solution (or submit directly if you prefer).</p>
                      <div className="space-y-4">
                        {triageResult.missing_information.map((info, i) => (
                          <div key={i}>
                            <label className="block text-sm font-bold text-rose-900 mb-1.5">{info}</label>
                            <input 
                              type="text" 
                              className="w-full border-rose-200 rounded-xl focus:ring-rose-500 focus:border-rose-500 p-3 text-base bg-white transition-colors shadow-sm" 
                              placeholder="Your answer..."
                              value={missingAnswers[info] || ''}
                              onChange={(e) => onAnswerChange(info, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 flex justify-end">
                        <button
                          type="button"
                          disabled={triaging}
                          onClick={handleReAnalyze}
                          className="bg-rose-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 text-sm shadow-md hover:shadow-lg"
                        >
                          {triaging ? 'Re-Analyzing...' : 'Analyze Again with New Info'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Editable fields */}
                <form onSubmit={handleSubmitIssue} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Issue Title</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-violet-500 focus:border-violet-500 p-3 text-base transition-colors"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-violet-500 focus:border-violet-500 p-3 text-base transition-colors"
                        value={editedCategory}
                        onChange={(e) => setEditedCategory(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Priority</label>
                      <select
                        className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-violet-500 focus:border-violet-500 p-3 text-base transition-colors"
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

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setTriageResult(null)}
                      className="sm:w-1/3 border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-base"
                    >
                      ← Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="sm:w-2/3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
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
          <div className="bg-white rounded-3xl shadow-xl shadow-green-100/50 border border-green-50 p-8 text-center mb-8 transform transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-extrabold text-2xl text-gray-800 mb-2">Report Submitted Successfully!</h3>
            {submittedTicket && (
              <p className="text-base text-gray-600 mb-2">
                Ticket ID: <span className="font-mono font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded">{submittedTicket.issue_number}</span>
              </p>
            )}
            <p className="text-base text-gray-500 mb-8 max-w-md mx-auto">Thank you. The maintenance team has been notified and a ticket has been generated. You can track its status anytime.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              {submittedTicket && (
                <Link
                  to={`/track/${submittedTicket.issue_number}`}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-center"
                >
                  Track Your Ticket
                </Link>
              )}
              <button 
                onClick={resetForm}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Report Another Issue
              </button>
            </div>
          </div>
        )}
        </div>
        </div>
      </main>
    </div>
  );
}

export default PublicAsset;
