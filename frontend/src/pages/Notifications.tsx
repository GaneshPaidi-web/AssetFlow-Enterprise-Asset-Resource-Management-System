import React, { useState } from 'react';
import { useAppState } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Bell, CheckSquare, Search, Filter, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

export const Notifications: React.FC = () => {
  const { notifications, clearNotifications } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterType === 'all' ||
      (filterType === 'unread' && !n.isRead) ||
      (filterType === 'read' && n.isRead);

    return matchesSearch && matchesStatus;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-[#ffc107] shrink-0" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-[#dc3545] shrink-0" />;
      default: return <Info className="w-5 h-5 text-[#0d6efd] shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Notification Center"
        description="Review systems alerts, repair requests, audit results, and allocation triggers."
        actions={
          <Button variant="outline" onClick={clearNotifications} className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Mark All as Read
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white border border-[#dee2e6] rounded-card p-4 shadow-custom">
        {/* Search */}
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c757d]" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-transparent border border-[#ced4da] rounded-input text-[#212529] placeholder-[#6c757d]/70 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 select-none shrink-0">
          <Filter className="w-5 h-5 text-[#6c757d] mr-1" />
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 border",
              filterType === 'all'
                ? "bg-[#6c757d] text-white border-transparent"
                : "bg-white text-[#6c757d] border-[#ced4da] hover:bg-gray-50"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 border",
              filterType === 'unread'
                ? "bg-[#6c757d] text-white border-transparent"
                : "bg-white text-[#6c757d] border-[#ced4da] hover:bg-gray-50"
            )}
          >
            Unread
          </button>
          <button
            onClick={() => setFilterType('read')}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 border",
              filterType === 'read'
                ? "bg-[#6c757d] text-white border-transparent"
                : "bg-white text-[#6c757d] border-[#ced4da] hover:bg-gray-50"
            )}
          >
            Read
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[16px] text-[#6c757d] font-semibold">No notifications found.</p>
          </Card>
        ) : (
          filteredNotifications.map(notification => (
            <Card
              key={notification.id}
              className={cn(
                "p-5 transition-all duration-200 border-l-[6px]",
                notification.isRead ? "border-l-gray-300 bg-white" : "border-l-primary bg-primary/5"
              )}
            >
              <div className="flex gap-4 items-start select-none">
                {getIcon(notification.type)}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className={cn("text-[15px] font-bold text-[#212529]", !notification.isRead && "font-extrabold")}>
                      {notification.title}
                    </h4>
                    <span className="text-[12px] text-[#6c757d] font-medium shrink-0">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#495057] mt-1 leading-relaxed">{notification.message}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
