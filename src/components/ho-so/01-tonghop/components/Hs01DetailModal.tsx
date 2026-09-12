import React from "react";
import { User, Calendar, DollarSign, ShieldCheck, X } from "lucide-react";
import type { Hs01TongHopItem } from "../services/hs01TongHopService";
import {
  LOAI_KCB_OPTIONS,
  GIOI_TINH_MAP,
} from "../services/hs01TongHopService";
import { useModalBehavior } from "../../../../hooks/useModalBehavior";
import {
  formatCurrencyVnd,
  formatYmdHmDisplay,
} from "../../../../utils/shared/excelXmlShared";

interface Hs01DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Hs01TongHopItem | null;
}

export const Hs01DetailModal: React.FC<Hs01DetailModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  useModalBehavior(isOpen && !!item, onClose);

  if (!isOpen || !item) return null;

  const loaiKcbObj = LOAI_KCB_OPTIONS.find((o) => o.code === item.maLoaiKcb);
  const loaiKcbName = loaiKcbObj ? loaiKcbObj.name : `Loại ${item.maLoaiKcb}`;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700">
              <User size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  {item.hoTen}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {GIOI_TINH_MAP[String(item.gioiTinh)] || item.gioiTinh}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Thẻ BHYT:{" "}
                <strong className="text-slate-900">{item.maTheBhyt}</strong> •
                STT: #{item.stt}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Lỗi cảnh báo nếu có */}
          {item.errors && item.errors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                <span>
                  ⚠️ Cảnh Báo Đối Soát Dữ Liệu ({item.errors.length} lỗi):
                </span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-rose-700">
                {item.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Card 1: Thông tin hành chính & KCB (Trường 1 - 11) */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={15} className="text-indigo-600" />
              <span>Thông Tin Khám Chữa Bệnh (11 Trường)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block mb-0.5">
                  3. Ngày sinh (NGAY_SINH)
                </span>
                <span className="font-bold text-slate-800">
                  {formatYmdHmDisplay(item.ngaySinh).split(" ")[0]}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">
                  5. Mã thẻ BHYT (MA_THE_BHYT)
                </span>
                <span className="font-mono font-black text-indigo-600">
                  {item.maTheBhyt}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">
                  6. Bệnh chính ICD-10
                </span>
                <span className="font-mono font-black text-rose-600">
                  {item.maBenhChinh}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">
                  11. Loại KCB (MA_LOAI_KCB)
                </span>
                <span className="font-medium text-slate-800">
                  {loaiKcbName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">
                  10. Số ngày điều trị
                </span>
                <span className="font-bold text-slate-800">
                  {item.soNgayDtri} ngày
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">
                  7. Ngày vào (NGAY_VAO)
                </span>
                <span className="font-bold text-slate-800">
                  {formatYmdHmDisplay(item.ngayVao)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">
                  8. Vào nội trú (NGAY_VAO_NOI_TRU)
                </span>
                <span className="font-medium text-slate-700">
                  {item.ngayVaoNoiTru
                    ? formatYmdHmDisplay(item.ngayVaoNoiTru)
                    : "(Trống)"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">
                  9. Ngày ra (NGAY_RA)
                </span>
                <span className="font-bold text-slate-800">
                  {formatYmdHmDisplay(item.ngayRa)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Cơ cấu chi phí viện phí (Trường 12 - 17) */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <DollarSign size={15} className="text-indigo-600" />
              <span>Cơ Cấu Chi Phí Viện Phí KCB (6 Trường)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">
                  12. Tổng chi BV (T_TONGCHI_BV)
                </span>
                <span className="text-base font-black text-slate-900">
                  {formatCurrencyVnd(item.tTongchiBv)}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">
                  13. Tổng chi BH (T_TONGCHI_BH)
                </span>
                <span className="text-base font-bold text-blue-700">
                  {formatCurrencyVnd(item.tTongchiBh)}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 font-semibold block mb-1">
                  14. BH Thanh Toán (T_BHTT)
                </span>
                <span className="text-base font-black text-emerald-700">
                  {formatCurrencyVnd(item.tBhtt)}
                </span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-amber-800 font-semibold block mb-1">
                  15. Cùng Chi Trả (T_BNCCT)
                </span>
                <span className="text-base font-bold text-amber-800">
                  {formatCurrencyVnd(item.tBncct)}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">
                  16. BN Tự Trả (T_BNTT)
                </span>
                <span className="text-base font-medium text-slate-800">
                  {formatCurrencyVnd(item.tBntt)}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">
                  17. Nguồn Khác (T_NGUONKHAC)
                </span>
                <span className="text-base font-medium text-slate-800">
                  {formatCurrencyVnd(item.tNguonkhac || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Thông tin quyết toán (Trường 18 - 20) */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={15} className="text-indigo-600" />
              <span>Thông Tin Cơ Sở KCB &amp; Kỳ Quyết Toán (3 Trường)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block mb-0.5">
                  18. Mã CSKCB (MA_CSKCB)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {item.maCskcb}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">
                  19. Năm quyết toán (NAM_QT)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {item.namQt}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">
                  20. Tháng quyết toán (THANG_QT)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {item.thangQt}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
