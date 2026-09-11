import React from "react";
import { Cpu, Stethoscope, FileText, ShieldCheck } from "lucide-react";
import type { DmTbytThdvItem } from "../../../../types";

interface TbytThdvStatsCardsProps {
  items: DmTbytThdvItem[];
}

export const TbytThdvStatsCards: React.FC<TbytThdvStatsCardsProps> = ({
  items,
}) => {
  const totalCount = items.length;
  const clsCount = items.filter((i) =>
    Boolean(i.maMay && i.maMay.trim()),
  ).length;
  const thueMuonCount = items.filter((i) => Boolean(i.hdTu || i.hdDen)).length;
  const validCount = items.filter((i) => i.isValid !== false).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng TBYT thực hiện DVKT */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0 border border-indigo-100">
          <Cpu size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Tổng Thiết Bị DVKT
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {totalCount}{" "}
          </div>
        </div>
      </div>

      {/* 2. Thiết bị CLS & Phẫu thuật */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 border border-emerald-100">
          <Stethoscope size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Máy CLS & Phẫu Thủ Thuật
          </span>
          <div className="text-2xl font-black text-emerald-700 tracking-tight mt-0.5">
            {clsCount}{" "}
          </div>
        </div>
      </div>

      {/* 3. TBYT Hợp đồng Thuê / Mượn */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0 border border-amber-100">
          <FileText size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Thuê / Mượn / Trả Góp
          </span>
          <div className="text-2xl font-black text-amber-700 tracking-tight mt-0.5">
            {thueMuonCount}{" "}
          </div>
        </div>
      </div>

      {/* 4. Hồ Sơ BHYT Chuẩn */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0 border border-purple-100">
          <ShieldCheck size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Hồ Sơ BHYT Mẫu 06/DM
          </span>
          <div className="text-2xl font-black text-purple-700 tracking-tight mt-0.5">
            {validCount}/{totalCount}
          </div>
        </div>
      </div>
    </div>
  );
};
