import React from 'react';
import { Pill, Activity, FlaskConical, FileCode } from 'lucide-react';
import type { DmThuocItem } from '../../../../types';

interface ThuocStatsCardsProps {
  items: DmThuocItem[];
}

export const ThuocStatsCards: React.FC<ThuocStatsCardsProps> = ({ items }) => {
  const tanDuocCount = items.filter((i) => i.loaiThuoc === 1).length;
  const yhctMauCount = items.filter((i) => i.loaiThuoc !== 1).length;
  const validItemsCount = items.filter((i) => i.isValid !== false).length;
  const validRate = items.length > 0 ? Math.round((validItemsCount / items.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold flex-shrink-0">
          <Pill size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mặt Hàng Thuốc / Máu</span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{items.length}</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold flex-shrink-0">
          <Activity size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tân Dược</span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{tanDuocCount} thuốc</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
          <FlaskConical size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">YHCT & Chế Phẩm Máu</span>
          <div className="text-2xl font-black text-amber-700 tracking-tight">{yhctMauCount} mục</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
          <FileCode size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cú Pháp XML Loại 10</span>
          <div className="text-2xl font-black text-indigo-600 tracking-tight">
            {validItemsCount}/{items.length || 0} ({validRate}%)
          </div>
        </div>
      </div>
    </div>
  );
};
