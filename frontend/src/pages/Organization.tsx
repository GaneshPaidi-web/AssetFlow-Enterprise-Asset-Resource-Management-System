import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { StatusBadge } from '../components/StatusBadge';
import { Building2, Layers, Users, Plus, Edit2, X } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface Department {
  id: string;
  name: string;
  code: string | null;
  status: string;
  manager: string;
  managerId: string | null;
  employeeCount: number;
  assetsCount: number;
  totalValue: number;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  warrantyPeriod: number | null;
  depreciationRate: number | null;
  assetsCount: number;
  totalValue: number;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  departmentId: string | null;
  status: string;
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatPercent = (value: number | null) =>
  value != null ? `${value}%` : '—';

export const Organization: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'employees'>('departments');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [deptForm, setDeptForm] = useState({ name: '', code: '', managerId: '' });
  const [catForm, setCatForm] = useState({ name: '', description: '', depreciationRate: '', warrantyPeriod: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const managerOptions = useMemo(
    () => employees.filter(e => ['Admin', 'Asset Manager', 'Department Head'].includes(e.role)),
    [employees]
  );

  const fetchData = useCallback(async () => {
    setFetchError(null);
    try {
      const [deptRes, catRes, empRes] = await Promise.all([
        apiClient.get<Department[]>('/departments'),
        apiClient.get<Category[]>('/categories'),
        apiClient.get<Employee[]>('/users'),
      ]);
      setDepartments(deptRes.data);
      setCategories(catRes.data);
      setEmployees(empRes.data);
    } catch (e) {
      console.error('Failed to fetch org data', e);
      setFetchError('Failed to load organization data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetDeptForm = () => {
    setDeptForm({ name: '', code: '', managerId: '' });
    setEditingDept(null);
    setFormError(null);
  };

  const resetCatForm = () => {
    setCatForm({ name: '', description: '', depreciationRate: '', warrantyPeriod: '' });
    setEditingCat(null);
    setFormError(null);
  };

  const openCreateDept = () => {
    resetDeptForm();
    setIsDeptModalOpen(true);
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code || '',
      managerId: dept.managerId || '',
    });
    setFormError(null);
    setIsDeptModalOpen(true);
  };

  const openCreateCat = () => {
    resetCatForm();
    setIsCatModalOpen(true);
  };

  const openEditCat = (cat: Category) => {
    setEditingCat(cat);
    setCatForm({
      name: cat.name,
      description: cat.description || '',
      depreciationRate: cat.depreciationRate != null ? String(cat.depreciationRate) : '',
      warrantyPeriod: cat.warrantyPeriod != null ? String(cat.warrantyPeriod) : '',
    });
    setFormError(null);
    setIsCatModalOpen(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim()) {
      setFormError('Department name is required.');
      return;
    }

    const payload = {
      name: deptForm.name.trim(),
      code: deptForm.code.trim() || null,
      managerId: deptForm.managerId || null,
    };

    try {
      if (editingDept) {
        await apiClient.patch(`/departments/${editingDept.id}`, payload);
      } else {
        await apiClient.post('/departments', payload);
      }
      setIsDeptModalOpen(false);
      resetDeptForm();
      await fetchData();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setFormError(message || 'Failed to save department.');
    }
  };

  const handleDeactivateDept = async (dept: Department) => {
    if (dept.status === 'Inactive') return;
    if (!window.confirm(`Deactivate "${dept.name}"?`)) return;
    try {
      await apiClient.patch(`/departments/${dept.id}/deactivate`);
      await fetchData();
    } catch (e) {
      console.error('Failed to deactivate department', e);
    }
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    const payload = {
      name: catForm.name.trim(),
      description: catForm.description.trim() || null,
      depreciationRate: catForm.depreciationRate ? parseFloat(catForm.depreciationRate) : null,
      warrantyPeriod: catForm.warrantyPeriod ? parseInt(catForm.warrantyPeriod, 10) : null,
    };

    try {
      if (editingCat) {
        await apiClient.patch(`/categories/${editingCat.id}`, payload);
      } else {
        await apiClient.post('/categories', payload);
      }
      setIsCatModalOpen(false);
      resetCatForm();
      await fetchData();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setFormError(message || 'Failed to save category.');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiClient.patch(`/users/${userId}/role`, { role: newRole });
      await fetchData();
    } catch (e) {
      console.error('Failed to update role', e);
    }
  };

  const handleDepartmentChange = async (userId: string, departmentId: string) => {
    try {
      await apiClient.patch(`/users/${userId}/department`, {
        departmentId: departmentId || null,
      });
      await fetchData();
    } catch (e) {
      console.error('Failed to update department', e);
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
              <Button variant="primary" onClick={openCreateDept} className="flex items-center gap-2">
                <Plus className="w-5 h-5 stroke-[1.75]" /> Add Department
              </Button>
            )}
            {activeTab === 'categories' && (
              <Button variant="primary" onClick={openCreateCat} className="flex items-center gap-2">
                <Plus className="w-5 h-5 stroke-[1.75]" /> Add Category
              </Button>
            )}
          </div>
        }
      />

      {fetchError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-600 font-semibold">
          <X className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

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

      <Card className="p-0 border-t-transparent rounded-t-none">
        {activeTab === 'departments' && (
          <Table
            data={departments}
            loading={loading}
            emptyMessage="No departments found. Create one to get started."
            columns={[
              { header: 'Department Name', accessorKey: 'name' },
              { header: 'Code', accessorKey: 'code', render: (row) => row.code || '—' },
              { header: 'Manager / Lead', accessorKey: 'manager' },
              { header: 'Employees', accessorKey: 'employeeCount' },
              { header: 'Registered Assets', accessorKey: 'assetsCount' },
              {
                header: 'Total Asset Value',
                accessorKey: 'totalValue',
                render: (row) => formatCurrency(row.totalValue),
              },
              {
                header: 'Status',
                accessorKey: 'status',
                render: (row) => (
                  <StatusBadge status={row.status === 'Active' ? 'Available' : 'Disposed'} />
                ),
              },
              {
                header: 'Actions',
                accessorKey: 'actions',
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditDept(row)}
                      className="p-2 text-[#6c757d] hover:text-[#0d6efd] hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit department"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {row.status === 'Active' && (
                      <button
                        onClick={() => handleDeactivateDept(row)}
                        className="text-[12px] font-semibold text-[#dc3545] hover:underline"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}

        {activeTab === 'categories' && (
          <Table
            data={categories}
            loading={loading}
            emptyMessage="No asset categories found. Create one to get started."
            columns={[
              { header: 'Category Name', accessorKey: 'name' },
              {
                header: 'Description',
                accessorKey: 'description',
                className: 'max-w-xs truncate',
                render: (row) => row.description || '—',
              },
              {
                header: 'Depreciation Rate',
                accessorKey: 'depreciationRate',
                render: (row) => formatPercent(row.depreciationRate),
              },
              { header: 'Assets', accessorKey: 'assetsCount' },
              {
                header: 'Total Capital Value',
                accessorKey: 'totalValue',
                render: (row) => formatCurrency(row.totalValue),
              },
              {
                header: 'Actions',
                accessorKey: 'actions',
                render: (row) => (
                  <button
                    onClick={() => openEditCat(row)}
                    className="p-2 text-[#6c757d] hover:text-[#0d6efd] hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                ),
              },
            ]}
          />
        )}

        {activeTab === 'employees' && (
          <Table
            data={employees}
            loading={loading}
            emptyMessage="No employees found."
            columns={[
              { header: 'Employee Name', accessorKey: 'name' },
              { header: 'Corporate Email', accessorKey: 'email' },
              { header: 'Role', accessorKey: 'role' },
              {
                header: 'Department',
                accessorKey: 'department',
                render: (row) => (
                  <select
                    value={row.departmentId || ''}
                    onChange={(e) => handleDepartmentChange(row.id, e.target.value)}
                    className="h-8 px-2 bg-white border border-[#ced4da] rounded text-[13px] text-[#212529] max-w-[180px]"
                  >
                    <option value="">Unassigned</option>
                    {departments.filter(d => d.status === 'Active').map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                ),
              },
              {
                header: 'Status',
                accessorKey: 'status',
                render: (row) => (
                  <StatusBadge status={row.status === 'Active' ? 'Available' : 'Disposed'} />
                ),
              },
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
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => { setIsDeptModalOpen(false); resetDeptForm(); }}
        title={editingDept ? 'Edit Department' : 'Add Department'}
        description={editingDept ? 'Update department details and manager assignment.' : 'Create a new corporate department.'}
      >
        <form onSubmit={handleSaveDept} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-600 font-semibold">
              <X className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}
          <Input
            label="Department Name"
            placeholder="e.g. Finance"
            value={deptForm.name}
            onChange={(e) => setDeptForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Department Code"
            placeholder="e.g. FIN-DEPT (optional)"
            value={deptForm.code}
            onChange={(e) => setDeptForm(f => ({ ...f, code: e.target.value }))}
          />
          <div>
            <label className="block text-[13px] font-bold text-[#495057] mb-1.5">Manager / Lead</label>
            <select
              value={deptForm.managerId}
              onChange={(e) => setDeptForm(f => ({ ...f, managerId: e.target.value }))}
              className="w-full h-11 px-4 bg-white border border-[#ced4da] rounded-lg text-[14px] text-[#212529] focus:outline-none focus:border-[#6c757d] transition-all cursor-pointer"
            >
              <option value="">Unassigned</option>
              {managerOptions.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => { setIsDeptModalOpen(false); resetDeptForm(); }}>Cancel</Button>
            <Button type="submit" variant="primary">{editingDept ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCatModalOpen}
        onClose={() => { setIsCatModalOpen(false); resetCatForm(); }}
        title={editingCat ? 'Edit Category' : 'Add Category'}
        description={editingCat ? 'Update asset classification details.' : 'Create a new asset classification.'}
      >
        <form onSubmit={handleSaveCat} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-600 font-semibold">
              <X className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}
          <Input
            label="Category Name"
            placeholder="e.g. Monitors"
            value={catForm.name}
            onChange={(e) => setCatForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Description"
            placeholder="Optional notes"
            value={catForm.description}
            onChange={(e) => setCatForm(f => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Depreciation Rate (%)"
              placeholder="e.g. 20"
              type="number"
              min="0"
              step="0.1"
              value={catForm.depreciationRate}
              onChange={(e) => setCatForm(f => ({ ...f, depreciationRate: e.target.value }))}
            />
            <Input
              label="Warranty Period (months)"
              placeholder="e.g. 36"
              type="number"
              min="0"
              value={catForm.warrantyPeriod}
              onChange={(e) => setCatForm(f => ({ ...f, warrantyPeriod: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => { setIsCatModalOpen(false); resetCatForm(); }}>Cancel</Button>
            <Button type="submit" variant="primary">{editingCat ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
