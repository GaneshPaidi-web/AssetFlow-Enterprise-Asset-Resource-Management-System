import React from 'react';
import { useAppState } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { User, Shield, Mail, MapPin } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAppState();

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="My Profile"
        description="View your corporate directory credentials, access permissions and active workspace location."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* User Card - Left Column */}
        <Card className="text-center py-8">
          <div className="relative inline-block select-none">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#ced4da] mx-auto shadow-md"
            />
          </div>
          <h3 className="text-[20px] font-bold text-[#212529] mt-4">{user.name}</h3>
          <p className="text-xs text-[#6c757d] font-bold uppercase tracking-wider mt-1">{user.role}</p>

          <div className="space-y-3.5 mt-8 border-t border-[#dee2e6] pt-6 text-left text-xs font-semibold text-[#495057]">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#6c757d]" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#6c757d]" />
              <span>SF Office Room 402</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-[#6c757d]" />
              <span>Full ERP Admin Permissions</span>
            </div>
          </div>
        </Card>

        {/* Audit / Action Logs - Right 2 Columns */}
        <div className="lg:col-span-2 space-y-6 select-none">
          <Card title="Security Permissions Roster" subtitle="Verify your authenticated roles and action thresholds.">
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-[#dee2e6] pb-3 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-[14px] font-bold text-[#212529]">Asset Management</h4>
                  <p className="text-xs text-[#6c757d] mt-1 font-semibold leading-relaxed">Register new assets, modify values and declare depreciation timelines.</p>
                </div>
                <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2 py-0.5 rounded">Granted</span>
              </div>

              <div className="flex items-start justify-between border-b border-[#dee2e6] pb-3 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-[14px] font-bold text-[#212529]">Audits & Compliance</h4>
                  <p className="text-xs text-[#6c757d] mt-1 font-semibold leading-relaxed">Initiate global hardware counts, generate compliance PDFs and resolve conflicts.</p>
                </div>
                <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2 py-0.5 rounded">Granted</span>
              </div>

              <div className="flex items-start justify-between border-b border-[#dee2e6] pb-3 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-[14px] font-bold text-[#212529]">System Administration</h4>
                  <p className="text-xs text-[#6c757d] mt-1 font-semibold leading-relaxed">Modify SSO integrations, alter rules and reset API tokens.</p>
                </div>
                <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2 py-0.5 rounded">Granted</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
