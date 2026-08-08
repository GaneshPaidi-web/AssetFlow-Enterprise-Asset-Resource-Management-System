import React, { useMemo, useState } from 'react';
import { useAppState } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { ClipboardCheck, Award, QrCode, ScanLine } from 'lucide-react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { apiClient } from '../services/apiClient';

export const Audit: React.FC = () => {
  const { audits, employees, assets, syncState } = useAppState();
  const { user } = useAuth();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualAssetId, setManualAssetId] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const activeCycle = audits.find(a => a.status === 'In Progress');
  const pastCycles = audits.filter(a => a.status === 'Completed');

  const auditItems = activeCycle?.auditItems || [];
  const verifiedCount = auditItems.filter(i => i.status === 'Verified').length;
  const targetAssets = assets.length;

  const discrepancyData = useMemo(() =>
    auditItems
      .filter(i => i.status === 'Missing' || i.status === 'Damaged')
      .map(i => ({
        id: i.id,
        assetId: i.asset?.tag || i.assetId,
        assetName: i.asset?.name || i.assetId,
        type: i.status === 'Missing' ? 'Missing Asset' : 'Damaged Asset',
        status: i.status,
        reportedBy: activeCycle?.auditor || '—',
      })),
    [auditItems, activeCycle]
  );

  const complianceTeam = employees.filter(e =>
    ['Admin', 'Asset Manager', 'Department Head'].includes(e.role)
  ).slice(0, 5);

  const resolveAssetId = (input: string) => {
    const trimmed = input.trim();
    const byId = assets.find(a => a.id === trimmed);
    if (byId) return byId.id;
    const byTag = assets.find(a => a.tag === trimmed || a.serialNumber === trimmed);
    return byTag?.id || trimmed;
  };

  const verifyAsset = async (assetInput: string) => {
    if (!activeCycle || !assetInput.trim()) return;
    setVerifyError(null);
    try {
      const assetId = resolveAssetId(assetInput);
      await apiClient.post(`/audits/${activeCycle.id}/items`, {
        assetId,
        status: 'Verified',
      });
      setScanResult(assetInput.trim());
      setManualAssetId('');
      await syncState();
    } catch (e) {
      console.error('Failed to verify', e);
      setVerifyError('Failed to verify asset. Check the asset ID and try again.');
    }
  };

  const handleCloseCycle = async () => {
    if (!activeCycle) return;
    if (!window.confirm(`Close audit cycle "${activeCycle.name}"?`)) return;
    try {
      await apiClient.patch(`/audits/${activeCycle.id}/close`);
      await syncState();
    } catch (e) {
      console.error('Failed to close audit cycle', e);
    }
  };

  const handleStartCycle = async () => {
    const name = `Audit Cycle ${new Date().toISOString().slice(0, 10)}`;
    const today = new Date();
    const end = new Date(today);
    end.setMonth(end.getMonth() + 1);
    try {
      await apiClient.post('/audits', {
        name,
        startDate: today.toISOString(),
        endDate: end.toISOString(),
        auditor: user?.name || 'Admin',
      });
      await syncState();
    } catch (e) {
      console.error('Failed to start audit cycle', e);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Asset Compliance Audits"
        description="Verify physical inventory existence, check compliance parameters and log discrepancy reports."
        actions={
          !activeCycle ? (
            <Button variant="primary" onClick={handleStartCycle}>Start Audit Cycle</Button>
          ) : (
            <Button variant="outline" onClick={handleCloseCycle}>Close Cycle</Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {activeCycle ? (
            <Card
              title={activeCycle.name}
              subtitle={`Auditor: ${activeCycle.auditor}`}
              headerActions={
                <div className="flex items-center gap-3">
                  <StatusBadge status="In Progress" />
                  <Button variant="primary" size="sm" onClick={() => { setIsScannerOpen(true); setScanResult(null); setVerifyError(null); }} className="flex items-center gap-1.5">
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
                    <span className="text-[20px] font-bold text-[#212529]">{targetAssets}</span>
                  </div>
                  <div className="bg-gray-50 border border-[#dee2e6] rounded-btn p-3">
                    <span className="text-xs font-semibold text-[#6c757d] block mb-1">Verified</span>
                    <span className="text-[20px] font-bold text-[#198754]">{verifiedCount}</span>
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

          <Card title="Discrepancy Investigation Logs">
            <Table
              data={discrepancyData}
              emptyMessage="No discrepancies logged for the active audit cycle."
              columns={[
                { header: 'Log ID', accessorKey: 'id' },
                { header: 'Asset Name', accessorKey: 'assetName' },
                { header: 'Discrepancy Type', accessorKey: 'type' },
                { header: 'Status', accessorKey: 'status' },
                { header: 'Assigned Auditor', accessorKey: 'reportedBy' },
              ]}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Compliance Team">
            <div className="space-y-4 select-none">
              {complianceTeam.length === 0 ? (
                <p className="text-xs text-[#6c757d]">No compliance team members found.</p>
              ) : (
                complianceTeam.map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#6c757d]" />
                    <div>
                      <h4 className="text-[14px] font-bold text-[#212529]">{member.name}</h4>
                      <p className="text-[11px] text-[#6c757d] font-medium">{member.role} — {member.department}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="Historical Audit Results" className="max-h-[350px] overflow-y-auto">
            <div className="space-y-4">
              {pastCycles.length === 0 ? (
                <p className="text-xs text-[#6c757d]">No completed audit cycles yet.</p>
              ) : (
                pastCycles.map(cycle => (
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
                        <span className="block font-bold text-gray-600">{cycle.endDate?.slice(0, 10)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

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
              <div className="w-full aspect-video bg-black rounded-btn relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 border-[3px] border-white/20 m-8 rounded" />
                <div className="absolute w-full h-[2px] bg-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                <div className="text-white/50 flex flex-col items-center gap-2">
                  <ScanLine className="w-8 h-8" />
                  <span className="text-sm font-semibold">Enter asset ID below to verify</span>
                </div>
              </div>

              {verifyError && (
                <p className="text-sm text-red-600 font-semibold">{verifyError}</p>
              )}

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    label="Manual Entry"
                    placeholder="Enter Asset ID or Tag"
                    value={manualAssetId}
                    onChange={(e) => setManualAssetId(e.target.value)}
                  />
                </div>
                <div className="pt-6">
                  <Button variant="primary" onClick={() => verifyAsset(manualAssetId)}>Verify</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
