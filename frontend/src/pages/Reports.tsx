import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { KPICard } from '../components/KPICard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';

const trendData = [
  { month: 'Jan', allocations: 24, returns: 18 },
  { month: 'Feb', allocations: 30, returns: 20 },
  { month: 'Mar', allocations: 45, returns: 28 },
  { month: 'Apr', allocations: 35, returns: 32 },
  { month: 'May', allocations: 55, returns: 40 },
  { month: 'Jun', allocations: 60, returns: 45 },
  { month: 'Jul', allocations: 48, returns: 42 }
];

const categoryData = [
  { name: 'IT Hardware', value: 120500, count: 52 },
  { name: 'Networking', value: 65000, count: 18 },
  { name: 'Facilities', value: 18400, count: 12 },
  { name: 'Furniture', value: 34900, count: 24 },
  { name: 'Accessories', value: 5800, count: 35 }
];

const reportHistory = [
  { id: 'RPT-001', name: 'Q2 2026 Asset Inventory Audit Report', date: '2026-07-01', size: '2.4 MB', author: 'Robert Fox' },
  { id: 'RPT-002', name: 'Corporate Hardware Depreciation Summary', date: '2026-06-15', size: '1.8 MB', author: 'Albert Flores' },
  { id: 'RPT-003', name: 'Facilities Asset Health Analysis', date: '2026-06-02', size: '4.1 MB', author: 'Darrell Steward' },
  { id: 'RPT-004', name: 'FY26 Q1 Capital Investment Log', date: '2026-05-10', size: '1.2 MB', author: 'Bessie Cooper' }
];

const COLORS = ['#6c757d', '#495057', '#343a40', '#212529', '#ced4da'];

export const Reports: React.FC = () => {
  const [dateRange] = useState('Last 30 Days');

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Analytics & Reports"
        description="View enterprise asset distribution, financial value and download detailed compliance logs."
        actions={
          <div className="flex gap-2">
            <div className="flex border border-[#ced4da] rounded-btn overflow-hidden select-none bg-white">
              <button
                value={dateRange}
                className="h-[44px] px-4 bg-transparent border-0 text-[15px] font-semibold text-[#495057] focus:outline-none flex items-center gap-2"
              >
                <Calendar className="w-5 h-5 text-[#6c757d]" />
                {dateRange}
              </button>
            </div>
            <Button variant="primary" className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download All PDF
            </Button>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Capital Investment" value="$244,600" icon={DollarSign} iconBgColor="bg-[#198754]/10" iconColor="text-[#198754]" />
        <KPICard title="Depreciated Value" value="$192,200" icon={TrendingUp} iconBgColor="bg-[#dc3545]/10" iconColor="text-[#dc3545]" />
        <KPICard title="Avg. Asset Lifespan" value="4.8 Years" icon={RefreshCw} iconBgColor="bg-[#0dcaf0]/10" iconColor="text-[#0c8ca7]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Line Chart - Left 2 Columns */}
        <Card title="Allocation & Return Activity" className="lg:col-span-2">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dee2e6" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#6c757d' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#6c757d' }} />
                <Tooltip />
                <Line type="monotone" dataKey="allocations" stroke="#6c757d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="returns" stroke="#ced4da" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category breakdown Pie Chart - Right Column */}
        <Card title="Capital Breakdown">
          <div className="h-[220px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5 mt-4 border-t border-[#dee2e6] pt-4">
            {categoryData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-xs select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-semibold text-gray-700">{cat.name}</span>
                </div>
                <span className="font-bold text-[#212529]">${cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Generated Reports History Log */}
      <Card title="Available Compliance Reports">
        <Table
          data={reportHistory}
          columns={[
            { header: 'Report ID', accessorKey: 'id' },
            { header: 'Report File Name', accessorKey: 'name' },
            { header: 'Published Date', accessorKey: 'date' },
            { header: 'File Size', accessorKey: 'size' },
            { header: 'Generated By', accessorKey: 'author' },
            {
              header: 'Actions',
              accessorKey: 'actions',
              render: () => (
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};
