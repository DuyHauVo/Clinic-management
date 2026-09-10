import React from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import type { DmThuocItem } from '../../../../types';

interface ThuocTableProps {
  items: DmThuocItem[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddNew: () => void;
  onEdit: (item: DmThuocItem) => void;
  onDelete: (item: DmThuocItem) => void;
}

export const ThuocTable: React.FC<ThuocTableProps> = ({
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
              placeholder="Tìm kiếm theo mã thuốc, tên thuốc, hoạt chất, số đăng ký..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
          >
            <Plus size={15} />
            <span>Thêm Thuốc Mới</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 text-center w-12">STT</th>
              <th className="py-3 px-4">MÃ THUỐC BHYT</th>
              <th className="py-3 px-4">TÊN HOẠT CHẤT</th>
              <th className="py-3 px-4">TÊN THƯƠNG MẠI</th>
              <th className="py-3 px-4">HÀM LƯỢNG</th>
              <th className="py-3 px-4">ĐƠN VỊ</th>
              <th className="py-3 px-4 text-right">ĐƠN GIÁ BHYT</th>
              <th className="py-3 px-4 text-center">TỶ LỆ TT</th>
              <th className="py-3 px-4">SỐ ĐĂNG KÝ</th>
              <th className="py-3 px-4 text-center w-24">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  Không tìm thấy thuốc phù hợp
                </td>
              </tr>
            ) : (
              items.map((th) => (
                <tr key={th.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-400">{th.stt}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#1677ff]">{th.maThuocBhyt}</td>
                  <td className="py-3 px-4 font-semibold">{th.tenHoatChat}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{th.tenThuoc}</td>
                  <td className="py-3 px-4">{th.hamLuong}</td>
                  <td className="py-3 px-4">{th.donViTinh}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700">
                    {th.donGia.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      th.tyLeThanhToan === 100
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {th.tyLeThanhToan}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{th.soDangKy}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(th)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#1677ff]"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(th)}
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
