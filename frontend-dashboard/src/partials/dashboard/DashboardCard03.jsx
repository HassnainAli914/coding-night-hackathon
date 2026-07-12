import React from 'react';

function DashboardCard03({ stats }) {
  if (!stats) return null;

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <div className="px-5 pt-5 pb-5">
        <header className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-gray-700/60 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Maintenance Activity</h2>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {/* Total Cost */}
          <div className="flex flex-col bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Total Cost</div>
            <div className="flex items-start">
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">
                ${(stats.totalMaintenanceCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Time Spent */}
          <div className="flex flex-col bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Total Time Spent</div>
            <div className="flex items-start">
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">
                {stats.totalTimeSpent || 0}
              </div>
              <div className="text-sm font-medium text-gray-500 mt-2">Hours</div>
            </div>
          </div>
          
          {/* Total Records */}
          <div className="flex flex-col col-span-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Completed Records</div>
            <div className="flex items-start">
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">
                {stats.totalMaintenanceRecords || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard03;
