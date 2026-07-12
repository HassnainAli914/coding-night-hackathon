import React, { useState } from 'react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import AssetsTable from '../components/AssetsTable';
import AddAssetForm from '../components/AddAssetForm';
import CategoriesManager from '../components/CategoriesManager';
import { useAuth } from '../contexts/AuthContext';

function Assets() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form' | 'categories'

  const { profile } = useAuth();
  const userRole = profile?.role || 'worker';
  const isAdmin = userRole === 'admin';

  const handleAssetAdded = () => {
    setViewMode('list');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Page Header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  {viewMode === 'list' && 'Asset Management'}
                  {viewMode === 'form' && 'Add New Asset'}
                  {viewMode === 'categories' && 'Asset Categories'}
                </h1>
              </div>

              {/* Right: Action Buttons */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {viewMode === 'list' ? (
                  <>
                    {isAdmin && (
                      <button
                        onClick={() => setViewMode('categories')}
                        className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 shadow-sm"
                      >
                        <svg className="w-4 h-4 mr-1.5 fill-current opacity-60" viewBox="0 0 16 16">
                          <path d="M1 3h14a1 1 0 000-2H1a1 1 0 000 2zM1 9h14a1 1 0 000-2H1a1 1 0 000 2zM1 15h14a1 1 0 000-2H1a1 1 0 000 2z"/>
                        </svg>
                        Manage Categories
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setViewMode('form')}
                        className="btn bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                      >
                        <svg className="w-4 h-4 fill-current opacity-50 shrink-0" viewBox="0 0 16 16">
                          <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                        </svg>
                        <span className="hidden xs:block ml-2">Add Asset</span>
                      </button>
                    )}
                  </>
                ) : viewMode === 'form' ? (
                  <>
                    <button
                      onClick={() => setViewMode('list')}
                      className="btn bg-white border-gray-200 text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Back to Assets List
                    </button>
                    <button
                      type="submit"
                      form="add-asset-form"
                      className="btn bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                    >
                      Save Asset
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setViewMode('list')}
                    className="btn bg-white border-gray-200 text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    ← Back to Assets
                  </button>
                )}
              </div>
            </div>

            {/* Content View */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-full xl:col-span-12">
                {viewMode === 'list' && <AssetsTable />}
                {viewMode === 'form' && <AddAssetForm onSuccess={handleAssetAdded} />}
                {viewMode === 'categories' && <CategoriesManager />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Assets;
