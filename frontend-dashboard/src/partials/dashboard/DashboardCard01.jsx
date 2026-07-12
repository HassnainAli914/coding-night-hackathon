import React from 'react';
import DoughnutChart from '../../charts/DoughnutChart';
import { getCssVariable } from '../../utils/Utils';

function DashboardCard01({ stats }) {
  if (!stats) return null;

  const conditions = Object.keys(stats.assetConditionBreakdown || {});
  const data = Object.values(stats.assetConditionBreakdown || {});

  // Provide some default colors for up to 4 conditions
  const bgColors = [
    getCssVariable('--color-violet-500'),
    getCssVariable('--color-sky-500'),
    getCssVariable('--color-violet-800'),
    getCssVariable('--color-sky-800'),
  ];
  
  const hoverColors = [
    getCssVariable('--color-violet-600'),
    getCssVariable('--color-sky-600'),
    getCssVariable('--color-violet-900'),
    getCssVariable('--color-sky-900'),
  ];

  const chartData = {
    labels: conditions.length > 0 ? conditions : ['No Data'],
    datasets: [
      {
        label: 'Asset Conditions',
        data: data.length > 0 ? data : [1],
        backgroundColor: conditions.length > 0 ? bgColors.slice(0, conditions.length) : [getCssVariable('--color-gray-200')],
        hoverBackgroundColor: conditions.length > 0 ? hoverColors.slice(0, conditions.length) : [getCssVariable('--color-gray-300')],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-xs rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Total Assets</h2>
        <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.totalAssets || 0}</div>
      </header>
      <div className="px-5 py-3">
        <div className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Condition Breakdown</div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <DoughnutChart data={chartData} width={389} height={260} />
    </div>
  );
}

export default DashboardCard01;
