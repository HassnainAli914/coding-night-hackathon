import React from 'react';

const actionConfig = {
  'ISSUE_REPORTED': { icon: '⚠️', color: 'border-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  'TECHNICIAN_ASSIGNED': { icon: '👤', color: 'border-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  'INSPECTION_STARTED': { icon: '🔍', color: 'border-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  'MAINTENANCE_COMPLETED': { icon: '✅', color: 'border-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  'STATUS_CHANGED': { icon: '🔄', color: 'border-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
};

function AssetHistoryTimeline({ history, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-4 border-violet-500 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-sm text-gray-500">Loading history...</span>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm">No history recorded for this asset yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

      <div className="space-y-0">
        {history.map((event, idx) => {
          const config = actionConfig[event.action] || { icon: '📋', color: 'border-gray-400', bg: 'bg-gray-50 dark:bg-gray-700' };
          const isFirst = idx === 0;
          return (
            <div key={event.id} className="relative flex items-start gap-4 py-3 pl-12">
              {/* Dot on timeline */}
              <div className={`absolute left-3 w-5 h-5 rounded-full border-2 ${config.color} bg-white dark:bg-gray-800 flex items-center justify-center text-xs z-10`}>
                <span className="text-[10px]">{config.icon}</span>
              </div>

              {/* Content */}
              <div className={`flex-1 rounded-lg p-3 ${isFirst ? config.bg : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {event.action.replace(/_/g, ' ')}
                    </span>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{event.details}</p>
                    {event.actor && (
                      <p className="text-xs text-gray-400 mt-1">by {event.actor.name} ({event.actor.role})</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                    {new Date(event.created_at).toLocaleDateString()}{' '}
                    {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AssetHistoryTimeline;
