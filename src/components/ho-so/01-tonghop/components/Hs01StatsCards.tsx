import React from 'react';
import { FileSpreadsheet, DollarSign, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { Hs01TongHopItem } from '../services/hs01TongHopService';
import { formatCurrencyVnd } from '../../../../utils/shared/excelXmlShared';

interface Hs01StatsCardsProps {
  items: Hs01TongHopItem[];
}

export const Hs01StatsCards: React.FC<Hs01StatsCardsProps> = ({ items }) => {
  const totalCount = items.length;
  const totalBv = items.reduce((sum, i) => sum + (i.tTongchiBv || 0), 0);
  const totalBhtt = items.reduce((sum, i) => sum + (i.tBhtt || 0), 0);
  const totalBncct = items.reduce((sum, i) => sum + (i.tBncct || 0), 0);
  const totalBntt = items.reduce((sum, i) => sum + (i.tBntt || 0), 0);
  const validCount = items.filter(i => i.isValid !== false).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số hồ sơ */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0 border border-indigo-100">
          <FileSpreadsheet size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Tổng Số Hồ Sơ 01/BH
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {totalCount}{' '}
            <span className="text-xs font-bold text-slate-500">hồ sơ</span>
          </div>
        </div>
      </div>

      {/* 2. Tổng chi phí KBCB */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 border border-blue-100">
          <DollarSign size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Tổng Chi Phí KBCB (BV)
          </span>
          <div className="text-2xl font-black text-blue-700 tracking-tight mt-0.5">
            {formatCurrencyVnd(totalBv)}
          </div>
        </div>
      </div>

      {/* 3. Tiền BHYT Thanh Toán */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 border border-emerald-100">
          <ShieldCheck size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            BHYT Thanh Toán (T_BHTT)
          </span>
          <div className="text-2xl font-black text-emerald-700 tracking-tight mt-0.5">
            {formatCurrencyVnd(totalBhtt)}
          </div>
        </div>
      </div>

      {/* 4. Hồ Sơ Hợp Lệ & Người Bệnh Trả */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0 border border-purple-100">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Hợp Lệ / Cùng Chi Trả
          </span>
          <div className="text-2xl font-black text-purple-700 tracking-tight mt-0.5">
            {validCount}/{totalCount}{' '}
            <span className="text-xs font-bold text-slate-500">
              (NB: {formatCurrencyVnd(totalBncct + totalBntt)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
