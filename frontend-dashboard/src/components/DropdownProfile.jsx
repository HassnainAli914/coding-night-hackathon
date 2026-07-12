import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Transition from '../utils/Transition';
import { useAuth } from '../contexts/AuthContext';

import UserAvatar from '../images/user-avatar-32.png';

function DropdownProfile({
  align,
  dark = false
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, profile, logout, isVerifying } = useAuth();
  const navigate = useNavigate();

  const trigger = useRef(null);
  const dropdown = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/signin');
  };

  const displayName = profile?.name || user?.name || user?.user_metadata?.name || user?.email || "User";
  
  // Prefer profile.role because it is properly decrypted by the backend.
  const rawMetadataRole = user?.user_metadata?.role;
  const isEncrypted = rawMetadataRole && rawMetadataRole.length > 20;
  const displayRole = profile?.role || (isEncrypted ? 'Member' : rawMetadataRole) || 'Member';
  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || UserAvatar;

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="inline-flex justify-center items-center group"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <div className="relative">
          <img className="w-8 h-8 rounded-full object-cover" src={displayAvatar} width="32" height="32" alt="User" />
          {isVerifying && (
            <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          )}
        </div>
        <div className="flex items-center truncate">
          <span className={`truncate ml-2 text-sm font-medium transition-colors ${
            dark 
              ? 'text-gray-300 group-hover:text-white' 
              : 'text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white'
          }`}>
            {displayName}
          </span>
          <svg className={`w-3 h-3 shrink-0 ml-1 fill-current ${dark ? 'text-gray-500' : 'text-gray-400 dark:text-gray-500'}`} viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </button>

      <Transition
        className={`origin-bottom-left z-10 absolute min-w-44 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${
          align === 'top' ? 'bottom-full mb-2' : 'top-full'
        } ${
          dark 
            ? 'bg-gray-950 border border-gray-800 backdrop-blur-md' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60'
        } ${align === 'right' ? 'right-0' : 'left-0'}`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className={`pt-0.5 pb-2 px-3 mb-1 border-b ${
            dark ? 'border-gray-800' : 'border-gray-200 dark:border-gray-700/60'
          }`}>
            <div className={`font-medium ${dark ? 'text-gray-200' : 'text-gray-800 dark:text-gray-100'}`}>
              {displayName}
            </div>
            <div className={`text-xs capitalize italic ${dark ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {displayRole}
            </div>
          </div>
          <ul>
            <li>
              <Link
                className={`font-medium text-sm flex items-center py-1 px-3 transition-colors ${
                  dark 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-violet-500 hover:text-violet-600 dark:hover:text-violet-400'
                }`}
                to="/settings"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                Settings
              </Link>
            </li>
            <li>
              <button
                className={`font-medium text-sm flex items-center w-full text-left py-1 px-3 transition-colors ${
                  dark 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-violet-500 hover:text-violet-600 dark:hover:text-violet-400'
                }`}
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  )
}

export default DropdownProfile;