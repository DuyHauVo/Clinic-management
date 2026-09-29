import React from "react";
import {
  Clock,
  Loader2,
  RefreshCw,
  CheckCheck,
  XCircle,
  Check,
  Copy,
} from "lucide-react";
import type { SmartCaPersistentConfig } from "../../../services/smartca/smartcaConfig";
import type { SmartCaQ1InitiateResponse } from "../../../services/smartca/smartcaHandlers";

export interface WaitingApprovalViewProps {
  config: SmartCaPersistentConfig;
  waitingTransaction: SmartCaQ1InitiateResponse;
  countdown: number;
  formatCountdown: (seconds: number) => string;
  identityValue: string;
  idType: "phone" | "cccd" | "mst";
  effectiveFileName: string;
  copiedKey: string | null;
  onCopyTranId: () => void;
  onCheckNow: () => void;
  onSimulateAppConfirm: () => void;
  onSimulateAppReject: () => void;
  onCancelWaiting: () => void;
}

export const WaitingApprovalView: React.FC<WaitingApprovalViewProps> = ({
  config,
  waitingTransaction,
  countdown,
  formatCountdown,
  identityValue,
  idType,
  effectiveFileName,
  copiedKey,
  onCopyTranId,
  onCheckNow,
  onSimulateAppConfirm,
  onSimulateAppReject,
  onCancelWaiting,
}) => {
  return (
    <div className="p-5 bg-white border border-blue-200 rounded-2xl space-y-4 shadow-xs animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-base font-extrabold text-slate-900">
            Đang Chờ Xác Nhận Trên App VNPT SmartCA
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            Hệ thống đã gửi yêu cầu ký đến ứng dụng điện thoại của bạn
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono font-extrabold text-blue-900 flex items-center gap-1.5">
          <Clock size={14} className="text-blue-600" />
          <span>{formatCountdown(countdown)}</span>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-xs text-slate-500 font-bold block mb-1">
              Mã Giao Dịch (TranId):
            </span>
            <div className="flex items-center gap-1.5">
              <code className="px-2.5 py-1 bg-white text-slate-900 font-mono font-extrabold rounded-lg text-xs border border-slate-200 truncate max-w-[220px] block">
                {waitingTransaction.tranId}
              </code>
              <button
                type="button"
                onClick={onCopyTranId}
                className="p-1 text-slate-500 hover:text-blue-600 rounded cursor-pointer"
              >
                {copiedKey === "tranId" ? (
                  <Check size={14} className="text-emerald-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500 font-bold block mb-1">
              Tài Khoản Nhận Thông Báo:
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {identityValue} (
              {idType === "phone" ? "SĐT" : idType === "cccd" ? "CCCD" : "MST"})
            </span>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
          <div className="font-bold text-slate-900">
            Các bước thực hiện trên điện thoại:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 pl-1">
            <li>
              Mở ứng dụng <b>VNPT SmartCA</b> trên điện thoại.
            </li>
            <li>
              Kiểm tra thông báo yêu cầu ký số cho tệp:{" "}
              <code className="font-mono font-bold">{effectiveFileName}</code>
            </li>
            <li>
              Bấm <b>"Xác nhận"</b> (FaceID / Vân tay / PIN) để hoàn tất.
            </li>
          </ol>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin text-blue-600" />
            <span>Tự động kiểm tra phản hồi từ App mỗi 2 giây...</span>
          </div>
          <button
            type="button"
            onClick={onCheckNow}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 rounded-lg font-bold text-slate-700 border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer text-xs"
          >
            <RefreshCw size={12} />
            <span>Kiểm tra ngay</span>
          </button>
        </div>
      </div>

      {config.env === "mock" && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-amber-900">
            Môi Trường Giả Lập Test:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSimulateAppConfirm}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <CheckCheck size={14} />
              <span>Giả Lập Bấm Xác Nhận Ngay</span>
            </button>
            <button
              type="button"
              onClick={onSimulateAppReject}
              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <XCircle size={13} />
              <span>Giả Lập Từ Chối</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end pt-1">
        <button
          type="button"
          onClick={onCancelWaiting}
          className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <XCircle size={14} />
          <span>Hủy Giao Dịch & Chọn Lại</span>
        </button>
      </div>
    </div>
  );
};
