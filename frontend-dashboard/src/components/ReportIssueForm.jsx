import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import CustomDropdown from './CustomDropdown';

function ReportIssueForm({ assetCode, setAssetCode, issueDescription, setIssueDescription, error }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

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
          placeholder="Describe exactly what is wrong. What did you see? Are there any weird noises or leaks?"
          className="form-textarea w-full p-3 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:ring-violet-500"
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">Our AI system will analyze this to generate a technical ticket.</p>
      </div>
    </form>
  );
}

export default ReportIssueForm;
