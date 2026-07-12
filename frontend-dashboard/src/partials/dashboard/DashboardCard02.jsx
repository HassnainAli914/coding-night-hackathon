import React from 'react';
import DoughnutChart from '../../charts/DoughnutChart';
import { getCssVariable } from '../../utils/Utils';

function DashboardCard02({ stats }) {
  if (!stats) return null;

  const priorities = Object.keys(stats.issuePriorityBreakdown || {});
  const data = Object.values(stats.issuePriorityBreakdown || {});

  // Colors for Low, Medium, High, Critical
  const priorityColors = {
    'Low': getCssVariable('--color-sky-500'),
    'Medium': getCssVariable('--color-amber-500'),
    'High': getCssVariable('--color-orange-500'),
    'Critical': getCssVariable('--color-red-500'),
  };
  
  const priorityHoverColors = {
    'Low': getCssVariable('--color-sky-600'),
    'Medium': getCssVariable('--color-amber-600'),
    'High': getCssVariable('--color-orange-600'),
    'Critical': getCssVariable('--color-red-600'),
  };

  const bgColors = priorities.map(p => priorityColors[p] || getCssVariable('--color-violet-500'));
  const hoverColors = priorities.map(p => priorityHoverColors[p] || getCssVariable('--color-violet-600'));

  const chartData = {
    labels: priorities.length > 0 ? priorities : ['No Data'],
    datasets: [
      {
        label: 'Priority',
        data: data.length > 0 ? data : [1],
        backgroundColor: priorities.length > 0 ? bgColors : [getCssVariable('--color-gray-200')],
        hoverBackgroundColor: priorities.length > 0 ? hoverColors : [getCssVariable('--color-gray-300')],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Active Issues</h2>
        <div className="flex items-end">
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">{stats.openIssues || 0}</div>
            <div className="text-sm font-medium text-gray-500 pb-1">/ {stats.totalIssues || 0} Total</div>
        </div>
      </header>
      <div className="px-5 py-3">
        <div className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Priority Breakdown</div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <DoughnutChart data={chartData} width={389} height={260} />
    </div>
  );
}

export default DashboardCard02;
