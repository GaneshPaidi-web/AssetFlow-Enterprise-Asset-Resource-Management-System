import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { Building2, Layers, Users, Plus } from 'lucide-react';

export const Organization: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'employees'>('departments');

  const departmentsData = [
    { id: '1', name: 'Engineering', code: 'ENG', manager: 'Jane Cooper', assetsCount: 12, budget: '$45,000' },
    { id: '2', name: 'Marketing', code: 'MKT', manager: 'Albert Flores', assetsCount: 8, budget: '$20,000' },
    { id: '3', name: 'HR', code: 'HRD', manager: 'Kristin Watson', assetsCount: 6, budget: '$12,500' },
    { id: '4', name: 'Finance', code: 'FIN', manager: 'Bessie Cooper', assetsCount: 4, budget: '$15,000' },
    { id: '5', name: 'Product', code: 'PRD', manager: 'John Doe', assetsCount: 7, budget: '$30,000' }
  ];

  const categoriesData = [
    { id: '1', name: 'IT Hardware', description: 'Laptops, mobile devices, monitors and local workstations', depreciationRate: '20% / yr', totalValue: '$120,500' },
    { id: '2', name: 'Networking', description: 'Switches, routers, firewalls, and server rack accessories', depreciationRate: '15% / yr', totalValue: '$65,000' },
    { id: '3', name: 'Facilities', description: 'Projectors, display screens, smartboards, and AV equipment', depreciationRate: '10% / yr', totalValue: '$18,400' },
    { id: '4', name: 'Furniture', description: 'Office desks, ergonomic task chairs, and boardroom tables', depreciationRate: '5% / yr', totalValue: '$34,900' },
    { id: '5', name: 'Accessories', description: 'Keyboards, mice, adapters, cables and docking stations', depreciationRate: '30% / yr', totalValue: '$5,800' }
  ];

  const employeesData = [
    { id: '1', name: 'Jane Cooper', email: 'jane.cooper@assetflow.com', department: 'Engineering', role: 'Engineering Lead', allocatedAssets: 3 },
    { id: '2', name: 'John Doe', email: 'john.doe@assetflow.com', department: 'Product', role: 'Product Manager', allocatedAssets: 2 },
    { id: '3', name: 'Albert Flores', email: 'albert.flores@assetflow.com', department: 'Finance', role: 'Financial Analyst', allocatedAssets: 1 },
    { id: '4', name: 'Kristin Watson', email: 'kristin.watson@assetflow.com', department: 'HR', role: 'HR Specialist', allocatedAssets: 1 },
    { id: '5', name: 'Cody Fisher', email: 'cody.fisher@assetflow.com', department: 'Sales', role: 'Sales Executive', allocatedAssets: 0 }
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Organization Setup"
        description="Configure your corporate departments, asset classifications, and employee directories."
        actions={
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-5 h-5 stroke-[1.75]" />
            Add New Item
          </Button>
        }
      />

      {/* Tab controls */}
      <div className="flex border-b border-[#dee2e6] select-none gap-2">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-[15px] font-semibold transition-all duration-200 ${
            activeTab === 'departments'
              ? 'border-[#6c757d] text-[#212529] bg-white rounded-t-btn'
              : 'border-transparent text-[#6c757d] hover:text-[#212529]'
          }`}
        >
          <Building2 className="w-4.5 h-4.5" />
          Departments
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-[15px] font-semibold transition-all duration-200 ${
            activeTab === 'categories'
              ? 'border-[#6c757d] text-[#212529] bg-white rounded-t-btn'
              : 'border-transparent text-[#6c757d] hover:text-[#212529]'
          }`}
        >
          <Layers className="w-4.5 h-4.5" />
          Asset Categories
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-[15px] font-semibold transition-all duration-200 ${
            activeTab === 'employees'
              ? 'border-[#6c757d] text-[#212529] bg-white rounded-t-btn'
              : 'border-transparent text-[#6c757d] hover:text-[#212529]'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          Employees
        </button>
      </div>

      {/* Tab Content */}
      <Card className="p-0 border-t-transparent rounded-t-none">
        {activeTab === 'departments' && (
          <Table
            data={departmentsData}
            columns={[
              { header: 'Department Name', accessorKey: 'name' },
              { header: 'Code', accessorKey: 'code' },
              { header: 'Manager / Lead', accessorKey: 'manager' },
              { header: 'Registered Assets', accessorKey: 'assetsCount' },
              { header: 'Annual Budget', accessorKey: 'budget' }
            ]}
          />
        )}

        {activeTab === 'categories' && (
          <Table
            data={categoriesData}
            columns={[
              { header: 'Category Name', accessorKey: 'name' },
              { header: 'Description', accessorKey: 'description', className: 'max-w-xs truncate' },
              { header: 'Depreciation Rate', accessorKey: 'depreciationRate' },
              { header: 'Total Capital Value', accessorKey: 'totalValue' }
            ]}
          />
        )}

        {activeTab === 'employees' && (
          <Table
            data={employeesData}
            columns={[
              { header: 'Employee Name', accessorKey: 'name' },
              { header: 'Corporate Email', accessorKey: 'email' },
              { header: 'Department', accessorKey: 'department' },
              { header: 'Corporate Role', accessorKey: 'role' },
              { header: 'Allocated Assets', accessorKey: 'allocatedAssets' }
            ]}
          />
        )}
      </Card>
    </div>
  );
};
