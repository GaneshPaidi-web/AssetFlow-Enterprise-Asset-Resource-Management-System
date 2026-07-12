import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { KPICard } from '../components/KPICard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Package,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Wrench,
  Clock,
  ExternalLink,
  Activity,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import type { DashboardStats, ActivityLog, Allocation } from '../types';

const chartData = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 18 },
  { month: 'Mar', value: 15 },
  { month: 'Apr', value: 25 },
  { month: 'May', value: 22 },
  { month: 'Jun', value: 30 },
  { month: 'Jul', value: 28 }
];

const registerSchema = z.object({
  name: z.string().min(3, { message: 'Asset name must be at least 3' }),
  serialNumber: z.string().min(4, { message: 'Serial number is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  purchaseValue: z.coerce.number().min(1),
});

const allocateSchema = z.object({
  assetId: z.string().min(1, { message: 'Asset is required' }),
  employee: z.string().min(3, { message: 'Employee name is required' }),
  department: z.string().min(1, { message: 'Department is required' }),
});

type RegisterSchema = z.infer<typeof registerSchema>;
type AllocateSchema = z.infer<typeof allocateSchema>;

export const Dashboard: React.FC = () => {
  const { assets, maintenance, addAsset, allocateAsset } = useAppState();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  // Live KPI data from API
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiClient.get('/analytics/dashboard');
        setDashStats(res.data);
      } catch (e) {
        console.error('Failed to fetch dashboard stats', e);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchActivity = async () => {
      try {
        const res = await apiClient.get('/activity-logs');
        setActivityLogs(res.data || []);
      } catch {
        setActivityLogs([]);
      }
    };

    fetchDashboard();
    fetchActivity();
  }, []);

  // Modals
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [isAllocOpen, setIsAllocOpen] = useState(false);

  // Form setups
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const regForm = useForm<any>({ resolver: zodResolver(registerSchema) });
  const allocForm = useForm<AllocateSchema>({ resolver: zodResolver(allocateSchema) });

  const onRegisterSubmit = (data: RegisterSchema) => {
    addAsset({
      name: data.name,
      serialNumber: data.serialNumber,
      category: data.category,
      department: 'Unassigned',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseValue: data.purchaseValue,
      location: 'San Francisco HQ',
    });
    setIsRegOpen(false);
    regForm.reset();
  };

  const onAllocateSubmit = (data: AllocateSchema) => {
    allocateAsset(data.assetId, data.employee, data.department);
    setIsAllocOpen(false);
    allocForm.reset();
  };

  // KPIs - prefer live API stats, fall back to computed from context
  const totalAssets = dashStats?.totalAssets ?? assets.length;
  const countAllocated = dashStats?.allocatedAssets ?? assets.filter(a => a.status === 'Allocated').length;
  const countAvailable = dashStats?.availableAssets ?? assets.filter(a => a.status === 'Available').length;
  const countPendingTransfers = dashStats?.pendingTransfers ?? 0;
  const countMaintenance = dashStats?.maintenanceToday ?? maintenance.filter(m => m.status === 'Pending' || m.status === 'In Progress').length;
  const activeBookings = dashStats?.activeBookings ?? 0;
  const overdueAllocations: Allocation[] = dashStats?.overdueAllocations ?? [];

  // Critical repairs from local context
  const criticalRepairs = maintenance.filter(m => m.status !== 'Completed').slice(0, 3);
  const unallocatedAssets = assets.filter(a => a.status === 'Available');

  // Role checks
  const isRestrictedRole = user?.role === 'Department Head' || user?.role === 'Employee';

  // Format activity time
  const formatActivityTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const diff = Date.now() - d.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 60) return `${minutes} min ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header with User name */}
      <PageHeader
        title="Command Dashboard"
        description={`Welcome back, ${firstName}. Here is your enterprise asset flow and audit compliance summary.`}
      />

      {/* Welcome Banner */}
      <div className="bg-[#6c757d] text-white rounded-card p-6 shadow-custom flex flex-col md:flex-row md:items-center justify-between gap-6 select-none border border-white/5">
        <div>
          <h2 className="text-2xl font-bold text-white m-0">AssetFlow Corporate ERP</h2>
          <p className="text-white/80 text-[15px] font-medium m-0 mt-2 max-w-xl">
            You are viewing the San Francisco HQ command summary. All assets, pending allocations, and repair requests are fully synced.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 bg-white/10 px-4 py-2.5 rounded-btn border border-white/10">
          <ShieldCheck className="w-5 h-5 text-green-300 stroke-[1.75]" />
          <span className="text-[14px] font-semibold text-white">SSO Node Authenticated</span>
        </div>
      </div>

      {/* Quick Actions Card */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
          {!isRestrictedRole && (
            <Button variant="outline" onClick={() => setIsRegOpen(true)} className="flex items-center gap-2.5">
              <Plus className="w-5 h-5 text-[#6c757d]" />
              Register Asset
            </Button>
          )}
          {!isRestrictedRole && (
            <Button variant="outline" onClick={() => setIsAllocOpen(true)} className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 text-[#6c757d]" />
              Allocate Asset
            </Button>
          )}
          <Link to="/maintenance">
            <Button variant="outline" className="w-full flex items-center gap-2.5">
              <Wrench className="w-5 h-5 text-[#6c757d]" />
              Request Repair
            </Button>
          </Link>
          <Link to="/audit">
            <Button variant="outline" className="w-full flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#6c757d]" />
              Compliance Count
            </Button>
          </Link>
        </div>
      </Card>

      {/* 6 KPI Cards Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KPICard
          title="Total Assets"
          value={loadingStats ? '—' : totalAssets}
          icon={Package}
          iconBgColor="bg-[#e9ecef]"
          iconColor="text-[#6c757d]"
        />
        <KPICard
          title="Allocated"
          value={loadingStats ? '—' : countAllocated}
          icon={TrendingUp}
          iconBgColor="bg-[#0d6efd]/10"
          iconColor="text-[#0d6efd]"
        />
        <KPICard
          title="Available"
          value={loadingStats ? '—' : countAvailable}
          icon={CheckCircle2}
          iconBgColor="bg-[#198754]/10"
          iconColor="text-[#198754]"
        />
        <KPICard
          title="Pending Transfers"
          value={loadingStats ? '—' : countPendingTransfers}
          icon={RefreshCw}
          iconBgColor="bg-[#ffc107]/10"
          iconColor="text-[#b25e00]"
        />
        <KPICard
          title="Maintenance Today"
          value={loadingStats ? '—' : countMaintenance}
          icon={Wrench}
          iconBgColor="bg-[#dc3545]/10"
          iconColor="text-[#dc3545]"
        />
        <KPICard
          title="Active Bookings"
          value={loadingStats ? '—' : activeBookings}
          icon={BookOpen}
          iconBgColor="bg-[#0dcaf0]/10"
          iconColor="text-[#0c8ca7]"
        />
      </div>

      {/* Charts & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation trend - Left 2 Columns */}
        <Card title="Allocation Trend" className="lg:col-span-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dee2e6" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#6c757d' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#6c757d' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6c757d" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity Logs - Right Column */}
        <Card title="Recent Activity Stream" headerActions={
          <Link to="/notifications" className="text-xs text-[#6c757d] hover:text-[#212529] font-bold flex items-center gap-1">
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }>
          <div className="space-y-4">
            {activityLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs text-[#6c757d] font-semibold">No recent activity</p>
              </div>
            ) : (
              activityLogs.slice(0, 5).map(act => (
                <div key={act.id} className="flex items-start gap-3 border-b border-[#dee2e6] pb-3 last:border-0 last:pb-0 select-none">
                  <div className="w-2 h-2 rounded-full bg-[#6c757d] mt-2 shrink-0 animate-ping" />
                  <div className="min-w-0">
                    <h4 className="text-[14px] font-bold text-[#212529]">{act.action}</h4>
                    <p className="text-xs text-[#6c757d] mt-0.5 leading-relaxed">{act.description}</p>
                    <span className="text-[10px] text-gray-400 font-bold block mt-1">{formatActivityTime(act.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Overdue Allocations & Maintenance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue asset allocations */}
        <Card title="Overdue Asset Allocations" headerActions={
          overdueAllocations.length > 0 ? (
            <span className="text-xs font-bold text-[#dc3545] bg-[#dc3545]/10 px-2 py-0.5 rounded-full">
              {overdueAllocations.length} overdue
            </span>
          ) : undefined
        }>
          <div className="space-y-4">
            {loadingStats ? (
              <p className="text-xs text-[#6c757d]">Loading...</p>
            ) : overdueAllocations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShieldCheck className="w-8 h-8 text-[#198754]/50 mb-2" />
                <p className="text-xs text-[#6c757d] font-semibold">No overdue allocations detected.</p>
              </div>
            ) : (
              <div className="space-y-3.5 select-none">
                {overdueAllocations.map(alc => (
                  <div key={alc.id} className="flex justify-between items-center border-b border-[#dee2e6] pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#dc3545] shrink-0" />
                        <h4 className="text-[14px] font-bold text-[#212529] truncate">{alc.assetName}</h4>
                      </div>
                      <p className="text-xs text-[#6c757d] font-semibold mt-1 ml-6">Allocated to {alc.allocatedTo} ({alc.department})</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="text-[11px] font-bold text-[#dc3545] bg-[#dc3545]/10 border border-[#dc3545]/20 px-2 py-0.5 rounded-full">
                        Overdue Return
                      </span>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">Due: {alc.dueDate ?? alc.allocatedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Maintenance alerts */}
        <Card title="Active Maintenance Requests" headerActions={
          <Link to="/maintenance" className="text-xs text-[#6c757d] hover:text-[#212529] font-bold flex items-center gap-1">
            Logs <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        }>
          <div className="space-y-4">
            {criticalRepairs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wrench className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs text-[#6c757d] font-semibold">No active repair tickets.</p>
              </div>
            ) : (
              <div className="space-y-3.5 select-none">
                {criticalRepairs.map(rep => (
                  <div key={rep.id} className="flex justify-between items-center border-b border-[#dee2e6] pb-3 last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#212529]">{rep.assetName}</h4>
                      <p className="text-xs text-[#6c757d] font-semibold mt-1">Priority: <span className={`font-extrabold ${rep.priority === 'High' ? 'text-[#dc3545]' : 'text-[#b25e00]'}`}>{rep.priority}</span></p>
                    </div>
                    <StatusBadge status={rep.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal Actions */}
      {/* 1. Register Asset */}
      <Modal isOpen={isRegOpen} onClose={() => setIsRegOpen(false)} title="Register New Asset">
        <form onSubmit={regForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
          <Input label="Asset Name" placeholder="e.g. ThinkPad X1" error={regForm.formState.errors.name?.message as string} {...regForm.register('name')} />
          <Input label="Serial Number" placeholder="e.g. S12345" error={regForm.formState.errors.serialNumber?.message as string} {...regForm.register('serialNumber')} />
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[14px] font-semibold text-[#495057]">Category</label>
            <select {...regForm.register('category')} className="h-[44px] px-3.5 bg-white border border-[#ced4da] rounded-input text-[#212529]">
              <option value="IT Hardware">IT Hardware</option>
              <option value="Facilities">Facilities</option>
              <option value="Networking">Networking</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <Input label="Purchase Value ($)" type="number" placeholder="2000" error={regForm.formState.errors.purchaseValue?.message as string} {...regForm.register('purchaseValue')} />
          <div className="flex justify-end gap-3 border-t border-[#dee2e6] pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsRegOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Register</Button>
          </div>
        </form>
      </Modal>

      {/* 2. Allocate Asset */}
      <Modal isOpen={isRegOpen ? false : isAllocOpen} onClose={() => setIsAllocOpen(false)} title="Allocate Asset">
        <form onSubmit={allocForm.handleSubmit(onAllocateSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[14px] font-semibold text-[#495057]">Select Asset</label>
            <select {...allocForm.register('assetId')} className="h-[44px] px-3.5 bg-white border border-[#ced4da] rounded-input text-[#212529]">
              <option value="">-- Choose Asset --</option>
              {unallocatedAssets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
              ))}
            </select>
            {allocForm.formState.errors.assetId && <span className="text-xs text-[#dc3545] font-semibold">{allocForm.formState.errors.assetId.message}</span>}
          </div>
          <Input label="Allocated Employee Name" placeholder="e.g. Jane Cooper" error={allocForm.formState.errors.employee?.message} {...allocForm.register('employee')} />
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[14px] font-semibold text-[#495057]">Department</label>
            <select {...allocForm.register('department')} className="h-[44px] px-3.5 bg-white border border-[#ced4da] rounded-input text-[#212529]">
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 border-t border-[#dee2e6] pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsAllocOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Allocate</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
