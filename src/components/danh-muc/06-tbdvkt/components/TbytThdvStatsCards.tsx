import React from "react";
import { Cpu, Award, FileText, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { DmTbytThdvItem } from "../../../../types";

interface TbytThdvStatsCardsProps {
  items: DmTbytThdvItem[];
}

export const TbytThdvStatsCards: React.FC<TbytThdvStatsCardsProps> = ({
  items,
}) => {
  const totalCount = items.length;
  const soLuuHanhCount = items.filter((i) =>
    Boolean(i.soLuuHanh && i.soLuuHanh.trim()),
  ).length;
  const thueMuonCount = items.filter((i) => Boolean(i.hdTu || i.hdDen)).length;
  const invalidCount = items.filter(
    (i) => i.isValid === false || (i.errors && i.errors.length > 0),
  ).length;

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
            {totalCount}
          </div>
        </div>
      </div>

      {/* 2. Có Số Lưu Hành (NĐ 07/2025/NĐ-CP) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 border border-emerald-100">
          <Award size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Có Số Lưu Hành (NĐ 07)
          </span>
          <div className="text-2xl font-black text-emerald-700 tracking-tight mt-0.5">
            {soLuuHanhCount} / {totalCount}
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
            Thuê / Mượn / Đặt Máy
          </span>
          <div className="text-2xl font-black text-amber-700 tracking-tight mt-0.5">
            {thueMuonCount}
          </div>
        </div>
      </div>

      {/* 4. Hồ Sơ Cảnh Báo / Lỗi Cần Xử Lý */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 border ${
            invalidCount > 0
              ? "bg-rose-50 text-rose-600 border-rose-100"
              : "bg-purple-50 text-purple-600 border-purple-100"
          }`}
        >
          {invalidCount > 0 ? <ShieldAlert size={24} /> : <CheckCircle2 size={24} />}
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {invalidCount > 0 ? "Bản Ghi Cần Kiểm Tra" : "Kiểm Tra Tính Hợp Lệ"}
          </span>
          <div
            className={`text-2xl font-black tracking-tight mt-0.5 ${
              invalidCount > 0 ? "text-rose-600" : "text-purple-700"
            }`}
          >
            {invalidCount > 0 ? `${invalidCount} lỗi` : "Chuẩn 100%"}
          </div>
        </div>
      </div>
    </div>
  );
};
