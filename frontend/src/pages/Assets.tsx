import React, { useState } from 'react';
import { useAppState } from '../contexts/AppContext';
import { PageHeader } from '../components/PageHeader';
import { KPICard } from '../components/KPICard';
import { Table } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Package, ShieldAlert, Wrench, CheckCircle, Search, Filter, Download, Plus, UploadCloud } from 'lucide-react';
import type { AssetStatus } from '../types';

const assetSchema = z.object({
  name: z.string().min(3, { message: 'Asset name must be at least 3 characters' }),
  serialNumber: z.string().min(4, { message: 'Serial number is required' }),
  category: z.string().min(2, { message: 'Category is required' }),
  department: z.string().min(2, { message: 'Department is required' }),
  purchaseValue: z.coerce.number().min(1, { message: 'Value must be greater than 0' }),
  location: z.string().min(3, { message: 'Location is required' }),
});

type AssetFormSchema = z.infer<typeof assetSchema>;

export const Assets: React.FC = () => {
  const { assets, addAsset } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form setup - using explicit typing to avoid z.coerce resolver TS mismatch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(assetSchema)
  });

  const onSubmit = (data: AssetFormSchema) => {
    addAsset({
      name: data.name,
      serialNumber: data.serialNumber,
      category: data.category,
      department: data.department,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseValue: data.purchaseValue,
      location: data.location,
    });
    setIsModalOpen(false);
    reset();
  };

  // Calculations for Summary KPIs
  const totalAssets = assets.length;
  const countAvailable = assets.filter(a => a.status === 'Available').length;
  const countAllocated = assets.filter(a => a.status === 'Allocated').length;
  const countMaintenance = assets.filter(a => a.status === 'Maintenance').length;
  const countReserved = assets.filter(a => a.status === 'Reserved').length;

  // Filter & Search
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'IT Hardware', 'Networking', 'Accessories', 'Facilities', 'Furniture', 'Lab Equipment'];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Asset Inventory"
        description="Comprehensive list and controls of all corporate physical and IT resources."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5" />
              Bulk Upload
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Register Asset
            </Button>
          </div>
        }
      />

      {/* Summary KPI Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard title="Total Assets" value={totalAssets} icon={Package} iconBgColor="bg-[#e9ecef]" iconColor="text-[#6c757d]" />
        <KPICard title="Available" value={countAvailable} icon={CheckCircle} iconBgColor="bg-[#198754]/10" iconColor="text-[#198754]" />
        <KPICard title="Allocated" value={countAllocated} icon={Package} iconBgColor="bg-[#0d6efd]/10" iconColor="text-[#0d6efd]" />
        <KPICard title="Under Repair" value={countMaintenance} icon={Wrench} iconBgColor="bg-[#dc3545]/10" iconColor="text-[#dc3545]" />
        <KPICard title="Reserved" value={countReserved} icon={ShieldAlert} iconBgColor="bg-[#ffc107]/10" iconColor="text-[#b25e00]" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white border border-[#dee2e6] rounded-card p-4 shadow-custom">
        {/* Search */}
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c757d]" />
          <input
            type="text"
            placeholder="Search by name, serial number, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-transparent border border-[#ced4da] rounded-input text-[#212529] placeholder-[#6c757d]/70 text-[15px] focus:outline-none focus:border-[#6c757d]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 select-none">
          <Filter className="w-5 h-5 text-[#6c757d]" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-white border border-[#ced4da] rounded-input h-11 px-4 pr-10 text-[15px] font-semibold text-[#495057] focus:outline-none cursor-pointer"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c} Category</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white border border-[#dee2e6] rounded-card shadow-custom overflow-hidden">
        <Table
          data={filteredAssets}
          columns={[
            { header: 'Asset ID', accessorKey: 'id' },
            { header: 'Asset Name', accessorKey: 'name' },
            { header: 'Serial Number', accessorKey: 'serialNumber' },
            { header: 'Category', accessorKey: 'category' },
            { header: 'Department', accessorKey: 'department' },
            { header: 'Purchase Value', accessorKey: 'purchaseValue', render: (row) => `$${row.purchaseValue.toLocaleString()}` },
            { header: 'Status', accessorKey: 'status', render: (row) => <StatusBadge status={row.status} /> },
            { header: 'Location', accessorKey: 'location' }
          ]}
        />
      </div>

      {/* Add Asset Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Asset" description="Enter the specifications of the physical asset below.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Asset Name" placeholder="e.g. MacBook Pro 14" error={errors.name?.message as string | undefined} {...register('name')} />
          <Input label="Serial Number" placeholder="e.g. C02GX71MD6FF" error={errors.serialNumber?.message as string | undefined} {...register('serialNumber')} />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[14px] font-semibold text-[#495057]">Category</label>
              <select {...register('category')} className="h-[44px] px-3.5 bg-white border border-[#ced4da] rounded-input text-[#212529] focus:outline-none focus:border-[#6c757d]">
                <option value="IT Hardware">IT Hardware</option>
                <option value="Networking">Networking</option>
                <option value="Accessories">Accessories</option>
                <option value="Facilities">Facilities</option>
                <option value="Furniture">Furniture</option>
                <option value="Lab Equipment">Lab Equipment</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[14px] font-semibold text-[#495057]">Department</label>
              <select {...register('department')} className="h-[44px] px-3.5 bg-white border border-[#ced4da] rounded-input text-[#212529] focus:outline-none focus:border-[#6c757d]">
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Design">Design</option>
                <option value="IT">IT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Purchase Value ($)" type="number" placeholder="3499" error={errors.purchaseValue?.message as string | undefined} {...register('purchaseValue')} />
            <Input label="Location" placeholder="e.g. San Francisco HQ" error={errors.location?.message as string | undefined} {...register('location')} />
          </div>

          <div className="flex justify-end gap-3 border-t border-[#dee2e6] pt-4 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Asset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
