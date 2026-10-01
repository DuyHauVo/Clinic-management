import React, { useState, useMemo } from "react";
import {
  FileCode,
  Send,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";
import {
  DEFAULT_MA_CSKCB,
  DEFAULT_MA_TINH,
  xmlToBase64,
  downloadXmlFile,
} from "../../utils/shared/excelXmlShared";
import { useClipboard } from "../../hooks/useClipboard";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import { SmartCaSignPanel } from "./SmartCaSignPanel";
import type { SmartCaSignResponse } from "../../services/smartca/smartcaHandlers";
import { extractXmlSignature } from "../../utils/xmlDsigEngine";

export interface SourceFileUploadInfo {
  fileName: string;
  selectedSheet?: string;
  totalRows?: number;
}

export interface XmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  loaiHsBadge: string;
  itemsCount: number;
  itemLabel?: string;
  xmlContent: string;
  base64Content: string;
  apiEndpoint?: string;
  loaiHsCode?: string;
  tab: "xml" | "base64" | "api" | "smartca";
  onTabChange: (tab: "xml" | "base64" | "api" | "smartca") => void;
  isKeyCopied?: (key: string) => boolean;
  onCopy?: (text: string, message?: string, key?: string) => void;
  onExportXml: () => void;
  onSendApi: (signatureResult?: any) => void;
  isSendingApi: boolean;
  apiResponse: any;
  /** Tên file XML (mặc định tự tạo theo loaiHsCode & maCskcb) */
  customFileName?: string;
  /** Bật tab Ký Số SmartCA (mặc định: bật cho tất cả danh mục & hồ sơ) */
  enableSmartCa?: boolean;
  /** Thông tin tệp nguồn đã nạp ở trang chủ (Excel/CSV) */
  sourceFileInfo?: SourceFileUploadInfo | null;
}

