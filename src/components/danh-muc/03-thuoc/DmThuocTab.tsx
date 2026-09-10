import React, { useState } from 'react';
import { Pill, DollarSign, ShieldCheck, FileCode } from 'lucide-react';
import type { DmThuocItem } from '../../../types';
import { initialThuocData } from '../../../mock/mockData';
import { useToast } from '../../../context/ToastContext';
import { ThuocTable } from './components/ThuocTable';
import { ThuocEditModal } from './components/ThuocEditModal';

export const DmThuocTab: React.FC = () => {
  const toast = useToast();
  const [thuocItems, setThuocItems] = useState<DmThuocItem[]>(initialThuocData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DmThuocItem | null>(null);

  const filteredItems = thuocItems.filter((i) => {
    const q = searchTerm.toLowerCase();
    return (
      i.tenThuoc.toLowerCase().includes(q) ||
      i.tenHoatChat.toLowerCase().includes(q) ||
      i.maThuocBhyt.toLowerCase().includes(q) ||
      (i.soDangKy && i.soDangKy.toLowerCase().includes(q))
    );
  });

  const handleDelete = (item: DmThuocItem) => {
    if (confirm(`Bạn có chắc muốn xóa thuốc "${item.tenThuoc}" (${item.maThuocBhyt})?`)) {
      setThuocItems(thuocItems.filter((i) => i.id !== item.id));
      toast.info(`Đã xóa thuốc: ${item.tenThuoc}`, 'Đã Xóa');
    }
  };

  const handleSave = (item: DmThuocItem) => {
    if (editingItem) {
      setThuocItems(thuocItems.map((i) => (i.id === editingItem.id ? item : i)));
      toast.success(`Đã cập nhật thuốc: ${item.tenThuoc}`, 'Cập Nhật Thành Công');
    } else {
      const newItem = { ...item, id: `th-${Date.now()}`, stt: thuocItems.length + 1 };
      setThuocItems([...thuocItems, newItem]);
      toast.success(`Đã thêm thuốc mới: ${item.tenThuoc}`, 'Thêm Thành Công');
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
            <Pill size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng Danh Mục Thuốc</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{thuocItems.length} hoạt chất / thuốc</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold flex-shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thanh Toán BHYT 100%</span>
            <div className="text-2xl font-black text-[#1677ff] tracking-tight">
              {thuocItems.filter((i) => i.tyLeThanhToan === 100).length} thuốc
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thanh Toán Tỷ Lệ (80%)</span>
            <div className="text-2xl font-black text-amber-600 tracking-tight">
              {thuocItems.filter((i) => i.tyLeThanhToan < 100).length} thuốc
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
            <FileCode size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quy Định Hồ Sơ</span>
            <div className="text-2xl font-black text-indigo-600 tracking-tight">Loại HS 10</div>
          </div>
        </div>
      </div>

      <ThuocTable
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

      <ThuocEditModal
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
