import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
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
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, allowedRoles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  { name: 'Organization Setup', path: '/organization', icon: Building2, allowedRoles: ['Admin'] },
  { name: 'User Management', path: '/users', icon: User, allowedRoles: ['Admin'] },
  { name: 'Assets', path: '/assets', icon: Package, allowedRoles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  { name: 'Booking', path: '/booking', icon: Calendar, allowedRoles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench, allowedRoles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  { name: 'Audit', path: '/audit', icon: ClipboardCheck, allowedRoles: ['Admin', 'Asset Manager', 'Department Head'] },
  { name: 'Reports', path: '/reports', icon: BarChart3, allowedRoles: ['Admin', 'Asset Manager', 'Department Head'] },
  { name: 'Notifications', path: '/notifications', icon: Bell, badge: true, allowedRoles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  { name: 'Settings', path: '/settings', icon: Settings, allowedRoles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] }
];

export const Sidebar: React.FC = () => {
  const { notifications } = useAppState();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-[280px] fixed top-0 bottom-0 left-0 bg-[#6c757d] text-white flex flex-col justify-between z-30 shadow-custom select-none">
      {/* Top Brand Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-tight text-white m-0">AssetFlow</h1>
        <p className="text-xs text-white/70 font-medium m-0 mt-1 uppercase tracking-wider">Enterprise ERP</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto space-y-1">
        {menuItems
          .filter(item => !item.allowedRoles || item.allowedRoles.includes(user?.role || 'Employee'))
          .map(item => {
            const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                relative flex items-center gap-3 py-3 px-6 text-[15px] font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-white/15 text-white border-l-[4px] border-white pl-[20px]' 
                  : 'text-white/70 hover:text-white hover:bg-white/5 border-l-[4px] border-transparent'}
              `}
            >
              <Icon className="w-5 h-5 stroke-[1.75]" />
              <span className="flex-1">{item.name}</span>
              {item.badge && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile Details */}
      <div className="p-6 border-t border-white/10 space-y-4">
        {/* Profile Link */}
        <NavLink
          to="/profile"
          className={({ isActive }) => `
            flex items-center gap-3 py-2 text-[15px] font-medium transition-all duration-200
            ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}
          `}
        >
          <User className="w-5 h-5 stroke-[1.75]" />
          <span>My Profile</span>
        </NavLink>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-2 text-[15px] font-medium text-white/70 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 stroke-[1.75]" />
          <span>Logout</span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[16px] border border-white/20 shadow-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-white truncate m-0 leading-tight">{user?.name || 'User'}</p>
            <p className="text-[12px] text-white/60 truncate m-0 leading-normal">{user?.role || 'Employee'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

