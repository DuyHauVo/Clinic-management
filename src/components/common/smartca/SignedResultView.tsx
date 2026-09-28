import React from "react";
import {
  ShieldCheck,
  Info,
  Check,
  Copy,
  Download,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import type { ExtractedSignatureInfo } from "../../../utils/xmlDsigEngine";
import type { SmartCaCredential } from "../../../types/smartcaTypes";

export interface SignedResultViewProps {
  signatureInfo: ExtractedSignatureInfo;
  credential?: SmartCaCredential | null;
  signerName: string;
  identityValue: string;
  signerEmail?: string;
  copiedKey: string | null;
  onCopySignedXml: () => void;
  onDownloadSignedXml?: () => void;
  onResetAndResign: () => void;
  onCountersign?: () => void;
}

export const SignedResultView: React.FC<SignedResultViewProps> = ({
  signatureInfo,
  credential,
  signerName,
  identityValue,
  signerEmail,
  copiedKey,
  onCopySignedXml,
  onDownloadSignedXml,
  onResetAndResign,
  onCountersign,
}) => {
  const isMultiSigned = Boolean(
    signatureInfo.signatures && signatureInfo.signatures.length > 1,
  );
  const sigCount = signatureInfo.signatureCount || 1;

  return (
    <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
          <ShieldCheck size={22} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-extrabold text-emerald-950">
              {isMultiSigned
                ? `Tài liệu XML đã được đồng ký thành công (${sigCount} chữ ký)`
                : "Tài liệu XML đã được ký số thành công (Quy trình 1)"}
            </h4>
            {isMultiSigned && (
              <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 rounded-full text-[10px] font-bold">
                Đồng ký (Countersign)
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-700">
            Khối thẻ &lt;CHUKYDONVI&gt; đã được đóng gói chuẩn W3C XMLDSig vào XML.
          </p>
        </div>
      </div>

      {isMultiSigned && signatureInfo.signatures ? (
        <div className="space-y-2.5">
          {signatureInfo.signatures.map((sig, idx) => (
            <div
              key={sig.signatureId || idx}
              className="p-3.5 bg-white rounded-xl border border-emerald-200 space-y-2 text-xs text-slate-700 shadow-xs"
            >
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <Info size={13} />
                  Chữ ký #{idx + 1}
                  {idx === 0
                    ? " (Người lập biểu / Bác sĩ)"
                    : " (Thủ trưởng đơn vị / Cơ sở KCB)"}
                </span>
                {sig.signatureId && (
                  <span className="font-mono text-[10px] text-slate-400">
                    {sig.signatureId}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="sm:col-span-2">
                  <b className="text-slate-500">Chủ thể:</b>{" "}
                  <span className="font-mono font-semibold text-slate-900">
                    {sig.subjectDN || "Chữ ký hợp lệ"}
                  </span>
                </div>
                <div>
                  <b className="text-slate-500">Serial:</b>{" "}
                  <span className="font-mono text-slate-900">
                    {sig.serialNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <b className="text-slate-500">Thời gian:</b>{" "}
                  <span className="font-mono text-slate-900">
                    {sig.signingTime || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-2 text-xs text-slate-700 shadow-xs">
          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
            <Info size={14} className="text-emerald-600" />
            Thông Tin Chứng Thư Số & Chữ Ký Đã Ký
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="sm:col-span-2">
              <b className="text-slate-500">Chủ thể (Subject):</b>{" "}
              <span className="font-mono font-semibold text-slate-900">
                {signatureInfo.subjectDN ||
                  credential?.cert?.subjectDN ||
                  `CN=${signerName || "NGƯỜI KÝ"}, UID=${identityValue}, O=PHÒNG KHÁM, C=VN`}
              </span>
            </div>
            {signerEmail && (
              <div className="sm:col-span-2">
                <b className="text-slate-500">Email người ký:</b>{" "}
                <span className="font-mono font-semibold text-slate-900">
                  {signerEmail}
                </span>
              </div>
            )}
            <div>
              <b className="text-slate-500">Mã Serial:</b>{" "}
              <span className="font-mono text-slate-900">
                {signatureInfo.serialNumber ||
                  credential?.cert?.serialNumber ||
                  `SMARTCA_${identityValue}`}
              </span>
            </div>
            <div>
              <b className="text-slate-500">Thời gian ký:</b>{" "}
              <span className="font-mono text-slate-900">
                {signatureInfo.signingTime || new Date().toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5 flex-wrap pt-1">
        <button
          type="button"
          onClick={onCopySignedXml}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          {copiedKey === "signedXml" ? (
            <Check size={14} className="text-emerald-600" />
          ) : (
            <Copy size={14} />
          )}
          <span>
            {copiedKey === "signedXml" ? "Đã Sao Chép" : "Sao Chép XML Đã Ký"}
          </span>
        </button>

        {onDownloadSignedXml && (
          <button
            type="button"
            onClick={onDownloadSignedXml}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Download size={14} />
            <span>Tải File XML Đã Ký</span>
          </button>
        )}

        {onCountersign && (
          <button
            type="button"
            onClick={onCountersign}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Ký thêm chữ ký (bác sĩ hoặc thủ trưởng đơn vị) bảo toàn chữ ký cũ"
          >
            <UserPlus size={14} />
            <span>Ký Thêm / Đồng Ký (Countersign)</span>
          </button>
        )}

        <button
          type="button"
          onClick={onResetAndResign}
          className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ml-auto cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Hủy Chữ Ký / Ký Lại Từ Đầu</span>
        </button>
      </div>
    </div>
  );
};

