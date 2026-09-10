import React, { useState } from 'react';
import { Stethoscope, DollarSign, Activity, FileCode } from 'lucide-react';
import type { DmDichVuItem } from '../../../types';
import { initialDichVuData } from '../../../mock/mockData';
import { useToast } from '../../../context/ToastContext';
import { DichVuTable } from './components/DichVuTable';
import { DichVuEditModal } from './components/DichVuEditModal';

export const DmDichVuTab: React.FC = () => {
  const toast = useToast();
  const [dichVuItems, setDichVuItems] = useState<DmDichVuItem[]>(initialDichVuData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DmDichVuItem | null>(null);

  const filteredItems = dichVuItems.filter((i) => {
    const q = searchTerm.toLowerCase();
    return (
      i.tenDichVu.toLowerCase().includes(q) ||
      i.maDichVu.toLowerCase().includes(q) ||
      i.loaiDv.toLowerCase().includes(q) ||
      i.khoaThucHien.toLowerCase().includes(q)
    );
  });

  const handleDelete = (item: DmDichVuItem) => {
    if (confirm(`Bạn có chắc muốn xóa dịch vụ "${item.tenDichVu}" (${item.maDichVu})?`)) {
      setDichVuItems(dichVuItems.filter((i) => i.id !== item.id));
      toast.info(`Đã xóa dịch vụ: ${item.tenDichVu}`, 'Đã Xóa');
    }
  };

  const handleSave = (item: DmDichVuItem) => {
    if (editingItem) {
      setDichVuItems(dichVuItems.map((i) => (i.id === editingItem.id ? item : i)));
      toast.success(`Đã cập nhật dịch vụ: ${item.tenDichVu}`, 'Cập Nhật Thành Công');
    } else {
      const newItem = { ...item, id: `dv-${Date.now()}`, stt: dichVuItems.length + 1 };
      setDichVuItems([...dichVuItems, newItem]);
      toast.success(`Đã thêm dịch vụ mới: ${item.tenDichVu}`, 'Thêm Thành Công');
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold flex-shrink-0">
            <Stethoscope size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng DVKT Đã Khai Báo</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{dichVuItems.length} dịch vụ</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold flex-shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Giá BHYT Bình Quân</span>
            <div className="text-2xl font-black text-[#1677ff] tracking-tight">
              {dichVuItems.length > 0
                ? Math.round(dichVuItems.reduce((acc, cur) => acc + cur.giaBhyt, 0) / dichVuItems.length).toLocaleString('vi-VN')
                : 0}{' '}
              đ
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phân Loại Dịch Vụ</span>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">Khám, CĐHA, XN</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
            <FileCode size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quy Định Hồ Sơ</span>
            <div className="text-2xl font-black text-purple-700 tracking-tight">Loại HS 12</div>
          </div>
        </div>
      </div>

      <DichVuTable
        items={filteredItems}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddNew={() => {
          setEditingItem(null);
          setIsEditModalOpen(true);
        }}
        onEdit={(item) => {
          setEditingItem(item);
          setIsEditModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <DichVuEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  );
};