export const XmlExportModal: React.FC<XmlExportModalProps> = ({
  isOpen,
  onClose,
  title,
  loaiHsBadge,
  itemsCount,
  itemLabel = "bản ghi",
  xmlContent,
  base64Content: initialBase64,
  apiEndpoint = "https://egw.baohiemxahoi.gov.vn/api/DanhMucGW",
  loaiHsCode = "70",
  tab,
  onTabChange,
  isKeyCopied: externalIsKeyCopied,
  onCopy: externalOnCopy,
  onExportXml,
  onSendApi,
  isSendingApi,
  apiResponse,
  customFileName,
  enableSmartCa = true,
  sourceFileInfo,
}) => {
  const { isKeyCopied: internalIsKeyCopied, copy: internalCopy } =
    useClipboard();
  const {
    handleBackdropMouseDown,
    handleBackdropClick,
    handleStopPropagation,
  } = useModalBehavior(isOpen, onClose);

  // Trạng thái nội bộ cho tệp XML đã ký số
  const [signedXml, setSignedXml] = useState<string | null>(null);
  const [signResponse, setSignResponse] =
    useState<SmartCaSignResponse | null>(null);

  const isKeyCopied = externalIsKeyCopied || internalIsKeyCopied;
  const handleCopy = externalOnCopy || internalCopy;

  // Tên file hiển thị chuẩn
  const effectiveFileName = useMemo(() => {
    if (customFileName) return customFileName;
    return `HS_BHYT_LOAI${loaiHsCode}_${DEFAULT_MA_CSKCB}.xml`;
  }, [customFileName, loaiHsCode]);

  // Nội dung XML hiệu lực (Ưu tiên bản đã ký số nếu có)
  const effectiveXml = signedXml || xmlContent;
  const effectiveBase64 = useMemo(() => {
    if (signedXml) {
      return xmlToBase64(signedXml);
    }
    return initialBase64 || (xmlContent ? xmlToBase64(xmlContent) : "");
  }, [signedXml, initialBase64, xmlContent]);

  // Kiểm tra xem XML hiện tại đã có chữ ký chuẩn chưa
  const signatureInfo = useMemo(() => {
    return extractXmlSignature(effectiveXml);
  }, [effectiveXml]);

  const isSigned = signatureInfo.hasSignature;

  // Xử lý khi ký số thành công
  const handleSignedSuccess = (
    newSignedXml: string,
    res: SmartCaSignResponse,
  ) => {
    setSignedXml(newSignedXml);
    setSignResponse(res);
  };

  // Reset về trạng thái chưa ký
  const handleResetSignature = () => {
    setSignedXml(null);
    setSignResponse(null);
  };

  // Tải file XML (tự động tải bản đã ký nếu có)
  const handleDownloadEffectiveXml = () => {
    if (signedXml) {
      downloadXmlFile(signedXml, effectiveFileName);
    } else {
      onExportXml();
    }
  };

  // ==========================================
  // EVENT HANDLERS (Được tách riêng sạch sẽ để dễ maintain)
  // ==========================================
  const handleCloseModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  const handlePreventDrag = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSelectTabXml = () => onTabChange("xml");
  const handleSelectTabBase64 = () => onTabChange("base64");
  const handleSelectTabApi = () => onTabChange("api");
  const handleSelectTabSmartCa = () => onTabChange("smartca");

  const handleCopyXml = () => {
    handleCopy(effectiveXml, "Đã sao chép nội dung XML vào bộ nhớ đệm!", "xml");
  };

  const handleCopyBase64 = () => {
    handleCopy(
      effectiveBase64,
      "Đã sao chép chuỗi Base64 vào bộ nhớ đệm!",
      "base64",
    );
  };

  const curlCommandText = useMemo(() => {
    const shortBase64 = effectiveBase64.substring(0, 40);
    return `curl --location '${apiEndpoint}' \\
--header 'accessToken: {access_token}' \\
--header 'tokenId: {token_id}' \\
--header 'passwordHash: {md5_hash}' \\
--header 'Content-Type: application/x-www-form-urlencoded' \\
--data-urlencode 'username=${DEFAULT_MA_CSKCB}_BV' \\
--data-urlencode 'loaiHs=${loaiHsCode}' \\
--data-urlencode 'maTinh=${DEFAULT_MA_TINH}' \\
--data-urlencode 'maCskcb=${DEFAULT_MA_CSKCB}' \\
--data-urlencode 'fileHsBase64=${shortBase64}...'`;
  }, [apiEndpoint, loaiHsCode, effectiveBase64]);

  const handleCopyCurlCommand = () => {
    handleCopy(curlCommandText);
  };

  const handleSendApiClick = () => {
    onSendApi(signResponse);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 ant-modal-anim"
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full h-[88vh] max-h-[850px] flex flex-col shadow-2xl overflow-hidden border border-slate-200 select-none"
        onMouseDown={handleStopPropagation}
        onClick={handleStopPropagation}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isSigned
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-[#1677ff]"
              }`}
            >
              {isSigned ? <ShieldCheck size={20} /> : <FileCode size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-slate-900">
                  {title}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {loaiHsBadge}
                </span>
                {isSigned && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 animate-pulse">
                    <Check size={11} /> ĐÃ KÝ SỐ XMLDSIG
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dữ liệu hiện hành • {itemsCount} {itemLabel}
                {sourceFileInfo?.fileName && (
                  <>
                    {" "}• Nguồn:{" "}
                    <b className="font-semibold text-slate-700">
                      {sourceFileInfo.fileName}
                      {sourceFileInfo.selectedSheet ? ` [${sourceFileInfo.selectedSheet}]` : ""}
                    </b>
                  </>
                )}
                {" "}• Tệp:{" "}
                <b className="font-mono text-slate-700">{effectiveFileName}</b>
              </p>
            </div>
          </div>
          <button
            type="button"
            onMouseDown={handleCloseModal}
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 active:scale-95 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold text-lg cursor-pointer select-none transition-colors"
            title="Đóng (Esc)"
          >
            &times;
          </button>
        </div>

        {/* Tab Selector (Cố định ở trên, không bị cuộn mất) */}
        {itemsCount > 0 && (
          <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2 flex-wrap shrink-0 select-none">
            <button
              type="button"
              onClick={handleSelectTabXml}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                tab === "xml"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <FileCode size={14} />
              <span>XML Gốc</span>
              {isSigned && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              )}
            </button>

            <button
              type="button"
              onClick={handleSelectTabBase64}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                tab === "base64"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <FileCode size={14} />
              <span>Chuỗi Base64 {isSigned ? "Đã Ký Số" : ""}</span>
            </button>

            <button
              type="button"
              onClick={handleSelectTabApi}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                tab === "api"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <Send size={14} />
              <span>Cổng Tiếp Nhận BHXH API</span>
            </button>

            {/* TAB KÝ SỐ SMARTCA (Q1) */}
            {enableSmartCa && (
              <button
                type="button"
                onClick={handleSelectTabSmartCa}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer ${
                  tab === "smartca"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : isSigned
                      ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                }`}
              >
                <Fingerprint size={14} />
                <span>Ký Số SmartCA (Q1)</span>
                {isSigned && (
                  <ShieldCheck size={14} className="text-emerald-500" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Modal Body Container */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {itemsCount === 0 && tab !== "smartca" ? (
            <div className="p-8 m-auto text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Chưa có dữ liệu
              </p>
              <p className="text-xs text-slate-500">
                Vui lòng nạp hoặc nhập dữ liệu trước khi xem mã XML và Base64.
              </p>
            </div>
          ) : (
            <>
              {/* Tab Content: KÝ SỐ SMARTCA */}
              {tab === "smartca" && (
                <div className="flex-1 min-h-0 overflow-y-auto p-6">
                  <SmartCaSignPanel
                    xmlContent={xmlContent}
                    signedXml={signedXml || undefined}
                    fileName={effectiveFileName}
                    itemsCount={itemsCount}
                    itemLabel={itemLabel}
                    signatureInfo={signatureInfo}
                    sourceFileInfo={sourceFileInfo}
                    onSignedSuccess={handleSignedSuccess}
                    onResetSignature={handleResetSignature}
                    onDownloadSignedXml={handleDownloadEffectiveXml}
                    onViewXml={handleSelectTabXml}
                  />
                </div>
              )}

              {/* Tab Content: XML GỐC / XML ĐÃ KÝ */}
              {tab === "xml" && (
                <div className="flex-1 min-h-0 p-6 flex flex-col space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 shrink-0 select-none">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-semibold">
                        Kích thước XML:{" "}
                        <b>{(effectiveXml.length / 1024).toFixed(2)} KB</b> •{" "}
                        {itemsCount} {itemLabel}
                      </span>
                      {isSigned && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Check size={11} /> Đã đóng gói &lt;CHUKYDONVI&gt;
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyXml}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        {isKeyCopied("xml") ? (
                          <Check size={14} className="text-emerald-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                        {isKeyCopied("xml") ? "Đã chép" : "Sao chép XML"}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadEffectiveXml}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Download size={14} />
                        {isSigned ? "Tải File .XML Đã Ký" : "Tải File .XML"}
                      </button>
                    </div>
                  </div>

                  {/* Banner nhắc nhở ký số nếu chưa ký */}
                  {!isSigned && enableSmartCa && (
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2 shrink-0 select-none">
                      <Fingerprint
                        size={15}
                        className="text-indigo-600 shrink-0"
                      />
                      <span>
                        File XML này <b>chưa có chữ ký số</b>. Bạn có thể
                        chuyển sang tab <b>"Ký Số SmartCA (Q1)"</b> ở phía trên để thực hiện ký
                        số trước khi gửi Cổng BHXH.
                      </span>
                    </div>
                  )}

                  {/* Khung xem XML dùng textarea readOnly: chống đơ chuột / kẹt selection 100% khi bôi đen liên tục */}
                  <div className="flex-1 min-h-0">
                    <textarea
                      readOnly
                      draggable={false}
                      onDragStart={handlePreventDrag}
                      spellCheck={false}
                      value={effectiveXml}
                      className="w-full h-full p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-2xl resize-none outline-none leading-relaxed border border-slate-800 selection:bg-blue-600 selection:text-white no-drag-select"
                    />
                  </div>
                </div>
              )}

              {/* Tab Content: Base64 */}
              {tab === "base64" && (
                <div className="flex-1 min-h-0 p-6 flex flex-col space-y-3">
                  <div className="flex items-center justify-between shrink-0 select-none">
                    <span className="text-xs text-slate-500 font-semibold">
                      Chuỗi Base64 UTF-8 (dùng cho trường{" "}
                      <code>fileHsBase64</code> trong API Cổng BHXH):
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyBase64}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      {isKeyCopied("base64") ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                      {isKeyCopied("base64") ? "Đã chép" : "Sao chép Base64"}
                    </button>
                  </div>
                  <div className="flex-1 min-h-0">
                    <textarea
                      readOnly
                      draggable={false}
                      onDragStart={handlePreventDrag}
                      spellCheck={false}
                      value={effectiveBase64}
                      className="w-full h-full p-4 bg-slate-900 text-sky-400 font-mono text-[11px] rounded-2xl resize-none outline-none leading-relaxed border border-slate-800 selection:bg-blue-600 selection:text-white no-drag-select"
                    />
                  </div>
                </div>
              )}

              {/* Tab Content: API Cổng Tiếp Nhận */}
              {tab === "api" && (
                <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
                  <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1 select-none">
                    <div className="font-extrabold flex items-center gap-1.5">
                      <Send size={15} />
                      Đặc tả kỹ thuật Cổng BHXH Việt Nam:
                    </div>
                    <div>
                      • <b>URL:</b>{" "}
                      <code className="bg-white px-2 py-0.5 rounded-md border border-blue-200 font-mono">
                        {apiEndpoint}
                      </code>
                    </div>
                    <div>
                      • <b>Method:</b> POST • <b>Content-Type:</b>{" "}
                      application/x-www-form-urlencoded; charset=utf-8
                    </div>
                    <div>
                      • <b>Body Params:</b> username, loaiHs={loaiHsCode},
                      maTinh={DEFAULT_MA_TINH}, maCskcb={DEFAULT_MA_CSKCB},
                      fileHsBase64
                    </div>
                  </div>

                  {/* Trạng thái đính kèm chữ ký */}
                  <div
                    className={`p-3 rounded-2xl border text-xs font-medium flex items-center justify-between ${
                      isSigned
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Fingerprint
                        size={16}
                        className={
                          isSigned ? "text-emerald-600" : "text-slate-400"
                        }
                      />
                      <span>
                        {isSigned
                          ? `Hồ sơ ĐÃ KÝ SỐ (Mã giao dịch: ${signResponse?.tranId || "TRAN_Q1_COMPLETED"}) - Chuỗi Base64 đã đóng gói chữ ký hoàn chỉnh.`
                          : "Hồ sơ CHƯA ký số - Bạn có thể bấm ký số ở tab Ký Số SmartCA trước khi gửi cổng."}
                      </span>
                    </div>
                    {!isSigned && (
                      <button
                        type="button"
                        onClick={handleSelectTabSmartCa}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline shrink-0 cursor-pointer"
                      >
                        Ký số ngay
                      </button>
                    )}
                  </div>

                  {/* cURL Example Box */}
                  <div className="space-y-1.5 select-none">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Mẫu lệnh cURL kiểm thử Postman / Terminal:</span>
                      <button
                        type="button"
                        onClick={handleCopyCurlCommand}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={12} /> Sao chép cURL
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 text-amber-300 font-mono text-[10px] rounded-xl overflow-x-auto border border-slate-800 leading-relaxed select-text">
                      {curlCommandText}
                    </pre>
                  </div>

                  {/* Response Display */}
                  {apiResponse && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="font-black text-xs text-emerald-900 flex items-center gap-1.5">
                        <Check size={16} className="text-emerald-600" />
                        Kết quả phản hồi từ Cổng tiếp nhận (Response 200 OK):
                      </div>
                      <pre className="p-3 bg-white border border-emerald-200 rounded-xl font-mono text-[11px] text-emerald-800 overflow-x-auto select-text">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 select-none">
                    <button
                      type="button"
                      disabled={isSendingApi}
                      onClick={handleSendApiClick}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 transition-all cursor-pointer ${
                        isSendingApi
                          ? "bg-slate-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                      }`}
                    >
                      <Send size={15} />
                      <span>
                        {isSendingApi
                          ? "Đang gửi Cổng Giám Định..."
                          : "Gửi Lên Cổng BHXH"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer (Cố định ở dưới, nút Đóng luôn phản hồi) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 select-none">
          <div className="text-xs text-slate-500">
            Tổng số: <b>{itemsCount}</b> {itemLabel}
            {isSigned && (
              <span className="ml-2 font-bold text-emerald-700 inline-flex items-center gap-1">
                <Check size={12} /> Đã ký số
              </span>
            )}
          </div>
          <button
            type="button"
            onMouseDown={handleCloseModal}
            onClick={handleCloseModal}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer select-none"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
