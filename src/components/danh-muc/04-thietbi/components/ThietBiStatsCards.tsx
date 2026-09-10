import React from 'react';
import { Cpu, CheckCircle2, RefreshCw, FileCode } from 'lucide-react';
import type { DmThietBiItem } from '../../../../types';

interface ThietBiStatsCardsProps {
  items: DmThietBiItem[];
}

export const ThietBiStatsCards: React.FC<ThietBiStatsCardsProps> = ({ items }) => {
  const totalBhyt100 = items.filter(i => (i.tyleTtBh ?? 100) === 100).length;
  const totalTaiSuDung = items.filter(i => i.dinhMuc && i.dinhMuc > 1).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold flex-shrink-0">
          <Cpu size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng Danh Mục TBYT</span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{items.length} thiết bị / vật tư</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thanh Toán BHYT 100%</span>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">{totalBhyt100} vật tư</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold flex-shrink-0">
          <RefreshCw size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">TBYT Tái Sử Dụng</span>
          <div className="text-2xl font-black text-[#1677ff] tracking-tight">{totalTaiSuDung} thiết bị</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
          <FileCode size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Đặc Tả XML Loại HS 11</span>
          <div className="text-2xl font-black text-purple-700 tracking-tight">Chuẩn 26 Trường</div>
        </div>
      </div>
    </div>
  );
};
