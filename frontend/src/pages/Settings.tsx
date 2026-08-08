import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Settings as SettingsIcon, Shield, Bell, MapPin, Save, Package, Users } from 'lucide-react';
import { apiClient } from '../services/apiClient';

const SETTINGS_KEY = 'assetflow_settings';

interface AppSettings {
  mandatoryQrScan: boolean;
  dualSignatureApprovals: boolean;
  autoDepreciate: boolean;
  overdueReminders: boolean;
  maintenanceAlerts: boolean;
}

const defaultSettings: AppSettings = {
  mandatoryQrScan: true,
  dualSignatureApprovals: true,
  autoDepreciate: false,
  overdueReminders: true,
  maintenanceAlerts: false,
};

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ totalAssets: 0, totalUsers: 0 });

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch {
        setSettings(defaultSettings);
      }
    }

    const fetchStats = async () => {
      try {
        const [dashRes, usersRes] = await Promise.all([
          apiClient.get('/analytics/dashboard'),
          apiClient.get('/users'),
        ]);
        setStats({
          totalAssets: dashRes.data?.totalAssets || 0,
          totalUsers: usersRes.data?.length || 0,
        });
      } catch (e) {
        console.error('Failed to load system stats', e);
      }
    };
    fetchStats();
  }, []);

  const toggle = (key: keyof AppSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="System Settings"
        description="Configure corporate resource rules, scanning thresholds, compliance cycles and notifications."
        actions={
          <Button variant="primary" className="flex items-center gap-2" onClick={handleSave}>
            <Save className="w-5 h-5" />
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Compliance Rules" subtitle="Establish inventory verification standards.">
            <div className="space-y-4 select-none">
              <label className="flex items-start gap-3.5 p-4 bg-slate-50/40 border border-[#f1f5f9] rounded-btn hover:bg-slate-50/90 transition-all duration-200 cursor-pointer">
                <input type="checkbox" checked={settings.mandatoryQrScan} onChange={() => toggle('mandatoryQrScan')} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer" />
                <div>
                  <span className="text-[15px] font-bold text-[#0f172a] block">Mandatory QR Scan</span>
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">Require auditors to scan physical QR codes before updating asset status.</span>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 bg-slate-50/40 border border-[#f1f5f9] rounded-btn hover:bg-slate-50/90 transition-all duration-200 cursor-pointer">
                <input type="checkbox" checked={settings.dualSignatureApprovals} onChange={() => toggle('dualSignatureApprovals')} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer" />
                <div>
                  <span className="text-[15px] font-bold text-[#0f172a] block">Dual-Signature Approvals</span>
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">Require both department leads to approve an asset transfer request.</span>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 bg-slate-50/40 border border-[#f1f5f9] rounded-btn hover:bg-slate-50/90 transition-all duration-200 cursor-pointer">
                <input type="checkbox" checked={settings.autoDepreciate} onChange={() => toggle('autoDepreciate')} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer" />
                <div>
                  <span className="text-[15px] font-bold text-[#0f172a] block">Auto-depreciate assets</span>
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">Automatically compute asset value reductions based on category parameters.</span>
                </div>
              </label>
            </div>
          </Card>

          <Card title="Notifications & Alerts" subtitle="Configure triggers for asset status changes.">
            <div className="space-y-4 select-none">
              <label className="flex items-start gap-3.5 p-4 bg-slate-50/40 border border-[#f1f5f9] rounded-btn hover:bg-slate-50/90 transition-all duration-200 cursor-pointer">
                <input type="checkbox" checked={settings.overdueReminders} onChange={() => toggle('overdueReminders')} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer" />
                <div>
                  <span className="text-[15px] font-bold text-[#0f172a] block">Asset Overdue Reminders</span>
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">Send automated emails to employees when their allocated assets are overdue for audit.</span>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 bg-slate-50/40 border border-[#f1f5f9] rounded-btn hover:bg-slate-50/90 transition-all duration-200 cursor-pointer">
                <input type="checkbox" checked={settings.maintenanceAlerts} onChange={() => toggle('maintenanceAlerts')} className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer" />
                <div>
                  <span className="text-[15px] font-bold text-[#0f172a] block">Immediate Maintenance Alerts</span>
                  <span className="text-xs text-slate-500 font-semibold leading-relaxed">Notify compliance team instantly when a high-priority repair ticket is raised.</span>
                </div>
              </label>
            </div>
          </Card>
        </div>

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
                <Package className="w-5 h-5 text-indigo-500" />
                <div>
                  <h4 className="text-[14px] font-bold text-[#0f172a]">Registered Assets</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">{stats.totalAssets} assets in database</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-500" />
                <div>
                  <h4 className="text-[14px] font-bold text-[#0f172a]">Active Users</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">{stats.totalUsers} users in database</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <div>
                  <h4 className="text-[14px] font-bold text-[#0f172a]">Database</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">PostgreSQL (Connected)</p>
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
