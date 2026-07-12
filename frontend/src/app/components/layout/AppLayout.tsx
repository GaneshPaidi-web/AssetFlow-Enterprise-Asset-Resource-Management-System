import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#e9ecef] flex">
      {/* Sidebar - fixed left */}
      <Sidebar />

      {/* Main Content Area - padded left to push past sidebar */}
      <div className="flex-1 pl-[280px] flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-grow p-8 overflow-y-auto">
          <div className="max-w-full mx-auto animate-fade">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
