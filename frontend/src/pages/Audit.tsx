import React from 'react';
import { useAppState } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { ClipboardCheck, ShieldAlert, Award, FileSearch, HelpCircle, QrCode, ScanLine } from 'lucide-react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';

export const Audit: React.FC = () => {
  const { audits } = useAppState();
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<string | null>(null);
  const [manualAssetId, setManualAssetId] = React.useState('');

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
              headerActions={
                <div className="flex items-center gap-3">
                  <StatusBadge status="In Progress" />
                  <Button variant="primary" size="sm" onClick={() => { setIsScannerOpen(true); setScanResult(null); }} className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    Scan QR
                  </Button>
                </div>
              }
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

      {/* QR Scanner Modal */}
      <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} title="Scan Asset QR Code" description="Point camera at the asset QR tag or enter ID manually.">
        <div className="space-y-6 select-none">
          {scanResult ? (
            <div className="p-6 bg-green-50 border border-green-200 rounded-btn text-center space-y-3">
              <ClipboardCheck className="w-12 h-12 text-green-600 mx-auto" />
              <h4 className="text-[16px] font-bold text-green-800">Asset Verified!</h4>
              <p className="text-sm text-green-700 font-medium">Asset {scanResult} has been successfully logged in the audit cycle.</p>
              <Button variant="outline" className="mt-4" onClick={() => setScanResult(null)}>Scan Another</Button>
            </div>
          ) : (
            <>
              {/* Mock Camera View */}
              <div className="w-full aspect-video bg-black rounded-btn relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 border-[3px] border-white/20 m-8 rounded" />
                <div className="absolute w-full h-[2px] bg-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                <div className="text-white/50 flex flex-col items-center gap-2">
                  <ScanLine className="w-8 h-8" />
                  <span className="text-sm font-semibold">Camera Active</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <hr className="flex-1 border-[#dee2e6]" />
                <span className="text-xs font-bold text-[#adb5bd] uppercase tracking-wider">Or</span>
                <hr className="flex-1 border-[#dee2e6]" />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input 
                    label="Manual Entry" 
                    placeholder="Enter Asset ID (e.g. AST-001)" 
                    value={manualAssetId} 
                    onChange={(e) => setManualAssetId(e.target.value)} 
                  />
                </div>
                <div className="pt-6">
                  <Button variant="primary" onClick={() => {
                    if (manualAssetId.trim()) {
                      setScanResult(manualAssetId);
                      setManualAssetId('');
                    }
                  }}>Verify</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
