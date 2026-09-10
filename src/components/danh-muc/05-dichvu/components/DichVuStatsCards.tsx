import React from 'react';
import { Activity, DollarSign, Stethoscope, FileCode } from 'lucide-react';
import type { DmDichVuItem } from '../../../../types';

interface DichVuStatsCardsProps {
  items: DmDichVuItem[];
}

export const DichVuStatsCards: React.FC<DichVuStatsCardsProps> = ({ items }) => {
  const totalWithThuocPx = items.filter(i => i.dsThuocPx && i.dsThuocPx.length > 0).length;
  const avgPrice = items.length > 0
    ? Math.round(items.reduce((acc, cur) => acc + (cur.giaThanhToan || cur.donGia || 0), 0) / items.length)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
          <Stethoscope size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng Danh Mục DVKT</span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{items.length} dịch vụ</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold flex-shrink-0">
          <DollarSign size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Giá TT Bình Quân</span>
          <div className="text-2xl font-black text-[#1677ff] tracking-tight">
            {avgPrice.toLocaleString('vi-VN')} đ
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
          <Activity size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Có Thuốc Phóng Xạ</span>
          <div className="text-2xl font-black text-amber-700 tracking-tight">{totalWithThuocPx} dịch vụ</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
          <FileCode size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cấu Trúc XML Loại HS 12</span>
          <div className="text-2xl font-black text-purple-700 tracking-tight">Chuẩn 16 Trường</div>
        </div>
      </div>
    </div>
  );
};
