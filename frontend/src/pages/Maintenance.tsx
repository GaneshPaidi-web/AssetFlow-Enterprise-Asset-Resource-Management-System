import React, { useState, useMemo } from 'react';
import { useAppState } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { KPICard } from '../components/KPICard';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wrench, ShieldAlert, CheckCircle, Activity, Heart, Plus, Search, Grid, List, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import type { MaintenanceRequest } from '../types';

const maintenanceSchema = z.object({
  assetId: z.string().min(1, { message: 'Asset is required' }),
  description: z.string().min(5, { message: 'Provide a descriptive failure summary' }),
  priority: z.enum(['Low', 'Medium', 'High']),
});

type MaintenanceFormSchema = z.infer<typeof maintenanceSchema>;

export const Maintenance: React.FC = () => {
  const { maintenance, assets, requestMaintenance, approveMaintenance, rejectMaintenance, resolveMaintenance, allocations } = useAppState();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isManager = ['Admin', 'Asset Manager'].includes(user?.role || '');
  const isEmployee = user?.role === 'Employee';

  // Form setup
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MaintenanceFormSchema>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: { priority: 'Medium' }
  });

  const onSubmit = async (data: MaintenanceFormSchema) => {
    try {
      await requestMaintenance(data.assetId, data.description, data.priority);
      setIsModalOpen(false);
      reset();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (ticket: MaintenanceRequest) => {
    setActionLoading(ticket.id + '_approve');
    try {
      await approveMaintenance(ticket.id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (ticket: MaintenanceRequest) => {
    setActionLoading(ticket.id + '_reject');
    try {
      await rejectMaintenance(ticket.id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (ticket: MaintenanceRequest) => {
    setActionLoading(ticket.id + '_resolve');
    try {
      await resolveMaintenance(ticket.id);
    } finally {
      setActionLoading(null);
    }
  };

  // KPIs
  const facilityHealth = assets.length
    ? Math.round(((assets.length - assets.filter(a => String(a.status).includes('Maintenance')).length) / assets.length) * 1000) / 10
    : 100;

  const siteHealth = useMemo(() => {
    const sites = [...new Set(assets.map(a => a.location).filter(Boolean))];
    return sites.slice(0, 3).map(site => {
      const siteAssets = assets.filter(a => a.location === site);
      const unhealthy = siteAssets.filter(a => String(a.status).includes('Maintenance')).length;
      const value = siteAssets.length ? Math.round(((siteAssets.length - unhealthy) / siteAssets.length) * 1000) / 10 : 100;
      return { label: site, value, color: value >= 95 ? '#198754' : value >= 85 ? '#ffc107' : '#dc3545' };
    });
  }, [assets]);

  const totalRequests = maintenance.length;
  const countPending = maintenance.filter(m => m.status === 'Pending').length;
  const countInProgress = maintenance.filter(m => m.status === 'In Progress').length;
  const countCompleted = maintenance.filter(m => m.status === 'Completed').length;

  // Filter assets for the raise ticket form
  const repairableAssets = assets.filter(a => a.status !== 'Maintenance');

  // Filter tickets — employees see tickets for assets allocated to them
  const visibleMaintenance = isEmployee && user?.name
    ? maintenance.filter(m => {
        const alloc = allocations.find(a => a.assetId === m.assetId && a.status === 'Active');
        return alloc?.allocatedTo === user.name;
      })
    : maintenance;

  const filteredRequests = visibleMaintenance.filter(m =>
    m.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.assetId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render action buttons for a ticket (manager only)
  const renderManagerActions = (ticket: MaintenanceRequest) => {
    if (!isManager) return null;
    const baseLoading = (key: string) => actionLoading === ticket.id + '_' + key;

    return (
      <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-[#dee2e6]">
        {ticket.status === 'Pending' && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleApprove(ticket)}
              disabled={baseLoading('approve')}
              className="flex items-center gap-1 bg-[#198754] border-transparent hover:bg-[#157347] text-white"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {baseLoading('approve') ? 'Processing...' : 'Approve'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReject(ticket)}
              disabled={baseLoading('reject')}
              className="flex items-center gap-1 hover:border-[#dc3545] hover:text-[#dc3545]"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              {baseLoading('reject') ? 'Processing...' : 'Reject'}
            </Button>
          </>
        )}
        {(ticket.status === 'Approved' || ticket.status === 'In Progress') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleResolve(ticket)}
            disabled={baseLoading('resolve')}
            className="flex items-center gap-1 bg-[#0d6efd] border-transparent hover:bg-[#0b5ed7] text-white"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {baseLoading('resolve') ? 'Processing...' : 'Mark Resolved'}
          </Button>
        )}
        {ticket.status === 'Rejected' && (
          <span className="text-xs text-[#dc3545] font-bold">Ticket Rejected</span>
        )}
        {ticket.status === 'Completed' && (
          <span className="text-xs text-[#198754] font-bold">✓ Resolved</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Asset Maintenance"
        description="Track physical asset health, schedules, diagnostic reports, and repairs."
        actions={
          <div className="flex gap-2">
            <div className="flex border border-[#ced4da] rounded-btn overflow-hidden select-none bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-all duration-200 ${viewMode === 'grid' ? 'bg-[#6c757d]/10 text-[#212529]' : 'text-[#6c757d]'}`}
              >
                <Grid className="w-5 h-5 stroke-[1.75]" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-all duration-200 ${viewMode === 'list' ? 'bg-[#6c757d]/10 text-[#212529]' : 'text-[#6c757d]'}`}
              >
                <List className="w-5 h-5 stroke-[1.75]" />
              </button>
            </div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Raise Ticket
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Tickets" value={totalRequests} icon={Wrench} iconBgColor="bg-[#e9ecef]" iconColor="text-[#6c757d]" />
        <KPICard title="Pending Review" value={countPending} icon={ShieldAlert} iconBgColor="bg-[#ffc107]/10" iconColor="text-[#b25e00]" />
        <KPICard title="In Progress" value={countInProgress} icon={Activity} iconBgColor="bg-[#0dcaf0]/10" iconColor="text-[#0c8ca7]" />
        <KPICard title="Resolved Logs" value={countCompleted} icon={CheckCircle} iconBgColor="bg-[#198754]/10" iconColor="text-[#198754]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main requests block */}
        <div className="lg:col-span-2 space-y-6">
          {/* Toolbar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c757d]" />
            <input
              type="text"
              placeholder="Search by ticket ID or asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-white border border-[#ced4da] rounded-input text-[#212529] placeholder-[#6c757d]/70 text-[15px] focus:outline-none"
            />
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-10 bg-white border border-[#dee2e6] rounded-card shadow-custom">
              <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-[#6c757d] font-semibold">No maintenance tickets found.</p>
            </div>
          )}

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRequests.map(ticket => (
                <Card
                  key={ticket.id}
                  title={ticket.assetName}
                  subtitle={`Ticket ID: ${ticket.id}`}
                  headerActions={<StatusBadge status={ticket.status} />}
                >
                  <div className="space-y-4">
                    <p className="text-[14px] text-[#495057] font-semibold italic">"{ticket.description}"</p>
                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#dee2e6] pt-3 text-[#6c757d]">
                      <div>
                        <span className="font-semibold text-gray-500 block">Priority</span>
                        <span className={`font-bold ${ticket.priority === 'High' ? 'text-red-500' : ticket.priority === 'Medium' ? 'text-[#b25e00]' : 'text-gray-700'}`}>{ticket.priority}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-500 block">Requested Date</span>
                        <span className="font-bold text-gray-700">{ticket.requestedDate ? new Date(ticket.requestedDate).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                    {/* Manager action buttons */}
                    {renderManagerActions(ticket)}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#dee2e6] rounded-card shadow-custom overflow-hidden">
              <table className="w-full text-left border-collapse text-tableBody">
                <thead className="bg-[#e9ecef]/50 border-b border-[#dee2e6] text-[#495057]">
                  <tr>
                    <th className="py-4 px-6 font-semibold">Ticket ID</th>
                    <th className="py-4 px-6 font-semibold">Asset ID/Name</th>
                    <th className="py-4 px-6 font-semibold">Priority</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold">Requested</th>
                    {isManager && <th className="py-4 px-6 font-semibold">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dee2e6]">
                  {filteredRequests.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 font-bold text-[#212529]">{ticket.id}</td>
                      <td className="py-4 px-6 font-semibold">
                        {ticket.assetName}
                        <span className="text-xs text-gray-400 block">{ticket.assetId}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-bold text-sm ${ticket.priority === 'High' ? 'text-[#dc3545]' : ticket.priority === 'Medium' ? 'text-[#b25e00]' : 'text-gray-600'}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6"><StatusBadge status={ticket.status} /></td>
                      <td className="py-4 px-6 font-semibold text-gray-700">
                        {ticket.requestedDate ? new Date(ticket.requestedDate).toLocaleDateString() : '—'}
                      </td>
                      {isManager && (
                        <td className="py-4 px-6">
                          <div className="flex gap-2 flex-wrap">
                            {ticket.status === 'Pending' && (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleApprove(ticket)}
                                  disabled={actionLoading === ticket.id + '_approve'}
                                  className="flex items-center gap-1 bg-[#198754] border-transparent hover:bg-[#157347] text-white"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(ticket)}
                                  disabled={actionLoading === ticket.id + '_reject'}
                                  className="flex items-center gap-1 hover:border-[#dc3545] hover:text-[#dc3545]"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {(ticket.status === 'Approved' || ticket.status === 'In Progress') && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleResolve(ticket)}
                                disabled={actionLoading === ticket.id + '_resolve'}
                                className="flex items-center gap-1 bg-[#0d6efd] border-transparent hover:bg-[#0b5ed7] text-white"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Resolve
                              </Button>
                            )}
                            {(ticket.status === 'Rejected' || ticket.status === 'Completed') && (
                              <StatusBadge status={ticket.status} />
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Facility Health summary panel */}
        <div className="space-y-6">
          <Card title="Facility Health Index">
            <div className="space-y-5 select-none">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-[#dc3545] fill-[#dc3545]/10 stroke-[1.75]" />
                <div>
                  <h4 className="text-[20px] font-bold text-[#212529]">{facilityHealth}%</h4>
                  <p className="text-xs text-[#6c757d] font-semibold">Overall Corporate Facility Health</p>
                </div>
              </div>

              <div className="space-y-3.5 border-t border-[#dee2e6] pt-4">
                {siteHealth.length === 0 ? (
                  <p className="text-xs text-[#6c757d]">No site data available.</p>
                ) : (
                  siteHealth.map(site => (
                    <div key={site.label}>
                      <div className="flex items-center justify-between text-xs font-bold text-[#495057] mb-1">
                        <span>{site.label}</span>
                        <span>{site.value}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${site.value}%`, backgroundColor: site.color }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Status breakdown card */}
          {isManager && (
            <Card title="Ticket Workflow">
              <div className="space-y-3 text-xs text-[#6c757d] select-none">
                {[
                  { label: 'Pending → Approved', color: 'bg-[#ffc107]' },
                  { label: 'Approved → In Progress', color: 'bg-[#0dcaf0]' },
                  { label: 'In Progress → Resolved', color: 'bg-[#198754]' },
                  { label: 'Pending → Rejected', color: 'bg-[#dc3545]' },
                ].map(step => (
                  <div key={step.label} className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${step.color}`} />
                    <span className="font-semibold">{step.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {isEmployee && (
            <Card title="Your Submissions">
              <p className="text-xs text-[#6c757d] font-semibold">
                You can raise maintenance tickets for any asset. Tickets will be reviewed by an Asset Manager.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Raise Ticket Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise Maintenance Ticket" description="Mark an asset as damaged or register a regular diagnostics check.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[14px] font-semibold text-[#495057]">Select Asset</label>
            <select
              {...register('assetId')}
              className="h-[44px] px-3.5 bg-white border border-[#ced4da] rounded-input text-[#212529] focus:outline-none"
            >
              <option value="">-- Choose Asset --</option>
              {repairableAssets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
              ))}
            </select>
            {errors.assetId && <span className="text-xs text-[#dc3545] font-semibold">{errors.assetId.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[14px] font-semibold text-[#495057]">Diagnostic Summary</label>
            <textarea
              placeholder="e.g. Channel 3 fails calibration loops."
              rows={3}
              className="w-full p-3 bg-white border border-[#ced4da] rounded-input text-[#212529] placeholder-[#6c757d]/70 text-[15px] focus:outline-none focus:border-[#6c757d]"
              {...register('description')}
            />
            {errors.description && <span className="text-xs text-[#dc3545] font-semibold">{errors.description.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[14px] font-semibold text-[#495057]">Ticket Priority</label>
            <select
              {...register('priority')}
              className="h-[44px] px-3.5 bg-white border border-[#ced4da] rounded-input text-[#212529] focus:outline-none"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#dee2e6] pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Raise Ticket'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

