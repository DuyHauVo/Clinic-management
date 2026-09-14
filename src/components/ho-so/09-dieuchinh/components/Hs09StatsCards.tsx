import React from 'react';
import {
  FileSpreadsheet,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import type { HoSoDieuChinh09Item } from '../../../../utils/types/hs09DieuChinhTypes';
import { formatCurrencyVnd } from '../../../../utils/shared/excelXmlShared';

interface Hs09StatsCardsProps {
  items: HoSoDieuChinh09Item[];
}

export const Hs09StatsCards: React.FC<Hs09StatsCardsProps> = ({ items }) => {
  const totalCount = items.length;

  // Tính tổng tiền xuất toán & tổng tiền đề nghị giải trình
  const totalTienXuatToan = items.reduce(
    (sum: number, item: HoSoDieuChinh09Item) => sum + (item.tienXuatToan || 0),
    0
  );

  const totalTienDeNghi = items.reduce(
    (sum: number, item: HoSoDieuChinh09Item) =>
      sum + (item.tienDeNghiThanhToanLai || 0),
    0
  );

  // Tổng số mục điều chỉnh (XML1 + Chi phí)
  const totalAdjustments = items.reduce(
    (sum: number, item: HoSoDieuChinh09Item) =>
      sum +
      (item.dsXml1DieuChinh?.length || 0) +
      (item.dsChiPhiDieuChinh?.length || 0),
    0
  );

  // Số hồ sơ hợp lệ / đã gửi cổng
  const validCount = items.filter((i) => i.isValid !== false).length;
  const daGuiCount = items.filter((i) => i.trangThai === 'da_gui_cong').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số hồ sơ điều chỉnh */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0 border border-indigo-100">
          <FileSpreadsheet size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Tổng Số Hồ Sơ 09/BH
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {totalCount}{' '}
            <span className="text-xs font-bold text-slate-500">hồ sơ</span>
          </div>
        </div>
      </div>

      {/* 2. Tiền bị xuất toán */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold flex-shrink-0 border border-rose-100">
          <DollarSign size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Tổng Tiền Bị Xuất Toán
          </span>
          <div className="text-2xl font-black text-rose-700 tracking-tight mt-0.5">
            {formatCurrencyVnd(totalTienXuatToan)}
          </div>
        </div>
      </div>

      {/* 3. Tiền đề nghị thanh toán lại */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 border border-emerald-100">
          <DollarSign size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Đề Nghị Thanh Toán Lại
          </span>
          <div className="text-2xl font-black text-emerald-700 tracking-tight mt-0.5">
            {formatCurrencyVnd(totalTienDeNghi)}
          </div>
        </div>
      </div>

      {/* 4. Hồ Sơ Hợp Lệ & Trạng Thái Gửi Cổng */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0 border border-purple-100">
          <AlertTriangle size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Hợp Lệ / Khoản Mục DC
          </span>
          <div className="text-2xl font-black text-purple-700 tracking-tight mt-0.5">
            {validCount}/{totalCount}{' '}
            <span className="text-xs font-bold text-indigo-600">
              ({totalAdjustments} mục • Gửi: {daGuiCount})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
