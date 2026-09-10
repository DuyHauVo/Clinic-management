import React from 'react';
import { Building2, Stethoscope, CheckCircle2, FileCode } from 'lucide-react';
import type { DmBpcmItem } from '../../../../types';

interface BpcmStatsCardsProps {
  items: DmBpcmItem[];
}

export const BpcmStatsCards: React.FC<BpcmStatsCardsProps> = ({ items }) => {
  const totalExamTables = items.reduce((sum, item) => sum + (Number(item.banKham) || 0), 0);
  const totalBedsPd = items.reduce((sum, item) => sum + (Number(item.giuongPd) || 0), 0);
  const totalBedsTk = items.reduce((sum, item) => sum + (Number(item.giuongTk) || 0), 0);
  const validItemsCount = items.filter(i => i.isValid !== false).length;

  const validRate = items.length > 0 ? Math.round((validItemsCount / items.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold flex-shrink-0">
          <Building2 size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Khoa / Đơn Nguyên</span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{items.length}</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold flex-shrink-0">
          <Stethoscope size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bàn Khám Ngoại Trú</span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalExamTables} bàn</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Giường PD / Thực Kê</span>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">{totalBedsPd} / {totalBedsTk}</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
          <FileCode size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cú Pháp XML Loại 70</span>
          <div className="text-2xl font-black text-indigo-600 tracking-tight">
            {validItemsCount}/{items.length || 0} ({validRate}%)
          </div>
        </div>
      </div>
    </div>
  );
};
