import React, { useState } from 'react';
import { useAppState } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KPICard } from '../components/KPICard';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import type { Allocation, Asset } from '../types';

const allocateSchema = z.object({
  assetId: z.string().min(1, { message: 'Asset is required' }),
  employee: z.string().min(3, { message: 'Employee name is required' }),
  department: z.string().min(1, { message: 'Department is required' }),
});

type AllocateSchema = z.infer<typeof allocateSchema>;

export const AllocationPage: React.FC = () => {
  const { user } = useAuth();
  const {
    allocations,
    transfers,
    assets,
    allocateAsset,
    returnAsset,
    initiateReturn,
    requestTransfer,
    approveTransfer,
    rejectTransfer,
    departments,
    employees,
  } = useAppState();

  // Active state lists
  const activeAllocations = allocations.filter(a => a.status === 'Active' || a.status === 'Pending Return');
  const pendingTransfers = transfers.filter(t => t.status === 'Pending');

  // Confirmation Modal for Return Workflow
  const [returnTarget, setReturnTarget] = useState<Allocation | null>(null);

  const handleReturnConfirm = () => {
    if (returnTarget) {
      returnAsset(returnTarget.id);
      setReturnTarget(null);
    }
  };

  // Allocation Form State
  const [isAllocOpen, setIsAllocOpen] = useState(false);
  const [conflictAsset, setConflictAsset] = useState<{ assetId: string; employee: string; department: string } | null>(null);
  
  const allocForm = useForm<AllocateSchema>({ resolver: zodResolver(allocateSchema) });
  const unallocatedAssets = assets.filter(a => a.status === 'Available');
  const allAssets = assets;

  const onAllocateSubmit = async (data: AllocateSchema) => {
    try {
      setConflictAsset(null);
      await allocateAsset(data.assetId, data.employee, data.department);
      setIsAllocOpen(false);
      allocForm.reset();
    } catch (e: any) {
      if (e.message === 'CONFLICT') {
        setConflictAsset({ assetId: data.assetId, employee: data.employee, department: data.department });
      }
    }
  };

  const handleRequestTransfer = async () => {
    if (conflictAsset) {
      try {
        await requestTransfer(conflictAsset.assetId, conflictAsset.employee, conflictAsset.department);
        setIsAllocOpen(false);
        setConflictAsset(null);
        allocForm.reset();
      } catch (e) {
        alert('Failed to request transfer');
      }
    }
  };

  // KPIs
  const totalAllocatedCount = activeAllocations.length;
  const pendingTransfersCount = pendingTransfers.length;

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Asset Allocations"
        description="Oversee and process physical resource allocations, check-ins, returns, and employee-to-employee transfer approvals."
        actions={
          ['Admin', 'Asset Manager'].includes(user?.role || '') && (
            <Button variant="primary" onClick={() => { setConflictAsset(null); setIsAllocOpen(true); }} className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Allocate Asset
            </Button>
          )
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        <KPICard
          title="Active Corporate Allocations"
          value={totalAllocatedCount}
          icon={TrendingUp}
          iconBgColor="bg-[#0d6efd]/10"
          iconColor="text-[#0d6efd]"
        />
        <KPICard
          title="Pending Transfer Approvals"
          value={pendingTransfersCount}
          icon={RefreshCw}
          iconBgColor="bg-[#ffc107]/10"
          iconColor="text-[#b25e00]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Active Allocations Table - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Active Resources Allocations Directory">
            <Table
              data={activeAllocations}
              columns={[
                { header: 'Allocation ID', accessorKey: 'id' },
                { header: 'Asset Name', accessorKey: 'assetName' },
                { header: 'Serial Number', accessorKey: 'serialNumber' },
                { header: 'Allocated To', accessorKey: 'allocatedTo' },
                { header: 'Department', accessorKey: 'department' },
                { 
                  header: 'Allocated Date', 
                  accessorKey: 'allocatedDate',
                  render: (row) => {
                    const isOverdue = row.dueDate && new Date(row.dueDate) < new Date();
                    return (
                      <div className="flex flex-col gap-1">
                        <span>{row.allocatedDate}</span>
                        {row.dueDate && (
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded w-fit ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                            Due: {row.dueDate}
                          </span>
                        )}
                      </div>
                    );
                  }
                },
                {
                  header: 'Actions',
                  accessorKey: 'actions',
                  render: (row) => {
                    const isEmployee = user?.role === 'Employee';
                    const isManager = ['Admin', 'Asset Manager'].includes(user?.role || '');
                    
                    if (row.status === 'Pending Return') {
                      if (isManager) {
                        return (
                          <Button variant="primary" size="sm" onClick={() => setReturnTarget(row)} className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Approve Return
                          </Button>
                        );
                      }
                      return <span className="text-xs text-orange-500 font-bold">Return Pending</span>;
                    }

                    if (isEmployee) {
                      return (
                        <Button variant="outline" size="sm" onClick={() => initiateReturn(row.id)} className="flex items-center gap-1 hover:border-[#dc3545] hover:text-[#dc3545]">
                          <RotateCcw className="w-4 h-4" /> Initiate Return
                        </Button>
                      );
                    }

                    if (isManager) {
                      return (
                        <Button variant="outline" size="sm" onClick={() => setReturnTarget(row)} className="flex items-center gap-1 hover:border-[#dc3545] hover:text-[#dc3545]">
                          <RotateCcw className="w-4 h-4" /> Force Return
                        </Button>
                      );
                    }
                    
                    return null;
                  }
                }
              ]}
            />
          </Card>
        </div>

        {/* Transfer Requests & Approvals - Right Column */}
        <div className="space-y-6">
          <Card title="Pending Transfer Approvals">
            <div className="space-y-4">
              {pendingTransfers.length === 0 ? (
                <div className="text-center py-6 text-[#6c757d]">
                  <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold">All transfer clearances are up to date.</p>
                </div>
              ) : (
                pendingTransfers.map(req => (
                  <div
                    key={req.id}
                    className="p-4 bg-gray-50 border border-[#dee2e6] rounded-btn space-y-3.5 select-none"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="text-[14px] font-bold text-[#212529] truncate">{req.assetName}</h4>
                        <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{req.id} • {req.serialNumber}</span>
                      </div>
                      <StatusBadge status="Pending" />
                    </div>

                    {/* Flow */}
                    <div className="flex items-center gap-2.5 text-xs text-[#495057] font-semibold bg-white border border-[#dee2e6] p-2.5 rounded">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-gray-400 block font-bold">FROM</span>
                        <span className="truncate block">{req.fromEmployee}</span>
                        <span className="text-[10px] text-[#6c757d] block font-semibold truncate">({req.fromDepartment})</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-gray-400 block font-bold">TO</span>
                        <span className="truncate block font-bold text-[#212529]">{req.toEmployee}</span>
                        <span className="text-[10px] text-[#6c757d] block font-bold truncate">({req.toDepartment})</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => rejectTransfer(req.id)}
                        className="flex-1 flex items-center justify-center gap-1 hover:border-[#dc3545] hover:text-[#dc3545]"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => approveTransfer(req.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-[#6c757d] hover:bg-[#5a6268] text-white border-transparent"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Return Workflow Modal Confirmation */}
      <Modal
        isOpen={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        title="Check-In / Return Asset"
        description="Verify check-in requirements for resource returning."
      >
        {returnTarget && (
          <div className="space-y-5 select-none">
            <div className="p-4 bg-gray-50 border border-[#dee2e6] rounded-btn text-left space-y-2">
              <div className="text-[15px] font-bold text-[#212529]">{returnTarget.assetName}</div>
              <div className="text-xs text-[#6c757d] font-semibold">
                <span className="block font-bold">Serial Number: {returnTarget.serialNumber}</span>
                <span className="block mt-1">Allocated to: {returnTarget.allocatedTo}</span>
                <span className="block">Department: {returnTarget.department}</span>
                <span className="block">Allocated Date: {returnTarget.allocatedDate}</span>
              </div>
            </div>

            <p className="text-xs text-[#6c757d] text-left leading-relaxed">
              Confirming this return will automatically change the asset's status back to <span className="text-[#198754] font-bold bg-[#198754]/10 px-1.5 py-0.5 rounded">Available</span> and close out the active allocation registry record.
            </p>

            <div className="flex justify-end gap-3 border-t border-[#dee2e6] pt-4 mt-6">
              <Button variant="outline" onClick={() => setReturnTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleReturnConfirm}>
                Confirm Return
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Allocate Asset Modal */}
      <Modal isOpen={isAllocOpen} onClose={() => { setIsAllocOpen(false); setConflictAsset(null); }} title="Allocate Asset">
        <form onSubmit={allocForm.handleSubmit(onAllocateSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[14px] font-semibold text-[#495057]">Select Asset</label>
            <select {...allocForm.register('assetId')} className="h-[44px] px-3.5 bg-white border border-[#ced4da] rounded-input text-[#212529]">
              <option value="">-- Choose Asset --</option>
              {allAssets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.status})</option>
              ))}
            </select>
            {allocForm.formState.errors.assetId && <span className="text-xs text-[#dc3545] font-semibold">{allocForm.formState.errors.assetId.message}</span>}
          </div>
          <Input label="Allocated Employee Name" placeholder="e.g. Jane Cooper" error={allocForm.formState.errors.employee?.message} {...allocForm.register('employee')} list="allocation-employees" />
          <datalist id="allocation-employees">
            {employees.map(e => <option key={e.id} value={e.name} />)}
          </datalist>
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[14px] font-semibold text-[#495057]">Department</label>
            <select {...allocForm.register('department')} className="h-[44px] px-3.5 bg-white border border-[#ced4da] rounded-input text-[#212529]">
              {departments.filter(d => d.status !== 'Inactive').map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {conflictAsset && (
            <div className="p-3 mt-4 bg-orange-50 border border-orange-200 rounded text-left">
              <p className="text-sm text-orange-800 font-semibold mb-2">
                This asset is currently allocated to someone else.
              </p>
              <Button type="button" variant="primary" onClick={handleRequestTransfer} className="w-full justify-center bg-orange-600 hover:bg-orange-700 border-none text-white">
                Request Transfer
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-[#dee2e6] pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => { setIsAllocOpen(false); setConflictAsset(null); }}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={!!conflictAsset}>Allocate</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

