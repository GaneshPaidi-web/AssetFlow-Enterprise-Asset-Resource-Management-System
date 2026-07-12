import React, { useState } from 'react';
import { useAppState } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
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
import type { Allocation } from '../types';

export const AllocationPage: React.FC = () => {
  const {
    allocations,
    transfers,
    returnAsset,
    approveTransfer,
    rejectTransfer
  } = useAppState();

  // Active state lists
  const activeAllocations = allocations.filter(a => a.status === 'Active');
  const pendingTransfers = transfers.filter(t => t.status === 'Pending');

  // Confirmation Modal for Return Workflow
  const [returnTarget, setReturnTarget] = useState<Allocation | null>(null);

  const handleReturnConfirm = () => {
    if (returnTarget) {
      returnAsset(returnTarget.id);
      setReturnTarget(null);
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
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        <KPICard
          title="Active Corporate Allocations"
          value={totalAllocatedCount}
          icon={TrendingUp}
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
        />
        <KPICard
          title="Pending Transfer Approvals"
          value={pendingTransfersCount}
          icon={RefreshCw}
          iconBgColor="bg-[#d97706]/10"
          iconColor="text-[#d97706]"
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
                { header: 'Allocated Date', accessorKey: 'allocatedDate' },
                {
                  header: 'Actions',
                  accessorKey: 'actions',
                  render: (row) => (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReturnTarget(row)}
                      className="flex items-center gap-1 hover:border-[#dc3545] hover:text-[#dc3545]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Return
                    </Button>
                  )
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
                    className="p-4 bg-slate-50/50 border border-[#f1f5f9] rounded-btn space-y-3.5 select-none"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="text-[14px] font-bold text-[#0f172a] truncate">{req.assetName}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{req.id} • {req.serialNumber}</span>
                      </div>
                      <StatusBadge status="Pending" />
                    </div>

                    {/* Flow */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold bg-white border border-[#f1f5f9] p-2.5 rounded">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-slate-400 block font-bold">FROM</span>
                        <span className="truncate block">{req.fromEmployee}</span>
                        <span className="text-[10px] text-slate-500 block font-semibold truncate">({req.fromDepartment})</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-350 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-slate-400 block font-bold">TO</span>
                        <span className="truncate block font-bold text-[#0f172a]">{req.toEmployee}</span>
                        <span className="text-[10px] text-slate-500 block font-bold truncate">({req.toDepartment})</span>
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
                        className="flex-1 flex items-center justify-center gap-1"
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
            <div className="p-4 bg-slate-50 border border-[#f1f5f9] rounded-btn text-left space-y-2">
              <div className="text-[15px] font-bold text-slate-800">{returnTarget.assetName}</div>
              <div className="text-xs text-slate-550 font-semibold">
                <span className="block font-bold">Serial Number: {returnTarget.serialNumber}</span>
                <span className="block mt-1">Allocated to: {returnTarget.allocatedTo}</span>
                <span className="block">Department: {returnTarget.department}</span>
                <span className="block">Allocated Date: {returnTarget.allocatedDate}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-left leading-relaxed">
              Confirming this return will automatically change the asset's status back to <span className="text-[#16a34a] font-bold bg-[#16a34a]/10 px-1.5 py-0.5 rounded">Available</span> and close out the active allocation registry record.
            </p>

            <div className="flex justify-end gap-3 border-t border-[#f1f5f9] pt-4 mt-6">
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
    </div>
  );
};
