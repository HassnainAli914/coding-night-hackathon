import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import FilterButton from '../components/DropdownFilter';
import Datepicker from '../components/Datepicker';
import DashboardCard01 from '../partials/dashboard/DashboardCard01';
import DashboardCard02 from '../partials/dashboard/DashboardCard02';
import DashboardCard03 from '../partials/dashboard/DashboardCard03';
import DashboardCard04 from '../partials/dashboard/DashboardCard04';
import DashboardCard05 from '../partials/dashboard/DashboardCard05';
import DashboardCard06 from '../partials/dashboard/DashboardCard06';
import DashboardCard07 from '../partials/dashboard/DashboardCard07';
import DashboardCard08 from '../partials/dashboard/DashboardCard08';
import DashboardCard09 from '../partials/dashboard/DashboardCard09';
import DashboardCard10 from '../partials/dashboard/DashboardCard10';
import DashboardCard11 from '../partials/dashboard/DashboardCard11';
import DashboardCard12 from '../partials/dashboard/DashboardCard12';
import DashboardCard13 from '../partials/dashboard/DashboardCard13';

function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow flex flex-col">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto grow">
            
            {/* Page Header (Welcome Banner) */}
            <div className="relative bg-violet-200 dark:bg-violet-900/20 p-4 sm:p-6 rounded-xs overflow-hidden mb-8">
              {/* Background illustration */}
              <div className="absolute right-0 top-0 -mt-4 mr-16 pointer-events-none hidden xl:block" aria-hidden="true">
                <svg width="319" height="198" xmlnsXlink="http://www.w3.org/1999/xlink">
                  <defs>
                    <path id="welcome-a" d="M64 0l64 128-64-20-64 20z" />
                    <path id="welcome-e" d="M40 0l40 80-40-12.5L0 80z" />
                    <path id="welcome-g" d="M40 0l40 80-40-12.5L0 80z" />
                    <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="welcome-b">
                      <stop stopColor="#A5B4FC" offset="0%" />
                      <stop stopColor="#818CF8" offset="100%" />
                    </linearGradient>
                    <linearGradient x1="50%" y1="24.537%" x2="50%" y2="100%" id="welcome-c">
                      <stop stopColor="#4338CA" offset="0%" />
                      <stop stopColor="#6366F1" stopOpacity="0" offset="100%" />
                    </linearGradient>
                  </defs>
                  <g fill="none" fillRule="evenodd">
                    <g transform="rotate(64 36.592 105.604)">
                      <mask id="welcome-d" fill="#fff">
                        <use xlinkHref="#welcome-a" />
                      </mask>
                      <use fill="url(#welcome-b)" xlinkHref="#welcome-a" />
                      <path fill="url(#welcome-c)" mask="url(#welcome-d)" d="M64-24h80v152H64z" />
                    </g>
                    <g transform="rotate(-51 91.324 -105.372)">
                      <mask id="welcome-f" fill="#fff">
                        <use xlinkHref="#welcome-e" />
                      </mask>
                      <use fill="url(#welcome-b)" xlinkHref="#welcome-e" />
                      <path fill="url(#welcome-c)" mask="url(#welcome-f)" d="M40.333-15.147h50v95h-50z" />
                    </g>
                    <g transform="rotate(44 61.546 392.623)">
                      <mask id="welcome-h" fill="#fff">
                        <use xlinkHref="#welcome-g" />
                      </mask>
                      <use fill="url(#welcome-b)" xlinkHref="#welcome-g" />
                      <path fill="url(#welcome-c)" mask="url(#welcome-h)" d="M40.333-15.147h50v95h-50z" />
                    </g>
                  </g>
                </svg>
              </div>
              {/* Content */}
              <div className="relative">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-1">
                  Good afternoon, {profile?.name ? profile.name.split(' ')[0] : 'User'} 👋
                </h1>
                <p className="dark:text-gray-300">Here is what's happening with your assets today:</p>
              </div>
            </div>

            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 font-bold">Overview</h2>
              </div>
              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Filter button */}
                <FilterButton align="right" />
                {/* Datepicker built with React Day Picker */}
                <Datepicker align="right" />
                {/* Add view button */}
                <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                  <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                  <span className="max-xs:sr-only">Add View</span>
                </button>                
              </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-12 gap-6">
              <DashboardCard01 />
              <DashboardCard02 />
              <DashboardCard03 />
              <DashboardCard04 />
              <DashboardCard05 />
              <DashboardCard06 />
              <DashboardCard07 />
              <DashboardCard08 />
              <DashboardCard09 />
              <DashboardCard10 />
              <DashboardCard11 />
              <DashboardCard12 />
              <DashboardCard13 />
            </div>
          </div>
          
          {/* Page Footer */}
          <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700/60 text-sm text-gray-500 dark:text-gray-400">
            <div className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-9xl mx-auto">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div className="flex justify-center sm:justify-start mb-4 sm:mb-0">
                  <div className="text-sm font-medium">MaintainIQ © 2026. All rights reserved.</div>
                </div>
                <div className="flex justify-center sm:justify-end gap-4 font-medium">
                  <a href="#0" className="hover:text-violet-500 transition duration-150">Terms</a>
                  <a href="#0" className="hover:text-violet-500 transition duration-150">Privacy</a>
                  <a href="#0" className="hover:text-violet-500 transition duration-150">Help</a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;