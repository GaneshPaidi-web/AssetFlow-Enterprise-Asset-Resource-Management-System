import React, { useState } from 'react';
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
  DollarSign,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Wrench,
  Clock,
  ExternalLink
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

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
  const { assets, allocations, transfers, maintenance, addAsset, allocateAsset, requestTransfer } = useAppState();

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

  const selectedAssetId = allocForm.watch('assetId');
  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const isAlreadyAllocated = selectedAsset?.status === 'Allocated';
  const currentHolder = isAlreadyAllocated
    ? allocations.find(al => al.assetId === selectedAssetId && al.status === 'Active')
    : null;

  const handleTransferRequest = () => {
    const employee = allocForm.getValues('employee');
    const department = allocForm.getValues('department');
    if (!employee || employee.length < 3) {
      allocForm.setError('employee', { type: 'manual', message: 'Employee name is required to request transfer' });
      return;
    }
    requestTransfer(selectedAssetId, employee, department);
    setIsAllocOpen(false);
    allocForm.reset();
  };

  // KPIs
  const totalAssets = assets.length;
  const countAllocated = assets.filter(a => a.status === 'Allocated').length;
  const countAvailable = assets.filter(a => a.status === 'Available').length;
  const countPendingTransfers = transfers.filter(t => t.status === 'Pending').length;
  const countRepairs = maintenance.filter(m => m.status === 'Pending' || m.status === 'In Progress').length;
  const totalValue = assets.reduce((sum, a) => sum + a.purchaseValue, 0);

  // Lists
  const activeAllocations = allocations.filter(a => a.status === 'Active');
  const criticalRepairs = maintenance.filter(m => m.status !== 'Completed').slice(0, 3);
  const allocatableAssets = assets.filter(a => a.status === 'Available' || a.status === 'Allocated');

  // Activity stream based on records
  const recentActivities = [
    { id: '1', title: 'Asset returned', desc: 'Jane Cooper returned MacBook Pro AST-001.', time: '2 hours ago' },
    { id: '2', title: 'New Transfer request', desc: 'Cody Fisher requested iPad Pro AST-003.', time: '1 day ago' },
    { id: '3', title: 'Asset registration', desc: 'Herman Miller chair HM-A-948190 added.', time: '3 days ago' },
    { id: '4', title: 'Repair ticket generated', desc: 'Keysight Oscilloscope moved to diagnostics.', time: '4 days ago' }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header with User name */}
      <PageHeader
        title="Command Dashboard"
        description="Welcome back, Kristin. Here is your enterprise asset flow and audit compliance summary."
      />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-card p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 select-none border border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white m-0">AssetFlow Corporate ERP</h2>
          <p className="text-white/80 text-[15px] font-medium m-0 mt-2 max-w-xl">
            You are viewing the San Francisco HQ command summary. All assets, pending allocations, and repair requests are fully synced.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 bg-white/10 px-4 py-2.5 rounded-btn border border-white/10">
          <ShieldCheck className="w-5 h-5 text-cyan-300 stroke-[1.75]" />
          <span className="text-[14px] font-semibold text-white">SSO Node Authenticated</span>
        </div>
      </div>

      {/* Quick Actions Card */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
          <Button variant="outline" onClick={() => setIsRegOpen(true)} className="flex items-center gap-2.5">
            <Plus className="w-5 h-5 text-primary" />
            Register Asset
          </Button>
          <Button variant="outline" onClick={() => setIsAllocOpen(true)} className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-primary" />
            Allocate Asset
          </Button>
          <Link to="/maintenance">
            <Button variant="outline" className="w-full flex items-center gap-2.5">
              <Wrench className="w-5 h-5 text-primary" />
              Request Repair
            </Button>
          </Link>
          <Link to="/audit">
            <Button variant="outline" className="w-full flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-primary" />
              Compliance Count
            </Button>
          </Link>
        </div>
      </Card>

      {/* 6 KPI Cards Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KPICard title="Total Assets" value={totalAssets} icon={Package} iconBgColor="bg-slate-100" iconColor="text-slate-500" />
        <KPICard title="Allocated" value={countAllocated} icon={TrendingUp} iconBgColor="bg-primary/10" iconColor="text-primary" />
        <KPICard title="Available" value={countAvailable} icon={CheckCircle2} iconBgColor="bg-[#16a34a]/10" iconColor="text-[#16a34a]" />
        <KPICard title="Pending Transfers" value={countPendingTransfers} icon={RefreshCw} iconBgColor="bg-[#d97706]/10" iconColor="text-[#d97706]" />
        <KPICard title="Active Repairs" value={countRepairs} icon={Wrench} iconBgColor="bg-destructive/10" iconColor="text-destructive" />
        <KPICard title="Capital Value" value={`$${totalValue.toLocaleString()}`} icon={DollarSign} iconBgColor="bg-[#16a34a]/10" iconColor="text-[#16a34a]" />
      </div>

      {/* Charts & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation trend - Left 2 Columns */}
        <Card title="Allocation Trend" className="lg:col-span-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#94a3b8' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity Logs - Right Column */}
        <Card title="Recent Activity Stream" headerActions={
          <Link to="/notifications" className="text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1">
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }>
          <div className="space-y-4">
            {recentActivities.map(act => (
              <div key={act.id} className="flex items-start gap-3 border-b border-[#f1f5f9] pb-3 last:border-0 last:pb-0 select-none">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 animate-ping" />
                <div className="min-w-0">
                  <h4 className="text-[14px] font-bold text-[#0f172a]">{act.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{act.desc}</p>
                  <span className="text-[10px] text-gray-400 font-bold block mt-1">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Maintenance & Overdue Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue assets returns */}
        <Card title="Overdue Asset Allocations">
          <div className="space-y-4">
            {activeAllocations.length === 0 ? (
              <p className="text-xs text-slate-400">No active allocations detected.</p>
            ) : (
              <div className="space-y-3.5 select-none">
                {activeAllocations.map(alc => (
                  <div key={alc.id} className="flex justify-between items-center border-b border-[#f1f5f9] pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-bold text-[#0f172a] truncate">{alc.assetName}</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-1">Allocated to {alc.allocatedTo} ({alc.department})</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-[#dc3545] bg-[#dc3545]/10 border border-[#dc3545]/20 px-2 py-0.5 rounded-full">
                        Overdue Return
                      </span>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">Due Date: {alc.allocatedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Maintenance alerts */}
        <Card title="Active Maintenance Requests" headerActions={
          <Link to="/maintenance" className="text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1">
            Logs <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        }>
          <div className="space-y-4">
            {criticalRepairs.length === 0 ? (
              <p className="text-xs text-slate-400">No active repair tickets.</p>
            ) : (
              <div className="space-y-3.5 select-none">
                {criticalRepairs.map(rep => (
                  <div key={rep.id} className="flex justify-between items-center border-b border-[#f1f5f9] pb-3 last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#0f172a]">{rep.assetName}</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-1">Priority: <span className="font-extrabold text-[#dc3545]">{rep.priority}</span></p>
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
          <Input label="Asset Name" placeholder="e.g. ThinkPad X1" error={regForm.formState.errors.name?.message as string | undefined} {...regForm.register('name')} />
          <Input label="Serial Number" placeholder="e.g. S12345" error={regForm.formState.errors.serialNumber?.message as string | undefined} {...regForm.register('serialNumber')} />
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[14px] font-semibold text-[#495057]">Category</label>
            <select {...regForm.register('category')} className="h-[44px] px-3.5 bg-white border border-[#ced4da] rounded-input text-[#212529]">
              <option value="IT Hardware">IT Hardware</option>
              <option value="Facilities">Facilities</option>
              <option value="Networking">Networking</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <Input label="Purchase Value ($)" type="number" placeholder="2000" error={regForm.formState.errors.purchaseValue?.message as string | undefined} {...regForm.register('purchaseValue')} />
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
              {allocatableAssets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.id}) {a.status === 'Allocated' ? '[Already Allocated]' : ''}</option>
              ))}
            </select>
            {allocForm.formState.errors.assetId && <span className="text-xs text-[#dc3545] font-semibold">{allocForm.formState.errors.assetId.message}</span>}
          </div>

          {isAlreadyAllocated && currentHolder && (
            <div className="p-3.5 bg-yellow-50 border border-yellow-250 text-left text-xs font-semibold text-yellow-800 rounded-btn">
              ⚠️ Conflict Alert: This asset is currently held by <strong>{currentHolder.allocatedTo}</strong> ({currentHolder.department}). Direct double-allocation is blocked. Request a <strong>Transfer Request</strong> instead.
            </div>
          )}

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
            {isAlreadyAllocated ? (
              <Button type="button" variant="primary" onClick={handleTransferRequest} className="bg-amber-600 hover:bg-amber-700 text-white border-transparent">
                Request Transfer
              </Button>
            ) : (
              <Button type="submit" variant="primary">Allocate</Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};
