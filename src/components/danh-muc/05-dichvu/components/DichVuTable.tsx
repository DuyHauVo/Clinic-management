import React from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import type { DmDichVuItem } from '../../../../types';

interface DichVuTableProps {
  items: DmDichVuItem[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddNew: () => void;
  onEdit: (item: DmDichVuItem) => void;
  onDelete: (item: DmDichVuItem) => void;
}

export const DichVuTable: React.FC<DichVuTableProps> = ({
  items,
  searchTerm,
  onSearchChange,
  onAddNew,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Search & Filter Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã dịch vụ, tên kỹ thuật, phân loại, khoa thực hiện..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all font-medium"
            />
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
            >
              Xóa
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-colors"
          >
            <Plus size={15} />
            <span>Thêm Dịch Vụ Mới</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 text-center w-12">STT</th>
              <th className="py-3 px-4">MÃ DỊCH VỤ (BYT)</th>
              <th className="py-3 px-4">TÊN DỊCH VỤ KỸ THUẬT</th>
              <th className="py-3 px-4">PHÂN LOẠI</th>
              <th className="py-3 px-4 text-right">GIÁ BHYT</th>
              <th className="py-3 px-4 text-right">GIÁ VIỆN PHÍ</th>
              <th className="py-3 px-4">KHOA THỰC HIỆN</th>
              <th className="py-3 px-4 text-center w-24">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Không tìm thấy dịch vụ phù hợp
                </td>
              </tr>
            ) : (
              items.map((dv) => (
                <tr key={dv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-400">{dv.stt}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#1677ff]">{dv.maDichVu}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{dv.tenDichVu}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {dv.loaiDv}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    {dv.giaBhyt.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700">
                    {dv.giaVienPhi.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3 px-4 text-slate-600">{dv.khoaThucHien}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(dv)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#1677ff]"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(dv)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
