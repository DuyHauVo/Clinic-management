import React from 'react';
import { Users, Stethoscope, Award, ShieldCheck } from 'lucide-react';
import type { DmNhanLucItem } from '../../../../types';

interface NhanLucStatsCardsProps {
  items: DmNhanLucItem[];
}

export const NhanLucStatsCards: React.FC<NhanLucStatsCardsProps> = ({ items }) => {
  const totalBacSy = items.filter(i => i.chucDanhNn === '1').length;
  const totalCoCchn = items.filter(i => Boolean(i.macchn && i.macchn.trim())).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0">
          <Users size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng Số Nhân Lực KCB</span>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{items.length} nhân sự</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677ff] flex items-center justify-center font-bold flex-shrink-0">
          <Stethoscope size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bác Sỹ Điều Trị</span>
          <div className="text-2xl font-black text-[#1677ff] tracking-tight">{totalBacSy} bác sỹ</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
          <Award size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Có Chứng Chỉ Hành Nghề</span>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">{totalCoCchn}/{items.length || 0}</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Đặc Tả XML Loại HS 71</span>
          <div className="text-2xl font-black text-purple-700 tracking-tight">Chuẩn 24 Trường</div>
        </div>
      </div>
    </div>
  );
};
