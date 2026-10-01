import React, { useState } from "react";
import { X, ShieldCheck, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { SmartCaSignPanel } from "./SmartCaSignPanel";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import { useToast } from "../../context/ToastContext";
import {
  downloadXmlFile,
  DEFAULT_MA_CSKCB,
  DEFAULT_CLINIC_NAME,
  xmlToBase64,
} from "../../utils/shared/excelXmlShared";
import {
  BhxhChungTuService,
  BHXH_CONFIG,
} from "../../services/bhxh/bhxhChungTuService";

export interface GlobalSmartCaSignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSmartCaSignModal: React.FC<GlobalSmartCaSignModalProps> = ({
  isOpen,
  onClose,
}) => {
  useModalBehavior(isOpen, onClose);
  const toast = useToast();

  const [signedXml, setSignedXml] = useState<string | null>(null);
  const [isSendingBhxh, setIsSendingBhxh] = useState(false);
  const [bhxhResponse, setBhxhResponse] = useState<any>(null);

  if (!isOpen) return null;

  const handleSignedSuccess = (newSignedXml: string) => {
    setSignedXml(newSignedXml);
    toast.success(
      "Đã ký số thành công bằng VNPT SmartCA (Q1)",
      "Ký Số Thành Công",
    );
  };

  const handleResetSignature = () => {
    setSignedXml(null);
    setBhxhResponse(null);
  };

  const handleDownloadSigned = () => {
    if (!signedXml) return;
    downloadXmlFile(signedXml, `HOSO_DULIEU_DA_KY_${Date.now()}.xml`);
    toast.info("Đã tải tệp XML có chữ ký điện tử về máy tính.", "Tải XML");
  };

  const handleSendBhxh = async () => {
    if (!signedXml) {
      toast.warning(
        "Vui lòng thực hiện ký số tài liệu trước khi gửi lên Cổng BHXH.",
        "Chưa Ký Số",
      );
      return;
    }

    setIsSendingBhxh(true);
    try {
      const isProduction = BHXH_CONFIG.ENV === "production";
      const fileBase64Str = xmlToBase64(signedXml);

      if (isProduction) {
        // --- 1. MÔI TRƯỜNG PRODUCTION (CỔNG THẬT BHXH) ---
        if (!BHXH_CONFIG.USERNAME || !BHXH_CONFIG.PASSWORD) {
          const errMsg =
            "Chưa cấu hình VITE_BHXH_USERNAME hoặc VITE_BHXH_PASSWORD trong file .env cho Cổng Production!";
          toast.warning(errMsg, "Thiếu Cấu Hình BHXH");
          setBhxhResponse({
            maKetQua: "401",
            thongDiep: errMsg,
            maGiaoDich: "CHƯA CẤU HÌNH",
            ngayTiepNhan: new Date().toLocaleString("vi-VN"),
            isError: true,
            moiTruong: "Cổng Thật (Production)",
          });
          return;
        }

        // Bước 1: Lấy Token xác thực từ Cổng BHXH Production
        const tokenRes = await BhxhChungTuService.takeToken(undefined, "production");
        if (tokenRes.maKetQua !== "200" || !tokenRes.apiToken) {
          const errDetail =
            tokenRes.thongDiep || "Không thể lấy Token xác thực từ Cổng BHXH";
          toast.error(errDetail, "Lỗi Xác Thực BHXH");
          setBhxhResponse({
            maKetQua: tokenRes.maKetQua || "500",
            thongDiep: errDetail,
            maGiaoDich: "LỖI KẾT NỐI",
            ngayTiepNhan: new Date().toLocaleString("vi-VN"),
            isError: true,
            moiTruong: "Cổng Thật (Production)",
          });
          return;
        }

        // Bước 2: Gửi hồ sơ chứng từ đã ký (Mã 39) lên Cổng BHXH Production
        const sendRes = await BhxhChungTuService.guiHoSoChungTu2025(
          {
            token: tokenRes.apiToken,
            fileBase64Str,
            loaiHs: "39",
          },
          "production",
        );

        if (sendRes.maKetQua === "200") {
          setBhxhResponse({
            maKetQua: "200",
            thongDiep:
              sendRes.ghiChu ||
              "Hồ sơ chứng từ đã được tiếp nhận thành công trên Cổng BHXH Việt Nam.",
            maGiaoDich: sendRes.maGiaoDich || `BHXH-TT25-${Date.now()}`,
            ngayTiepNhan: new Date().toLocaleString("vi-VN"),
            isError: false,
            moiTruong: "Cổng Thật (Production)",
          });
          toast.success(
            "Đã gửi hồ sơ lên Cổng BHXH Production thành công!",
            "Liên Thông BHXH",
          );
        } else {
          setBhxhResponse({
            maKetQua: sendRes.maKetQua || "400",
            thongDiep:
              sendRes.ghiChu || "Cổng BHXH từ chối tiếp nhận hồ sơ chứng từ.",
            maGiaoDich: sendRes.maGiaoDich || "TỪ CHỐI TIẾP NHẬN",
            ngayTiepNhan: new Date().toLocaleString("vi-VN"),
            isError: true,
            moiTruong: "Cổng Thật (Production)",
          });
          toast.error(
            sendRes.ghiChu || "Cổng BHXH từ chối tiếp nhận hồ sơ",
            "Lỗi Tiếp Nhận",
          );
        }
      } else {
        // --- 2. MÔI TRƯỜNG SANDBOX (THỬ NGHIỆM) ---
        const tokenRes = await BhxhChungTuService.takeToken(undefined, "sandbox");
        const sendRes = await BhxhChungTuService.guiHoSoChungTu2025(
          {
            token: tokenRes.apiToken || "",
            fileBase64Str,
            loaiHs: "39",
          },
          "sandbox",
        );

        const isSuccess = String(sendRes.maKetQua) === "200";
        if (isSuccess) {
          setBhxhResponse({
            maKetQua: sendRes.maKetQua,
            thongDiep:
              sendRes.ghiChu ||
              "Hồ sơ đã được tiếp nhận thành công vào hệ thống BHXH (Thử nghiệm)",
            maGiaoDich: sendRes.maGiaoDich || `BHXH-TT25-${Date.now()}`,
            ngayTiepNhan: new Date().toLocaleString("vi-VN"),
            isError: false,
            moiTruong: "Thử Nghiệm (Sandbox)",
          });
          toast.success(
            "Đã gửi hồ sơ lên Cổng BHXH (Thử nghiệm) thành công!",
            "Liên Thông BHXH",
          );
        } else {
          setBhxhResponse({
            maKetQua: sendRes.maKetQua || "400",
            thongDiep:
              sendRes.ghiChu ||
              `Cổng BHXH từ chối hoặc phản hồi mã: ${sendRes.maKetQua}`,
            maGiaoDich: sendRes.maGiaoDich || "TỪ CHỐI TIẾP NHẬN",
            ngayTiepNhan: new Date().toLocaleString("vi-VN"),
            isError: true,
            moiTruong: "Thử Nghiệm (Sandbox)",
          });
          toast.error(
            sendRes.ghiChu || `Cổng BHXH phản hồi mã lỗi: ${sendRes.maKetQua}`,
            "Lỗi Tiếp Nhận",
          );
        }
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "Gửi dữ liệu lên Cổng BHXH thất bại";
      toast.error(errMsg, "Lỗi Cổng BHXH");
      setBhxhResponse({
        maKetQua: "500",
        thongDiep: errMsg,
        maGiaoDich: "LỖI HỆ THỐNG",
        ngayTiepNhan: new Date().toLocaleString("vi-VN"),
        isError: true,
        moiTruong:
          BHXH_CONFIG.ENV === "production"
            ? "Cổng Thật (Production)"
            : "Thử Nghiệm (Sandbox)",
      });
    } finally {
      setIsSendingBhxh(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-[#1677ff] border border-blue-100 flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Trung Tâm Ký Số SmartCA & Liên Thông Cổng BHXH
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1677ff] border border-blue-200">
                  Quy Trình 1 (Q1)
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    BHXH_CONFIG.ENV === "production"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-amber-50 text-amber-800 border-amber-300"
                  }`}
                >
                  {BHXH_CONFIG.ENV === "production"
                    ? "Cổng Thật BHXH (Production)"
                    : "Cổng Thử Nghiệm BHXH (Sandbox)"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ký số từ xa chuẩn W3C XMLDSig cho Hồ sơ Thông tư 25/2025/TT-BYT
                & QĐ 130
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-[#f8fafc]">
          <SmartCaSignPanel
            xmlContent={`<?xml version="1.0" encoding="UTF-8"?>\n<HSCHUNGTU xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n  <THONGTINCHUNGTU>\n    <MACSKCB>${DEFAULT_MA_CSKCB}</MACSKCB>\n    <SOLUONGHOSO>1</SOLUONGHOSO>\n  </THONGTINCHUNGTU>\n</HSCHUNGTU>`}
            signedXml={signedXml || undefined}
            fileName={`HOSO_CHUNGTU_TT25_${DEFAULT_MA_CSKCB}.xml`}
            itemsCount={1}
            itemLabel="chứng từ"
            onSignedSuccess={handleSignedSuccess}
            onResetSignature={handleResetSignature}
            onDownloadSignedXml={handleDownloadSigned}
          />

          {/* Phản hồi Cổng BHXH nếu đã gửi */}
          {bhxhResponse && (
            <div
              className={`p-4 rounded-xl border space-y-2 animate-fadeIn ${
                bhxhResponse.isError
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : "bg-emerald-50 border-emerald-200 text-emerald-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold">
                  {bhxhResponse.isError ? (
                    <AlertCircle size={18} className="text-rose-600" />
                  ) : (
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  )}
                  <span>
                    {bhxhResponse.isError
                      ? "Cổng Tiếp Nhận BHXH Báo Lỗi / Từ Chối"
                      : "Cổng Tiếp Nhận BHXH Phản Hồi Kết Quả Tiếp Nhận"}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    bhxhResponse.moiTruong?.includes("Production")
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-amber-100 text-amber-800 border-amber-300"
                  }`}
                >
                  {bhxhResponse.moiTruong}
                </span>
              </div>
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs ${
                  bhxhResponse.isError ? "text-rose-800" : "text-emerald-800"
                }`}
              >
                <div>
                  Mã Giao Dịch:{" "}
                  <strong className="font-mono">
                    {bhxhResponse.maGiaoDich}
                  </strong>
                </div>
                <div>
                  Thời Gian:{" "}
                  <strong className="font-mono">
                    {bhxhResponse.ngayTiepNhan}
                  </strong>
                </div>
                <div className="sm:col-span-2">
                  Nội Dung: <span>{bhxhResponse.thongDiep}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Mã CS: <strong className="text-slate-800 font-mono">{DEFAULT_MA_CSKCB}</strong> |
            Cơ sở: <strong className="text-slate-800">{DEFAULT_CLINIC_NAME}</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {signedXml && (
              <button
                type="button"
                onClick={handleSendBhxh}
                disabled={isSendingBhxh}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
                  BHXH_CONFIG.ENV === "production"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <Send size={15} />
                <span>
                  {isSendingBhxh
                    ? "Đang Gửi Lên Cổng..."
                    : BHXH_CONFIG.ENV === "production"
                    ? "Gửi Trực Tiếp Cổng Thật BHXH"
                    : "Gửi Thử Nghiệm (Sandbox)"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
