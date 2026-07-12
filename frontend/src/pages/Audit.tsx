import React from 'react';
import { useAppState } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { ClipboardCheck, ShieldAlert, Award, FileSearch, HelpCircle } from 'lucide-react';

export const Audit: React.FC = () => {
  const { audits } = useAppState();

  // Active cycles
  const activeCycle = audits.find(a => a.status === 'In Progress');
  const pastCycles = audits.filter(a => a.status === 'Completed');

  const discrepancyData = [
    { id: '1', assetId: 'AST-005', assetName: 'Cisco Switch', type: 'Location Mismatch', status: 'Pending Review', reportedBy: 'Robert Fox' },
    { id: '2', assetId: 'AST-015', assetName: 'Canon Camera', type: 'Status Conflict', status: 'Marked Lost', reportedBy: 'Darrell Steward' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Asset Compliance Audits"
        description="Verify physical inventory existence, check compliance parameters and log discrepancy reports."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Active Audit Tracker - Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {activeCycle ? (
            <Card
              title={activeCycle.name}
              subtitle={`Auditor: ${activeCycle.auditor}`}
              headerActions={<StatusBadge status="In Progress" />}
            >
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#495057] mb-1.5 select-none">
                    <span>Audit Verification Progress</span>
                    <span>{activeCycle.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden">
                    <div className="bg-[#6c757d] h-full transition-all duration-300" style={{ width: `${activeCycle.progress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center select-none">
                  <div className="bg-gray-50 border border-[#dee2e6] rounded-btn p-3">
                    <span className="text-xs font-semibold text-[#6c757d] block mb-1">Target Assets</span>
                    <span className="text-[20px] font-bold text-[#212529]">45</span>
                  </div>
                  <div className="bg-gray-50 border border-[#dee2e6] rounded-btn p-3">
                    <span className="text-xs font-semibold text-[#6c757d] block mb-1">Verified</span>
                    <span className="text-[20px] font-bold text-[#198754]">20</span>
                  </div>
                  <div className="bg-gray-50 border border-[#dee2e6] rounded-btn p-3">
                    <span className="text-xs font-semibold text-[#6c757d] block mb-1">Missing</span>
                    <span className="text-[20px] font-bold text-[#dc3545]">{activeCycle.missingAssets}</span>
                  </div>
                  <div className="bg-gray-50 border border-[#dee2e6] rounded-btn p-3">
                    <span className="text-xs font-semibold text-[#6c757d] block mb-1">Discrepancies</span>
                    <span className="text-[20px] font-bold text-[#ffc107]">{activeCycle.discrepancies}</span>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card title="Active Audit Cycle">
              <p className="text-[15px] text-[#6c757d] font-semibold">No active audit cycle running currently.</p>
            </Card>
          )}

          {/* Discrepancy Logs */}
          <Card title="Discrepancy Investigation Logs">
            <Table
              data={discrepancyData}
              columns={[
                { header: 'Log ID', accessorKey: 'id' },
                { header: 'Asset Name', accessorKey: 'assetName' },
                { header: 'Discrepancy Type', accessorKey: 'type' },
                { header: 'Status', accessorKey: 'status' },
                { header: 'Assigned Auditor', accessorKey: 'reportedBy' }
              ]}
            />
          </Card>
        </div>

        {/* Auditor List and Audit History - Right Column */}
        <div className="space-y-6">
          <Card title="Compliance Team">
            <div className="space-y-4 select-none">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-[#6c757d]" />
                <div>
                  <h4 className="text-[14px] font-bold text-[#212529]">Robert Fox</h4>
                  <p className="text-[11px] text-[#6c757d] font-medium">Head Auditor - IT Infrastructure</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-[#6c757d]" />
                <div>
                  <h4 className="text-[14px] font-bold text-[#212529]">Darrell Steward</h4>
                  <p className="text-[11px] text-[#6c757d] font-medium">Compliance Officer - Facilities</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Historical Audit Results" className="max-h-[350px] overflow-y-auto">
            <div className="space-y-4">
              {pastCycles.map(cycle => (
                <div key={cycle.id} className="border-b border-[#dee2e6] pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start select-none">
                    <h4 className="text-[14px] font-bold text-[#212529]">{cycle.name}</h4>
                    <StatusBadge status="Completed" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-center text-[11px] font-semibold text-[#6c757d]">
                    <div className="bg-gray-50 border border-[#dee2e6] rounded py-1">
                      <span>Missing</span>
                      <span className="block font-bold text-[#dc3545]">{cycle.missingAssets}</span>
                    </div>
                    <div className="bg-gray-50 border border-[#dee2e6] rounded py-1">
                      <span>Conflict</span>
                      <span className="block font-bold text-[#ffc107]">{cycle.discrepancies}</span>
                    </div>
                    <div className="bg-gray-50 border border-[#dee2e6] rounded py-1">
                      <span>Date</span>
                      <span className="block font-bold text-gray-600">{cycle.endDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
