import React from 'react';
import { Search, Bell, MapPin, ChevronDown } from 'lucide-react';
import { useAppState } from '../../../contexts/AppContext';
import { NavLink } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, activeSite, setActiveSite, notifications } = useAppState();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const sites = ['San Francisco HQ', 'London Hub', 'New York Office'];

  return (
    <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-[#f1f5f9] flex items-center justify-between px-8 sticky top-0 z-20 select-none">
      {/* Left: Search Bar */}
      <div className="w-[360px] relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
          <Search className="w-5 h-5 stroke-[1.75]" />
        </span>
        <input
          type="text"
          placeholder="Search assets, allocations, audits..."
          className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-input text-slate-800 placeholder-slate-400 text-[15px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all duration-200"
        />
      </div>

      {/* Right: Site switcher, Notifications, User details */}
      <div className="flex items-center gap-6">
        {/* Site Switcher */}
        <div className="flex items-center gap-2 border-r border-[#f1f5f9] pr-6">
          <MapPin className="w-5 h-5 text-slate-400 stroke-[1.75]" />
          <div className="relative group">
            <select
              value={activeSite}
              onChange={(e) => setActiveSite(e.target.value)}
              className="appearance-none bg-transparent pr-8 pl-1 py-1.5 text-[15px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              {sites.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Notifications Icon */}
        <NavLink to="/notifications" className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-55 rounded-full transition-all duration-200">
          <Bell className="w-5 h-5 stroke-[1.75]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </NavLink>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-2">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-100"
          />
          <div className="hidden md:block text-left">
            <p className="text-[14px] font-semibold text-[#0f172a] leading-tight">{user.name}</p>
            <p className="text-[12px] text-slate-500 leading-normal">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
