import React, { useState } from 'react';
import { Wrench, Cpu, Layers, FileCode } from 'lucide-react';
import type { DmTbDvktItem } from '../../../types';
import { initialTbDvktData } from '../../../mock/mockData';
import { useToast } from '../../../context/ToastContext';
import { TbDvktTable } from './components/TbDvktTable';
import { TbDvktEditModal } from './components/TbDvktEditModal';

export const DmTbDvktTab: React.FC = () => {
  const toast = useToast();
  const [tbDvktItems, setTbDvktItems] = useState<DmTbDvktItem[]>(initialTbDvktData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DmTbDvktItem | null>(null);

  const filteredItems = tbDvktItems.filter((i) => {
    const q = searchTerm.toLowerCase();
    return (
      i.tenDvkt.toLowerCase().includes(q) ||
      i.maDvkt.toLowerCase().includes(q) ||
      i.tenTbyt.toLowerCase().includes(q) ||
      i.maTbyt.toLowerCase().includes(q)
    );
  });

  const handleDelete = (item: DmTbDvktItem) => {
    if (confirm(`Bạn có chắc muốn xóa liên kết thiết bị - DVKT "${item.tenDvkt}" - "${item.tenTbyt}"?`)) {
      setTbDvktItems(tbDvktItems.filter((i) => i.id !== item.id));
      toast.info(`Đã xóa liên kết: ${item.tenDvkt}`, 'Đã Xóa');
    }
  };

  const handleSave = (item: DmTbDvktItem) => {
    if (editingItem) {
      setTbDvktItems(tbDvktItems.map((i) => (i.id === editingItem.id ? item : i)));
      toast.success(`Đã cập nhật liên kết thiết bị DVKT`, 'Cập Nhật Thành Công');
    } else {
      const newItem = { ...item, id: `tbdv-${Date.now()}`, stt: tbDvktItems.length + 1 };
      setTbDvktItems([...tbDvktItems, newItem]);
      toast.success(`Đã thêm liên kết thiết bị DVKT mới`, 'Thêm Thành Công');
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const distinctTbytCount = new Set(tbDvktItems.map((i) => i.maTbyt).filter(Boolean)).size;
  const distinctDvktCount = new Set(tbDvktItems.map((i) => i.maDvkt).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
            <Wrench size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Số Cặp Liên Kết TBYT - DVKT</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{tbDvktItems.length} liên kết</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold flex-shrink-0">
            <Cpu size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thiết Bị Tham Gia</span>
            <div className="text-2xl font-black text-[#1677ff] tracking-tight">{distinctTbytCount} thiết bị</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">DVKT Áp Dụng</span>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">{distinctDvktCount} dịch vụ</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
            <FileCode size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quy Định Hồ Sơ</span>
            <div className="text-2xl font-black text-purple-700 tracking-tight">Loại HS 73</div>
          </div>
        </div>
      </div>

      <TbDvktTable
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

      <TbDvktEditModal
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
