import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import UserMenu from '../components/DropdownProfile';
import SearchModal from '../components/ModalSearch';
import Notifications from '../components/DropdownNotifications';
import Help from '../components/DropdownHelp';
import ThemeToggle from '../components/ThemeToggle';
function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {
  const location = useLocation();
  const { pathname } = location;
  const { user, profile } = useAuth();
  
  const rawRole = profile?.role || user?.role || user?.user_metadata?.role || 'reporter';
  const isEncrypted = rawRole && rawRole.length > 20;
  const userRole = isEncrypted ? (user?.user_metadata?.role || 'reporter') : rawRole;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === "true");
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  const navItemClass = (pathNameMatcher) => {
    const isActive = pathname === pathNameMatcher || pathname.includes(pathNameMatcher);
    return `pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r ${isActive ? "from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]" : ""}`;
  };

  const navLinkClass = (pathNameMatcher) => {
    const isActive = pathname === pathNameMatcher || pathname.includes(pathNameMatcher);
    return `block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${isActive ? "" : "hover:text-gray-900 dark:hover:text-white"}`;
  };

  const navIconClass = (pathNameMatcher) => {
    const isActive = pathname === pathNameMatcher || pathname.includes(pathNameMatcher);
    return `shrink-0 fill-current ${isActive ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`;
  };

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64! shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'rounded-r-2xl shadow-xs'}`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink end to="/dashboard" className="block lg:hidden lg:sidebar-expanded:block 2xl:block">
            <svg className="fill-violet-500" xmlns="http://www.w3.org/2000/svg" width={32} height={32}>
              <path d="M31.956 14.8C31.372 6.92 25.08.628 17.2.044V5.76a9.04 9.04 0 0 0 9.04 9.04h5.716ZM14.8 26.24v5.716C6.92 31.372.63 25.08.044 17.2H5.76a9.04 9.04 0 0 1 9.04 9.04Zm11.44-9.04h5.716c-.584 7.88-6.876 14.172-14.756 14.756V26.24a9.04 9.04 0 0 1 9.04-9.04ZM.044 14.8C.63 6.92 6.92.628 14.8.044V5.76a9.04 9.04 0 0 1-9.04 9.04H.044Z" />
            </svg>
          </NavLink>
          {/* Expand / collapse button (desktop only) */}
          <button
            className="hidden lg:block lg:mx-auto lg:sidebar-expanded:mx-0 2xl:hidden text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
          >
            <span className="sr-only">Expand / collapse sidebar</span>
            <svg className="shrink-0 fill-current text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3 mb-3">
              <span className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">•••</span>
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">Menu</span>
            </h3>
            <ul className="mt-3">
              {/* Dashboard */}
              <li className={navItemClass('/dashboard')}>
                <NavLink to="/dashboard" className={navLinkClass('/dashboard')}>
                  <div className="flex items-center">
                    <svg className={navIconClass('/dashboard')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M5.936.278A7.983 7.983 0 0 1 8 0a8 8 0 1 1-8 8c0-.722.104-1.413.278-2.064a1 1 0 1 1 1.932.516A5.99 5.99 0 0 0 2 8a6 6 0 1 0 6-6c-.53 0-1.045.076-1.548.21A1 1 0 1 1 5.936.278Z" />
                      <path d="M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z" />
                    </svg>                            
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Dashboard</span>
                  </div>
                </NavLink>
              </li>

              {/* Report Issue (Clients/Workers/Reporters/Students/Teachers only) */}
              {(userRole === 'client' || userRole === 'reporter' || userRole === 'worker' || userRole === 'student' || userRole === 'teacher') && (
                <li className={navItemClass('/report-issue')}>
                  <NavLink to="/report-issue" className={navLinkClass('/report-issue')}>
                    <div className="flex items-center">
                      <svg className={navIconClass('/report-issue')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1Zm0 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                      </svg>
                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Report Issue</span>
                    </div>
                  </NavLink>
                </li>
              )}

              {/* Assets (Admin/Technician/Worker/Teacher only) */}
              {(userRole === 'admin' || userRole === 'technician' || userRole === 'worker' || userRole === 'teacher') && (
                <li className={navItemClass('/assets')}>
                  <NavLink to="/assets" className={navLinkClass('/assets')}>
                    <div className="flex items-center">
                      <svg className={navIconClass('/assets')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M12 1a1 1 0 1 0-2 0v2a3 3 0 0 0 3 3h2a1 1 0 1 0 0-2h-2a1 1 0 0 1-1-1V1ZM1 10a1 1 0 1 0 0 2h2a1 1 0 0 1 1 1v2a1 1 0 1 0 2 0v-2a3 3 0 0 0-3-3H1ZM5 0a1 1 0 0 1 1 1v2a3 3 0 0 1-3 3H1a1 1 0 0 1 0-2h2a1 1 0 0 0 1-1V1a1 1 0 0 1 1-1ZM12 13a1 1 0 0 1 1-1h2a1 1 0 1 0 0-2h-2a3 3 0 0 0-3 3v2a1 1 0 1 0 2 0v-2Z" />
                      </svg>
                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Assets</span>
                    </div>
                  </NavLink>
                </li>
              )}

              {/* Issues (Admin/Technician/Worker/Teacher only) */}
              {(userRole === 'admin' || userRole === 'technician' || userRole === 'worker' || userRole === 'teacher') && (
                <li className={navItemClass('/issues')}>
                  <NavLink to="/issues" className={navLinkClass('/issues')}>
                    <div className="flex items-center">
                      <svg className={navIconClass('/issues')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M7.586 9H1a1 1 0 1 1 0-2h6.586L6.293 5.707a1 1 0 0 1 1.414-1.414l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 1 1-1.414-1.414L7.586 9ZM3.075 4.572a1 1 0 1 1-1.64-1.144 8 8 0 1 1 0 9.144 1 1 0 0 1 1.64-1.144 6 6 0 1 0 0-6.856Z" />
                      </svg>
                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Issues</span>
                    </div>
                  </NavLink>
                </li>
              )}

              {/* Technician Console (Technician/Worker only) */}
              {(userRole === 'technician' || userRole === 'worker') && (
                <li className={navItemClass('/technician')}>
                  <NavLink to="/technician" className={navLinkClass('/technician')}>
                    <div className="flex items-center">
                      <svg className={navIconClass('/technician')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M11.92 6.851c.044-.18.068-.37.068-.561 0-1.3-1.032-2.339-2.317-2.339a2.29 2.29 0 0 0-2.013 1.184c-.07-.012-.141-.019-.214-.019a1.585 1.585 0 0 0-1.563 1.591c0 .09.008.178.023.264a2.347 2.347 0 0 0-1.322 2.112c0 1.3 1.05 2.351 2.348 2.351h4.914c1.3 0 2.35-1.05 2.35-2.35a2.353 2.353 0 0 0-2.274-2.233Z" />
                      </svg>
                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">My Work</span>
                    </div>
                  </NavLink>
                </li>
              )}

              {/* Analytics (Admin/Technician/Worker/Teacher) */}
              {(userRole === 'admin' || userRole === 'technician' || userRole === 'worker' || userRole === 'teacher') && (
                <li className={navItemClass('/analytics')}>
                  <NavLink to="/analytics" className={navLinkClass('/analytics')}>
                    <div className="flex items-center">
                      <svg className={navIconClass('/analytics')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M3 15V5a1 1 0 0 1 2 0v10a1 1 0 0 1-2 0Zm4.5 0V2a1 1 0 0 1 2 0v13a1 1 0 0 1-2 0ZM11 15V8a1 1 0 0 1 2 0v7a1 1 0 0 1-2 0Z" />
                      </svg>
                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Analytics</span>
                    </div>
                  </NavLink>
                </li>
              )}

              {/* Maintenance Records (Admin/Technician) */}
              {(userRole === 'admin' || userRole === 'technician' || userRole === 'worker' || userRole === 'teacher') && (
                <li className={navItemClass('/maintenance')}>
                  <NavLink to="/maintenance" className={navLinkClass('/maintenance')}>
                    <div className="flex items-center">
                      <svg className={navIconClass('/maintenance')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M14.3.3c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-8 8c-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3L4.3 7.7c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0L7 7.6l7.3-7.3ZM1 14h14v1H1v-1Z" />
                      </svg>
                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Maintenance</span>
                    </div>
                  </NavLink>
                </li>
              )}

              {/* Settings (All authenticated users can access settings now) */}
              <li className={navItemClass('/settings')}>
                <NavLink to="/settings" className={navLinkClass('/settings')}>
                  <div className="flex items-center">
                    <svg className={navIconClass('/settings')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                      <path d="M10.5 1a3.502 3.502 0 0 1 3.355 2.5H15a1 1 0 1 1 0 2h-1.145a3.502 3.502 0 0 1-6.71 0H1a1 1 0 0 1 0-2h6.145A3.502 3.502 0 0 1 10.5 1ZM9 4.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM5.5 9a3.502 3.502 0 0 1 3.355 2.5H15a1 1 0 1 1 0 2H8.855a3.502 3.502 0 0 1-6.71 0H1a1 1 0 1 1 0-2h1.145A3.502 3.502 0 0 1 5.5 9ZM4 12.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z" fillRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">Settings</span>
                  </div>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Profile Section & Tools */}
        <div className="mt-auto pt-8">
          {/* Tools Row */}
          <div className={`flex flex-wrap items-center justify-center gap-3 px-3 pb-4 transition-all duration-200 ${sidebarExpanded || sidebarOpen ? 'lg:justify-between' : 'lg:flex-col lg:gap-4'}`}>
            <div>
              <button
                className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full ${searchModalOpen && 'bg-gray-200 dark:bg-gray-800'}`}
                onClick={(e) => { e.stopPropagation(); setSearchModalOpen(true); }}
                aria-controls="search-modal"
              >
                <span className="sr-only">Search</span>
                <svg
                  className="fill-current text-gray-500/80 dark:text-gray-400/80"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Z" />
                  <path d="m13.314 11.9 2.393 2.393a.999.999 0 1 1-1.414 1.414L11.9 13.314a8.019 8.019 0 0 0 1.414-1.414Z" />
                </svg>
              </button>
              <SearchModal id="search-modal" searchId="search" modalOpen={searchModalOpen} setModalOpen={setSearchModalOpen} />
            </div>
            <Notifications align={sidebarExpanded || sidebarOpen ? "right" : "left"} />
            <Help align={sidebarExpanded || sidebarOpen ? "right" : "left"} />
            <ThemeToggle />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700/60 pt-4">
            <UserMenu align="top" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
