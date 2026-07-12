import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Building2, Layers, Users, Plus, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../services/apiClient';

export const Organization: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'employees'>('departments');

  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const fetchData = async () => {
    try {
      const [deptRes, catRes, empRes] = await Promise.all([
        apiClient.get('/departments'),
        apiClient.get('/categories'),
        apiClient.get('/users')
      ]);
      setDepartments(deptRes.data);
      setCategories(catRes.data);
      setEmployees(empRes.data);
    } catch (e) {
      console.error('Failed to fetch org data', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/departments', { name: newDeptName });
      setIsDeptModalOpen(false);
      setNewDeptName('');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/categories', { name: newCatName, description: newCatDesc });
      setIsCatModalOpen(false);
      setNewCatName('');
      setNewCatDesc('');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiClient.patch(`/users/${userId}/role`, { role: newRole });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Organization Setup"
        description="Configure your corporate departments, asset classifications, and employee directories."
        actions={
          <div className="flex gap-2">
            {activeTab === 'departments' && (
              <Button variant="primary" onClick={() => setIsDeptModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-5 h-5 stroke-[1.75]" /> Add Department
              </Button>
            )}
            {activeTab === 'categories' && (
              <Button variant="primary" onClick={() => setIsCatModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-5 h-5 stroke-[1.75]" /> Add Category
              </Button>
            )}
          </div>
        }
      />

      {/* Tab controls */}
      <div className="flex border-b border-[#dee2e6] select-none gap-2">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-[15px] font-semibold transition-all duration-200 ${
            activeTab === 'departments' ? 'border-[#6c757d] text-[#212529] bg-white rounded-t-btn' : 'border-transparent text-[#6c757d] hover:text-[#212529]'
          }`}
        >
          <Building2 className="w-4.5 h-4.5" /> Departments
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-[15px] font-semibold transition-all duration-200 ${
            activeTab === 'categories' ? 'border-[#6c757d] text-[#212529] bg-white rounded-t-btn' : 'border-transparent text-[#6c757d] hover:text-[#212529]'
          }`}
        >
          <Layers className="w-4.5 h-4.5" /> Asset Categories
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-[15px] font-semibold transition-all duration-200 ${
            activeTab === 'employees' ? 'border-[#6c757d] text-[#212529] bg-white rounded-t-btn' : 'border-transparent text-[#6c757d] hover:text-[#212529]'
          }`}
        >
          <Users className="w-4.5 h-4.5" /> Employees
        </button>
      </div>

      {/* Tab Content */}
      <Card className="p-0 border-t-transparent rounded-t-none">
        {activeTab === 'departments' && (
          <Table
            data={departments}
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
            data={categories}
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
            data={employees}
            columns={[
              { header: 'Employee Name', accessorKey: 'name' },
              { header: 'Corporate Email', accessorKey: 'email' },
              { header: 'Role', accessorKey: 'role' },
              {
                header: 'Promote Role',
                accessorKey: 'actions',
                render: (row) => (
                  <select
                    value={row.role}
                    onChange={(e) => handleRoleChange(row.id, e.target.value)}
                    className="h-8 px-2 bg-white border border-[#ced4da] rounded text-[13px] text-[#212529]"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Department Head">Department Head</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                )
              }
            ]}
          />
        )}
      </Card>

      {/* Modals */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title="Add Department" description="Create a new corporate department.">
        <form onSubmit={handleCreateDept} className="space-y-4">
          <Input label="Department Name" placeholder="e.g. Finance" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} required />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsDeptModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title="Add Category" description="Create a new asset classification.">
        <form onSubmit={handleCreateCat} className="space-y-4">
          <Input label="Category Name" placeholder="e.g. Monitors" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required />
          <Input label="Description" placeholder="Optional notes" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsCatModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
