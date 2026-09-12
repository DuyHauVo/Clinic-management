import React, { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { Hs01TongHopTab } from '../components/ho-so/01-tonghop';
import { Hs09DieuChinhTab } from '../components/ho-so/09-dieuchinh';
import type { HoSoDieuChinh09Item } from '../utils/types/hs09DieuChinhTypes';

type HoSoTab = '01_tonghop' | '09_xuattoan';

interface HoSoPageProps {
  activeTab?: HoSoTab;
  onTabChange?: (tab: HoSoTab) => void;
  hs09Items?: HoSoDieuChinh09Item[];
  onHs09ItemsChange?: (
    updater:
      | HoSoDieuChinh09Item[]
      | ((prev: HoSoDieuChinh09Item[]) => HoSoDieuChinh09Item[]),
  ) => void;
}

export const HoSoPage: React.FC<HoSoPageProps> = ({
  activeTab: externalActiveTab,
  onTabChange,
  hs09Items,
  onHs09ItemsChange,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<HoSoTab>('01_tonghop');

  const activeHoSoTab = externalActiveTab || internalActiveTab;
  const setActiveHoSoTab = (tab: HoSoTab) => {
    setInternalActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner / Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide">
            <FolderOpen size={13} />
            HỆ THỐNG QUẢN LÝ HỒ SƠ &amp; GIÁM ĐỊNH BHYT
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Hồ Sơ Khám Chữa Bệnh &amp; Xuất Toán BHYT
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl">
            Tích hợp 2 bộ hồ sơ trọng tâm: Bảng tổng hợp chi phí KCB (Mẫu 01/BH - XML &lt;HSTH01BH&gt; Loại HS 5) và Hồ sơ điều chỉnh xử lý xuất toán giám định (Mẫu 09/BH - XML &lt;HOSO_DIEUCHINH_GD&gt; Loại HS 73).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 self-start lg:self-auto">
          <div className="px-3 border-r border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Kỳ Giám Định</span>
            <span className="text-sm font-extrabold font-mono text-slate-900">Tháng 09/2026</span>
          </div>
          <div className="px-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Trạng Thái Cổng</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sẵn Sàng Kết Nối
            </span>
          </div>
        </div>
      </div>

      {/* Main Switcher: 2 Major Clinical BHYT Dossier Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setActiveHoSoTab('01_tonghop')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 ${
            activeHoSoTab === '01_tonghop'
              ? 'bg-blue-50/70 border-[#1677ff] shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg ${
              activeHoSoTab === '01_tonghop'
                ? 'bg-[#1677ff] text-white shadow-md shadow-blue-500/30'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            01
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900">
                Bộ 1: Bảng Tổng Hợp Chi Phí KCB (01/BH)
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">
                Loại HS 5 • XML
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hồ sơ tổng hợp chi phí KCB Mẫu 01/BH (20 trường XML &lt;HSTH01BH&gt;), gửi Cổng BHXH Gateway (API GuiHoSoTongHop01BH).
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveHoSoTab('09_xuattoan')}
          className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 ${
            activeHoSoTab === '09_xuattoan'
              ? 'bg-indigo-50/70 border-indigo-600 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg ${
              activeHoSoTab === '09_xuattoan'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            09
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-slate-900">
                Bộ 2: Hồ Sơ Điều Chỉnh Xử Lý Xuất Toán (09/BH)
              </span>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">
                Loại HS 73 • XML
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Điều chỉnh số liệu giám định, chi phí XML1, XML2, XML3, XML4, XML5 và gửi Cổng BHXH (API GuiHoSoDieuChinh09BH).
            </p>
          </div>
        </button>
      </div>

      {/* ============================================================
          TAB 1: HỒ SƠ TỔNG HỢP CHI PHÍ KCB (MẪU 01/BH - XML <HSTH01BH> - LOẠI HS 5)
      ============================================================ */}
      {activeHoSoTab === '01_tonghop' && <Hs01TongHopTab />}

      {/* ============================================================
          TAB 2: HỒ SƠ ĐIỀU CHỈNH & XỬ LÝ XUẤT TOÁN (MẪU 09/BH - LOẠI HS 73)
      ============================================================ */}
      {activeHoSoTab === '09_xuattoan' && (
        <Hs09DieuChinhTab
          items={hs09Items}
          onItemsChange={onHs09ItemsChange}
        />
      )}
    </div>
  );
};
