import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { KPICard } from '../components/KPICard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import type { ActivityLog } from '../types';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#f43f5e'];

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [reportsRes, logsRes] = await Promise.all([
          apiClient.get('/analytics/reports'),
          apiClient.get('/activity-logs'),
        ]);
        setReportData(reportsRes.data);
        setActivityLogs(logsRes.data || []);
      } catch (e) {
        console.error('Failed to fetch reports', e);
      }
    };
    fetchReports();
  }, []);

  const totalCapital = reportData?.totalCapital || 0;

  const depreciatedValue = useMemo(() => {
    const breakdown = reportData?.categoryBreakdown || [];
    if (!breakdown.length || totalCapital === 0) return 0;
    let remaining = 0;
    breakdown.forEach((cat: { value: number; depreciationRate?: number | null }) => {
      const rate = cat.depreciationRate ?? 0;
      remaining += cat.value * (1 - rate / 100);
    });
    return Math.round(remaining);
  }, [reportData, totalCapital]);

  const avgLifespan = useMemo(() => {
    const breakdown = reportData?.categoryBreakdown || [];
    const rates = breakdown
      .map((c: { depreciationRate?: number | null }) => c.depreciationRate)
      .filter((r: number | null | undefined) => r != null && r > 0) as number[];
    if (!rates.length) return '—';
    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    return avgRate > 0 ? `${(100 / avgRate).toFixed(1)} Years` : '—';
  }, [reportData]);

  const categoryData = reportData?.categoryBreakdown || [];
  const trendData = reportData?.allocationTrend || [];

  const reportHistory = activityLogs
    .filter(log => /audit|report|compliance|depreciation|capital/i.test(log.action + log.description))
    .slice(0, 10)
    .map(log => ({
      id: log.id,
      name: log.description,
      date: log.createdAt?.slice(0, 10) || '—',
      size: '—',
      author: log.action,
    }));

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Analytics & Reports"
        description="View enterprise asset distribution, financial value and download detailed compliance logs."
        actions={
          <div className="flex border border-slate-200 rounded-btn overflow-hidden select-none bg-white shadow-sm">
            <div className="h-[44px] px-4 bg-transparent text-[15px] font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Live Data
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Capital Investment" value={`$${totalCapital.toLocaleString()}`} icon={DollarSign} iconBgColor="bg-[#10b981]/10" iconColor="text-[#10b981]" />
        <KPICard title="Depreciated Value" value={`$${depreciatedValue.toLocaleString()}`} icon={TrendingUp} iconBgColor="bg-destructive/10" iconColor="text-destructive" />
        <KPICard title="Avg. Asset Lifespan" value={avgLifespan} icon={RefreshCw} iconBgColor="bg-primary/10" iconColor="text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Allocation & Return Activity" className="lg:col-span-2">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#94a3b8' }} />
                <Tooltip />
                <Line type="monotone" dataKey="allocations" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="returns" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Capital Breakdown">
          <div className="h-[220px] w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((_: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400">No data available</p>
            )}
          </div>
          <div className="space-y-2.5 mt-4 border-t border-[#f1f5f9] pt-4">
            {categoryData.map((cat: { name: string; value: number }, idx: number) => (
              <div key={cat.name} className="flex items-center justify-between text-xs select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-semibold text-slate-650">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-800">${cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Compliance Activity Log">
        <Table
          data={reportHistory}
          emptyMessage="No compliance activity logged yet."
          columns={[
            { header: 'Log ID', accessorKey: 'id' },
            { header: 'Activity', accessorKey: 'name', className: 'max-w-md truncate' },
            { header: 'Date', accessorKey: 'date' },
            { header: 'Type', accessorKey: 'author' },
          ]}
        />
      </Card>
    </div>
  );
};
