import React from 'react';
import { format } from 'date-fns';

function DashboardCard04({ stats }) {
  if (!stats) return null;

  return (
    <div className="flex flex-col col-span-full sm:col-span-12 xl:col-span-12 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Recent Activity</h2>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full dark:text-gray-300">
            {/* Table header */}
            <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 rounded-xs">
              <tr>
                <th className="p-2">
                  <div className="font-semibold text-left">Action</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-left">Asset</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-left">Actor</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-left">Date</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm font-medium divide-y divide-gray-100 dark:divide-gray-700/60">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className="text-gray-800 dark:text-gray-100">{activity.action_type}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-violet-500">{activity.asset?.name || 'Unknown Asset'}</div>
                    </td>
                    <td className="p-2">
                      <div className="text-gray-800 dark:text-gray-100">{activity.actor?.name || 'System'}</div>
                    </td>
                    <td className="p-2">
                      <div className="text-gray-500">
                        {activity.created_at && !isNaN(new Date(activity.created_at).getTime()) 
                          ? format(new Date(activity.created_at), 'MMM d, yyyy h:mm a') 
                          : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-2 text-center text-gray-500 py-4">
                    No recent activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard04;
