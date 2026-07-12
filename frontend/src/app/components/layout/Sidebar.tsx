import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppState } from '../../../contexts/AppContext';
import {
  LayoutDashboard,
  Building2,
  Package,
  Calendar,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  Settings,
  User,
  LogOut
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Organization Setup', path: '/organization', icon: Building2 },
  { name: 'Assets', path: '/assets', icon: Package },
  { name: 'Booking', path: '/booking', icon: Calendar },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Audit', path: '/audit', icon: ClipboardCheck },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Notifications', path: '/notifications', icon: Bell, badge: true },
  { name: 'Settings', path: '/settings', icon: Settings }
];

export const Sidebar: React.FC = () => {
  const { user, notifications } = useAppState();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <aside className="w-[280px] fixed top-0 bottom-0 left-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white flex flex-col justify-between z-30 shadow-2xl border-r border-slate-800/50 select-none">
      {/* Top Brand Logo */}
      <div className="p-6 border-b border-slate-800/65">
        <h1 className="text-2xl font-extrabold tracking-tight m-0 bg-gradient-to-r from-indigo-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent">
          AssetFlow
        </h1>
        <p className="text-[10px] text-indigo-400/80 font-bold m-0 mt-1.5 uppercase tracking-widest">Enterprise Suite</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto space-y-1 scrollbar-thin">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                relative flex items-center gap-3 py-3 px-6 text-[15px] font-medium transition-all duration-250
                ${isActive 
                  ? 'bg-gradient-to-r from-indigo-600/15 to-transparent text-white border-l-[4px] border-indigo-500 pl-[20px] shadow-[inset_4px_0_15px_rgba(99,102,241,0.04)] font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-[4px] border-transparent'}
              `}
            >
              <Icon className="w-5 h-5 stroke-[1.75]" />
              <span className="flex-1">{item.name}</span>
              {item.badge && unreadCount > 0 && (
                <span className="bg-indigo-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile Details */}
      <div className="p-6 border-t border-slate-800/65 space-y-4">
        {/* Profile Link */}
        <NavLink
          to="/profile"
          className={({ isActive }) => `
            flex items-center gap-3 py-2 text-[15px] font-medium transition-all duration-200
            ${isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}
          `}
        >
          <User className="w-5 h-5 stroke-[1.75]" />
          <span>My Profile</span>
        </NavLink>

        {/* Logout button */}
        <button
          onClick={() => console.log('Logging out...')}
          className="w-full flex items-center gap-3 py-2 text-[15px] font-medium text-slate-400 hover:text-rose-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 stroke-[1.75]" />
          <span>Logout</span>
        </button>

        {/* User Card Floating Widget */}
        <div className="flex items-center gap-3 mt-4 p-3 bg-slate-800/40 border border-slate-800/70 rounded-xl select-none">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border border-indigo-500/20 shadow-inner"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-100 truncate m-0 leading-tight">{user.name}</p>
            <p className="text-[11px] text-slate-450 truncate m-0 mt-0.5 leading-normal">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
