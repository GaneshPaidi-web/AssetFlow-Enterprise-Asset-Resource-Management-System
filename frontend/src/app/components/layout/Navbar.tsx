import React from 'react';
import { Search, Bell, MapPin, ChevronDown, LogOut } from 'lucide-react';
import { useAppState } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { activeSite, setActiveSite, notifications } = useAppState();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-[72px] bg-white border-b border-[#dee2e6] flex items-center justify-between px-8 sticky top-0 z-20 select-none">
      {/* Left: Search Bar */}
      <div className="w-[360px] relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6c757d]">
          <Search className="w-5 h-5 stroke-[1.75]" />
        </span>
        <input
          type="text"
          placeholder="Search assets, allocations, audits..."
          className="w-full h-11 pl-11 pr-4 bg-[#e9ecef]/50 border border-[#ced4da] rounded-input text-[#212529] placeholder-[#6c757d] text-[15px] focus:outline-none focus:border-[#6c757d] focus:bg-white transition-all duration-200"
        />
      </div>

      {/* Right: Site switcher, Notifications, User details */}
      <div className="flex items-center gap-6">
        {/* Location Display */}
        <div className="flex items-center gap-2 border-r border-[#dee2e6] pr-6">
          <MapPin className="w-5 h-5 text-[#6c757d] stroke-[1.75]" />
          <span className="text-[14px] font-semibold text-[#495057] max-w-[150px] truncate" title={user?.location || 'No GPS Location'}>
            {user?.location || 'No GPS Location'}
          </span>
        </div>

        {/* Notifications Icon */}
        <NavLink to="/notifications" className="relative p-2 text-[#6c757d] hover:bg-gray-100 rounded-full transition-all duration-200">
          <Bell className="w-5 h-5 stroke-[1.75]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </NavLink>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#dee2e6]">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-[#ced4da] shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#0d6efd] text-white flex items-center justify-center font-bold text-[14px] shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="hidden md:block min-w-[100px]">
            <p className="text-[14px] font-semibold text-[#212529] leading-tight">{user?.name || 'User'}</p>
            <p className="text-[12px] text-[#6c757d] leading-normal">{user?.role || 'Employee'}</p>
          </div>
          <button onClick={handleLogout} title="Logout" className="ml-2 p-1.5 text-[#6c757d] hover:text-[#dc3545] hover:bg-red-50 rounded-lg transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
