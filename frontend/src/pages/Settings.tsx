import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Settings as SettingsIcon, Shield, Bell, MapPin, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="System Settings"
        description="Configure corporate resource rules, scanning thresholds, compliance cycles and notifications."
        actions={
          <Button variant="primary" className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Rules & Scanning - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Compliance Rules" subtitle="Establish inventory verification standards.">
            <div className="space-y-4 select-none">
              <label className="flex items-start gap-3.5 p-4 bg-slate-50/40 border border-[#f1f5f9] rounded-btn hover:bg-slate-50/90 transition-all duration-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer" />
                <div>
                  <span className="text-[15px] font-bold text-[#0f172a] block">Mandatory QR Scan</span>
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">Require auditors to scan physical QR codes before updating asset status.</span>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 bg-slate-50/40 border border-[#f1f5f9] rounded-btn hover:bg-slate-50/90 transition-all duration-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer" />
                <div>
                  <span className="text-[15px] font-bold text-[#0f172a] block">Dual-Signature Approvals</span>
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">Require both department leads to approve an asset transfer request.</span>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 bg-slate-50/40 border border-[#f1f5f9] rounded-btn hover:bg-slate-50/90 transition-all duration-200 cursor-pointer">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer" />
                <div>
                  <span className="text-[15px] font-bold text-[#0f172a] block">Auto-deprecate assets</span>
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">Automatically compute asset value reductions based on category parameters.</span>
                </div>
              </label>
            </div>
          </Card>

          <Card title="Notifications & Alerts" subtitle="Configure triggers for asset status changes.">
            <div className="space-y-4 select-none">
              <label className="flex items-start gap-3.5 p-4 bg-slate-50/40 border border-[#f1f5f9] rounded-btn hover:bg-slate-50/90 transition-all duration-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer" />
                <div>
                  <span className="text-[15px] font-bold text-[#0f172a] block">Asset Overdue Reminders</span>
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">Send automated emails to employees when their allocated assets are overdue for audit.</span>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 bg-slate-50/40 border border-[#f1f5f9] rounded-btn hover:bg-slate-50/90 transition-all duration-200 cursor-pointer">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer" />
                <div>
                  <span className="text-[15px] font-bold text-[#0f172a] block">Immediate Maintenance Alerts</span>
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">Notify compliance team instantly when a high-priority repair ticket is raised.</span>
                </div>
              </label>
            </div>
          </Card>
        </div>

        {/* System Profile - Right Column */}
        <div className="space-y-6 select-none">
          <Card title="System Details">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-500" />
                <div>
                  <h4 className="text-[14px] font-bold text-[#0f172a]">Security Level</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">Enterprise SSO (Active)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <div>
                  <h4 className="text-[14px] font-bold text-[#0f172a]">Primary Node</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">AWS us-west-2 (Oregon)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-indigo-500" />
                <div>
                  <h4 className="text-[14px] font-bold text-[#0f172a]">Software Version</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">v1.24.8-Enterprise</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
