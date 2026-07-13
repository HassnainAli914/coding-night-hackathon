import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import CustomDropdown from './CustomDropdown';

function ReportIssueForm({ assetCode, setAssetCode, issueDescription, setIssueDescription, error, reportStep, aiDraft, handleAnalyzeAgain, draftAnalyzing }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missingAnswers, setMissingAnswers] = useState({});

  useEffect(() => {
    setMissingAnswers({});
  }, [aiDraft]);

  const onAnswerChange = (question, val) => {
    setMissingAnswers(prev => ({ ...prev, [question]: val }));
  };

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await api.get('/api/assets');
        if (res.success && res.data?.assets) {
          setAssets(res.data.assets);
        }
      } catch (err) {
        console.error('Failed to fetch assets for reporting issue:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const assetOptions = assets.map(asset => ({
    value: asset.id,
    label: `${asset.name} (${asset.code})`,
    description: asset.location || 'No location specified'
  }));

  if (reportStep === 2 && aiDraft) {
    return (
      <div className="px-6 py-6 space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl p-5">
          <h3 className="text-green-800 dark:text-green-400 font-bold text-lg mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            AI Analysis Complete
          </h3>
          <p className="text-green-700 dark:text-green-500 text-sm">
            We have translated and arranged your report professionally. Please review the details and the suggested solution before submitting.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Generated Title</span>
            <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{aiDraft.title}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 block mb-1">Category</span>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{aiDraft.category}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 block mb-1">Priority</span>
              <p className={`font-medium text-sm ${
                aiDraft.priority === 'Critical' ? 'text-red-600' :
                aiDraft.priority === 'High' ? 'text-orange-600' :
                aiDraft.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>{aiDraft.priority}</p>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Structured Description</span>
            <div className="bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{aiDraft.description}</p>
            </div>
          </div>

          {aiDraft.possible_solution && (
            <div>
              <span className="text-xs text-blue-500 uppercase tracking-wider block mb-1 font-semibold flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Possible Solution
              </span>
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded border border-blue-100 dark:border-blue-900/30">
                <p className="text-blue-800 dark:text-blue-300 text-sm whitespace-pre-wrap">{aiDraft.possible_solution}</p>
              </div>
            </div>
          )}

          {aiDraft.missing_information && aiDraft.missing_information.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-xl border border-rose-100 dark:border-rose-900/30 mt-4">
              <span className="text-xs text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider block mb-2">Missing Details Requested by AI</span>
              <p className="text-sm text-rose-600 dark:text-rose-400 mb-4">Please provide these details so our AI can give you a better solution. (Optional, you can submit directly if you prefer).</p>
              
              <div className="space-y-4">
                {aiDraft.missing_information.map((info, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-rose-900 dark:text-rose-300 mb-1.5">{info}</label>
                    <input 
                      type="text" 
                      className="form-input w-full text-sm rounded-lg border-rose-200 focus:border-rose-500 focus:ring-rose-500 bg-white dark:bg-gray-800" 
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
                  disabled={draftAnalyzing}
                  onClick={() => handleAnalyzeAgain(missingAnswers)}
                  className="bg-rose-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-rose-700 transition disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm"
                >
                  {draftAnalyzing ? 'Re-Analyzing...' : 'Analyze Again with New Info'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form id="issue-form" onSubmit={(e) => e.preventDefault()} className="px-6 py-6 space-y-6">
      {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium mb-1">Select Asset <span className="text-red-500">*</span></label>
        {loading ? (
          <div className="text-sm text-gray-500">Loading assets...</div>
        ) : (
          <CustomDropdown
            className="w-full md:w-1/2"
            options={assetOptions}
            value={assetCode}
            onChange={setAssetCode}
            placeholder="Search and select an asset..."
            searchable={true}
            required={true}
          />
        )}
        <p className="text-xs text-gray-500 mt-1">Select the asset you are experiencing issues with.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Issue Description <span className="text-red-500">*</span></label>
        <textarea
          required
          rows="6"
          placeholder="Describe exactly what is wrong. You can write in English, Roman Urdu, Urdu, etc."
          className="form-textarea w-full p-3 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:ring-violet-500"
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">Our AI system will translate, structure, and analyze this before you submit.</p>
      </div>
    </form>
  );
}

export default ReportIssueForm;
