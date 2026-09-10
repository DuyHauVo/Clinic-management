import React, { useState } from 'react';
import { Cpu, CheckCircle2, Building2, FileCode } from 'lucide-react';
import type { DmThietBiItem } from '../../../types';
import { initialThietBiData } from '../../../mock/mockData';
import { useToast } from '../../../context/ToastContext';
import { ThietBiTable } from './components/ThietBiTable';
import { ThietBiEditModal } from './components/ThietBiEditModal';

export const DmThietBiTab: React.FC = () => {
  const toast = useToast();
  const [thietBiItems, setThietBiItems] = useState<DmThietBiItem[]>(initialThietBiData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DmThietBiItem | null>(null);

  const filteredItems = thietBiItems.filter((i) => {
    const q = searchTerm.toLowerCase();
    return (
      i.tenTbyt.toLowerCase().includes(q) ||
      i.maTbyt.toLowerCase().includes(q) ||
      i.hangSx.toLowerCase().includes(q) ||
      (i.soLuuHanh && i.soLuuHanh.toLowerCase().includes(q))
    );
  });

  const handleDelete = (item: DmThietBiItem) => {
    if (confirm(`Bạn có chắc muốn xóa thiết bị "${item.tenTbyt}" (${item.maTbyt})?`)) {
      setThietBiItems(thietBiItems.filter((i) => i.id !== item.id));
      toast.info(`Đã xóa thiết bị: ${item.tenTbyt}`, 'Đã Xóa');
    }
  };

  const handleSave = (item: DmThietBiItem) => {
    if (editingItem) {
      setThietBiItems(thietBiItems.map((i) => (i.id === editingItem.id ? item : i)));
      toast.success(`Đã cập nhật thiết bị: ${item.tenTbyt}`, 'Cập Nhật Thành Công');
    } else {
      const newItem = { ...item, id: `tb-${Date.now()}`, stt: thietBiItems.length + 1 };
      setThietBiItems([...thietBiItems, newItem]);
      toast.success(`Đã thêm thiết bị mới: ${item.tenTbyt}`, 'Thêm Thành Công');
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold flex-shrink-0">
            <Cpu size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng Thiết Bị Y Tế</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{thietBiItems.length} hệ thống/máy</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Đang Hoạt Động</span>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {thietBiItems.filter((i) => i.tinhTrang.includes('hoạt động')).length} máy
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold flex-shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Khoa Phòng Sử Dụng</span>
            <div className="text-2xl font-black text-[#1677ff] tracking-tight">Toàn Viện</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
            <FileCode size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quy Định Hồ Sơ</span>
            <div className="text-2xl font-black text-purple-700 tracking-tight">Loại HS 72</div>
          </div>
        </div>
      </div>

      <ThietBiTable
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

      <ThietBiEditModal
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
