import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Server, Shield, Activity } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#dee2e6] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#212529] flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <span className="text-xl font-bold text-[#212529]">AssetFlow</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-[15px] font-semibold text-[#495057] hover:text-[#212529] transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="px-5 py-2.5 rounded-btn bg-[#212529] text-white text-[15px] font-semibold hover:bg-[#343a40] transition-colors shadow-custom">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-[#0d6efd]/5 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-[#198754]/5 blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#dee2e6] shadow-sm mb-8">
          <ShieldCheck className="w-4 h-4 text-[#198754]" />
          <span className="text-[13px] font-bold text-[#495057]">Enterprise-Grade Asset Management</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-[#212529] max-w-4xl tracking-tight leading-tight">
          Control your physical assets with <span className="text-[#6c757d]">precision.</span>
        </h1>
        
        <p className="mt-6 text-xl text-[#6c757d] max-w-2xl font-medium">
          A centralized command center for your entire hardware fleet. Track allocations, manage maintenance, and automate audits in real-time.
        </p>

        <div className="mt-10 flex gap-4">
          <Link to="/signup" className="flex items-center gap-2 px-8 py-4 rounded-btn bg-[#212529] text-white text-[16px] font-bold hover:bg-[#343a40] transition-colors shadow-custom hover:shadow-lg transform hover:-translate-y-0.5 duration-200">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="flex items-center gap-2 px-8 py-4 rounded-btn bg-white border border-[#dee2e6] text-[#212529] text-[16px] font-bold hover:bg-[#f8f9fa] transition-colors shadow-sm hover:shadow transform hover:-translate-y-0.5 duration-200">
            Sign In to Dashboard
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="bg-white p-6 rounded-card border border-[#dee2e6] shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-[#f8f9fa] border border-[#dee2e6] flex items-center justify-center mb-4">
              <Server className="w-6 h-6 text-[#212529]" />
            </div>
            <h3 className="text-lg font-bold text-[#212529] mb-2">Centralized Inventory</h3>
            <p className="text-[15px] text-[#6c757d] font-medium leading-relaxed">
              Maintain a single source of truth for all IT hardware, facilities, and network infrastructure across departments.
            </p>
          </div>
          <div className="bg-white p-6 rounded-card border border-[#dee2e6] shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-[#f8f9fa] border border-[#dee2e6] flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-[#212529]" />
            </div>
            <h3 className="text-lg font-bold text-[#212529] mb-2">Real-time Allocations</h3>
            <p className="text-[15px] text-[#6c757d] font-medium leading-relaxed">
              Track asset movements instantly. Manage checkout flows, transfer requests, and overdue returns effortlessly.
            </p>
          </div>
          <div className="bg-white p-6 rounded-card border border-[#dee2e6] shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-[#f8f9fa] border border-[#dee2e6] flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#212529]" />
            </div>
            <h3 className="text-lg font-bold text-[#212529] mb-2">Secure & Compliant</h3>
            <p className="text-[15px] text-[#6c757d] font-medium leading-relaxed">
              Role-based access control, cryptographic password hashing, and full activity logging to meet enterprise compliance.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-[14px] text-[#6c757d] font-medium border-t border-[#dee2e6] bg-white mt-auto">
        &copy; {new Date().getFullYear()} AssetFlow ERP. All rights reserved.
      </footer>
    </div>
  );
};
