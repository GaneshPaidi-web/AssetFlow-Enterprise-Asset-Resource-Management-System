import React, { useState } from 'react';
import { useAppState } from '../contexts/AppContext';
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
import { Wrench, ShieldAlert, CheckCircle, Activity, Heart, Plus, Search, Grid, List } from 'lucide-react';

const maintenanceSchema = z.object({
  assetId: z.string().min(1, { message: 'Asset is required' }),
  description: z.string().min(5, { message: 'Provide a descriptive failure summary' }),
  priority: z.enum(['Low', 'Medium', 'High']),
});

type MaintenanceFormSchema = z.infer<typeof maintenanceSchema>;

export const Maintenance: React.FC = () => {
  const { maintenance, assets, requestMaintenance } = useAppState();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MaintenanceFormSchema>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: { priority: 'Medium' }
  });

  const onSubmit = (data: MaintenanceFormSchema) => {
    requestMaintenance(data.assetId, data.description, data.priority);
    setIsModalOpen(false);
    reset();
  };

  // KPIs
  const totalRequests = maintenance.length;
  const countPending = maintenance.filter(m => m.status === 'Pending').length;
  const countInProgress = maintenance.filter(m => m.status === 'In Progress').length;
  const countCompleted = maintenance.filter(m => m.status === 'Completed').length;

  // Filter available assets to repair (not currently in repair)
  const repairableAssets = assets.filter(a => a.status !== 'Maintenance');

  const filteredRequests = maintenance.filter(m =>
    m.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.assetId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRequests.map(ticket => (
                <Card key={ticket.id} title={ticket.assetName} subtitle={`Ticket ID: ${ticket.id}`} headerActions={<StatusBadge status={ticket.status} />}>
                  <div className="space-y-4">
                    <p className="text-[14px] text-[#495057] font-semibold italic">"{ticket.description}"</p>
                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#dee2e6] pt-3 text-[#6c757d]">
                      <div>
                        <span className="font-semibold text-gray-500 block">Priority</span>
                        <span className={`font-bold ${ticket.priority === 'High' ? 'text-red-500' : 'text-gray-700'}`}>{ticket.priority}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-500 block">Requested Date</span>
                        <span className="font-bold text-gray-700">{ticket.requestedDate}</span>
                      </div>
                    </div>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dee2e6]">
                  {filteredRequests.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 font-bold">{ticket.id}</td>
                      <td className="py-4 px-6 font-semibold">{ticket.assetName} <span className="text-xs text-gray-400 block">{ticket.assetId}</span></td>
                      <td className="py-4 px-6 font-semibold text-gray-700">{ticket.priority}</td>
                      <td className="py-4 px-6"><StatusBadge status={ticket.status} /></td>
                      <td className="py-4 px-6 font-semibold text-gray-700">{ticket.requestedDate}</td>
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
                  <h4 className="text-[20px] font-bold text-[#212529]">94.2%</h4>
                  <p className="text-xs text-[#6c757d] font-semibold">Overall Corporate Facility Health</p>
                </div>
              </div>

              <div className="space-y-3.5 border-t border-[#dee2e6] pt-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#495057] mb-1">
                    <span>San Francisco HQ</span>
                    <span>98.1%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#198754] h-full" style={{ width: '98.1%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#495057] mb-1">
                    <span>London Server Hub</span>
                    <span>91.4%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#ffc107] h-full" style={{ width: '91.4%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#495057] mb-1">
                    <span>New York Workspace</span>
                    <span>93.0%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#198754] h-full" style={{ width: '93%' }} />
                  </div>
                </div>
              </div>
            </div>
          </Card>
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
            <Button type="submit" variant="primary">
              Raise Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
