import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  FileCode,
  Send,
  Copy,
  Check,
  CheckCircle2,
  Download,
  AlertTriangle,
  Fingerprint,
  ShieldCheck,
  Upload,
  RefreshCw,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
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
import { formatBhxhPassword } from "../../utils/crypto/md5";
import { BhxhChungTuService, BHXH_CONFIG } from "../../services/bhxh/bhxhChungTuService";

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

  // Trạng thái nội bộ cho tệp XML đã ký số hoặc tải lên từ máy tính
  const [signedXml, setSignedXml] = useState<string | null>(null);
  const [uploadedCustomFileName, setUploadedCustomFileName] = useState<string | null>(null);
  const [signResponse, setSignResponse] =
    useState<SmartCaSignResponse | null>(null);
  const xmlFileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Trạng thái phiên làm việc Token Cổng BHXH (API /api/token/take)
  const [tokenSession, setTokenSession] = useState<{
    accessToken: string;
    tokenId: string;
    passwordHash: string;
    isLoading: boolean;
    error: string | null;
    status: "idle" | "loading" | "success" | "error";
    expiresIn?: string;
  }>({
    accessToken: "",
    tokenId: "",
    passwordHash: formatBhxhPassword(import.meta.env.VITE_BHXH_PASSWORD || BHXH_CONFIG.PASSWORD || ""),
    isLoading: false,
    error: null,
    status: "idle",
  });

  const handleFetchSessionToken = useCallback(async (isSilent = false) => {
    setTokenSession((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      status: "loading",
    }));
    try {
      const res = await BhxhChungTuService.takeToken();
      const pwdHash = res.passwordHash || formatBhxhPassword(import.meta.env.VITE_BHXH_PASSWORD || BHXH_CONFIG.PASSWORD || "");
      if (String(res.maKetQua) === "200" && (res.apiToken || res.APIKey?.access_token)) {
        setTokenSession({
          accessToken: res.apiToken || res.APIKey?.access_token || "",
          tokenId: res.idToken || res.APIKey?.id_token || "",
          passwordHash: pwdHash,
          isLoading: false,
          error: null,
          status: "success",
          expiresIn: res.APIKey?.expires_in,
        });
        if (!isSilent) {
          toast.success("Đã lấy thành công Token phiên làm việc Cổng BHXH!", "Kết Nối Thành Công");
        }
      } else {
        setTokenSession((prev) => ({
          ...prev,
          passwordHash: pwdHash,
          isLoading: false,
          error: res.thongDiep || `Cổng BHXH từ chối xác thực (Mã kết quả: ${res.maKetQua})`,
          status: "error",
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể kết nối máy chủ Cổng BHXH";
      setTokenSession((prev) => ({
        ...prev,
        isLoading: false,
        error: msg,
        status: "error",
      }));
    }
  }, [toast]);

  // Tự động kiểm tra và lấy token khi người dùng chuyển sang tab "api"
  useEffect(() => {
    if (isOpen && tab === "api" && tokenSession.status === "idle") {
      handleFetchSessionToken(true);
    }
  }, [isOpen, tab, tokenSession.status, handleFetchSessionToken]);

  const isKeyCopied = externalIsKeyCopied || internalIsKeyCopied;
  const handleCopy = externalOnCopy || internalCopy;

  // Tên file hiển thị chuẩn (ưu tiên file người dùng tải lên)
  const effectiveFileName = useMemo(() => {
    if (uploadedCustomFileName) return uploadedCustomFileName;
    if (customFileName) return customFileName;
    return `HS_BHYT_LOAI${loaiHsCode}_${DEFAULT_MA_CSKCB}.xml`;
  }, [uploadedCustomFileName, customFileName, loaiHsCode]);

  // Xử lý nạp tệp XML đã ký từ máy tính
  const handleUploadXmlClick = () => {
    xmlFileInputRef.current?.click();
  };

  const handleXmlFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      if (!text || !text.includes("<")) {
        toast.error("Tệp tải lên không phải định dạng XML hợp lệ!", "Lỗi Định Dạng");
        return;
      }
      const sig = extractXmlSignature(text);
      setSignedXml(text);
      setUploadedCustomFileName(file.name);
      if (sig.hasSignature) {
        toast.success(`Đã nạp tệp XML đã ký: ${file.name}. Đã xác thực chữ ký số XML-DSig!`, "Tải Lên Thành Công");
      } else {
        toast.warning(`Tệp ${file.name} chưa có chữ ký số. Bạn có thể ký số ở tab SmartCA.`, "Chưa Ký Số");
      }
    } catch (err: unknown) {
      toast.error("Không thể đọc tệp XML: " + (err instanceof Error ? err.message : ""), "Lỗi Tải Tệp");
    } finally {
      e.target.value = "";
    }
  };

  const handleClearUploadedXml = () => {
    setSignedXml(null);
    setUploadedCustomFileName(null);
    setSignResponse(null);
    toast.info("Đã khôi phục lại dữ liệu XML tự động sinh từ bảng.", "Khôi Phục");
  };

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
    const pwdHash = tokenSession.passwordHash || formatBhxhPassword(import.meta.env.VITE_BHXH_PASSWORD || BHXH_CONFIG.PASSWORD || "");
    const accToken = tokenSession.accessToken || "{access_token}";
    const tokId = tokenSession.tokenId || "{token_id}";

    return `curl --location '${apiEndpoint}' \\
--header 'accessToken: ${accToken}' \\
--header 'tokenId: ${tokId}' \\
--header 'passwordHash: ${pwdHash}' \\
--header 'Content-Type: application/x-www-form-urlencoded' \\
--data-urlencode 'username=${DEFAULT_MA_CSKCB}_BV' \\
--data-urlencode 'loaiHs=${loaiHsCode}' \\
--data-urlencode 'maTinh=${DEFAULT_MA_TINH}' \\
--data-urlencode 'maCskcb=${DEFAULT_MA_CSKCB}' \\
--data-urlencode 'fileHsBase64=${shortBase64}...'`;
  }, [apiEndpoint, loaiHsCode, effectiveBase64, tokenSession]);

  const handleCopyCurlCommand = () => {
    handleCopy(curlCommandText);
  };

  const handleSendApiClick = () => {
    if (!isSigned) {
      toast.warning(
        "Hồ sơ chưa có chữ ký số! Cổng BHXH bắt buộc gói dữ liệu XML phải có chữ ký điện tử hợp lệ (<CHUKYDONVI> hoặc <Signature>) trước khi gửi. Vui lòng ký số qua SmartCA hoặc tải lên tệp XML đã ký sẵn.",
        "Bắt Buộc Chữ Ký Số"
      );
      if (enableSmartCa) {
        onTabChange("smartca");
      }
      return;
    }

    onSendApi({
      signResponse,
      fileBase64: effectiveBase64,
      signedXml: effectiveXml,
    });
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
                {uploadedCustomFileName ? (
                  <span>
                    Đã nạp tệp từ máy • <b className="font-semibold text-slate-700">{uploadedCustomFileName}</b>
                  </span>
                ) : (
                  <span>Dữ liệu hiện hành • {itemsCount} {itemLabel}</span>
                )}
                {sourceFileInfo?.fileName && !uploadedCustomFileName && (
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

        {/* Tab Selector & Nút Tải Lên XML Đã Ký (Luôn hiển thị kể cả khi chưa có dữ liệu bảng) */}
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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

          {/* Nút Tải Lên Tệp XML Đã Ký từ máy tính (Chỉ hiện ở thanh tab khi đã có dữ liệu hoặc đã tải lên file để tránh trùng với nút ở khung trống) */}
          <div className="flex items-center gap-2 ml-auto">
            {uploadedCustomFileName ? (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="truncate max-w-[140px] font-semibold" title={uploadedCustomFileName}>
                  {uploadedCustomFileName}
                </span>
                <button
                  type="button"
                  onClick={handleClearUploadedXml}
                  className="text-[11px] text-amber-700 hover:text-amber-950 underline font-bold cursor-pointer"
                  title="Khôi phục lại dữ liệu XML tự động sinh từ bảng"
                >
                  Hủy
                </button>
              </div>
            ) : null}

            {(itemsCount > 0 || signedXml) && (
              <button
                type="button"
                onClick={handleUploadXmlClick}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 active:scale-95 shadow-2xs"
                title="Tải lên tệp XML đã ký sẵn từ máy tính (USB Token hoặc phần mềm khác)"
              >
                <Upload size={14} className="text-indigo-600" />
                <span>Tải Lên XML Đã Ký</span>
              </button>
            )}
            <input
              ref={xmlFileInputRef}
              type="file"
              accept=".xml,text/xml,application/xml"
              onChange={handleXmlFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {itemsCount === 0 && !signedXml && tab !== "smartca" ? (
            <div className="p-8 m-auto text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4 max-w-lg">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  Chưa có dữ liệu trên bảng
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bảng danh mục hiện chưa có bản ghi. Bạn có thể <b>nạp tệp XML đã ký sẵn từ máy tính</b> để gửi Cổng BHXH ngay, hoặc chuyển sang tab <b>Ký Số SmartCA (Q1)</b> để ký tệp.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleUploadXmlClick}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Upload size={15} />
                  <span>Tải Lên File XML Đã Ký</span>
                </button>
                {enableSmartCa && (
                  <button
                    type="button"
                    onClick={handleSelectTabSmartCa}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Fingerprint size={15} className="text-indigo-600" />
                    <span>Ký Số SmartCA (Q1)</span>
                  </button>
                )}
              </div>
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
                    className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between transition-all ${
                      isSigned
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                        : "bg-rose-50 border-rose-300 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isSigned ? (
                        <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle size={18} className="text-rose-600 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold">
                          {isSigned
                            ? "Hồ sơ ĐÃ KÝ SỐ - Đủ điều kiện gửi Cổng BHXH"
                            : "CẢNH BÁO: Hồ sơ CHƯA có chữ ký số điện tử"}
                        </div>
                        <div className={`text-[11px] ${isSigned ? "text-emerald-800" : "text-rose-800"}`}>
                          {isSigned
                            ? `Chủ thể: ${signatureInfo.subjectDN || "Chữ ký hợp lệ"} • Số serial: ${signatureInfo.serialNumber || "Hợp lệ"} (Chuỗi Base64 đã bao gồm chữ ký).`
                            : "Cổng Giám định BHXH bắt buộc hồ sơ phải có chữ ký số hợp lệ (<CHUKYDONVI>). Vui lòng ký số hoặc tải lên file đã ký trước khi gửi."}
                        </div>
                      </div>
                    </div>
                    {!isSigned && enableSmartCa && (
                      <button
                        type="button"
                        onClick={handleSelectTabSmartCa}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-all ml-2"
                      >
                        Ký số ngay
                      </button>
                    )}
                  </div>

                  {/* Thông Tin Phiên Làm Việc Cổng BHXH (Token & Xác Thực) */}
                  <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          Phiên Làm Việc Cổng BHXH (Token API)
                        </span>
                        {tokenSession.isLoading ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 animate-pulse flex items-center gap-1">
                            <RefreshCw size={10} className="animate-spin" /> Đang lấy token...
                          </span>
                        ) : tokenSession.status === "success" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Check size={11} /> Token Hợp Lệ (Mã 200)
                          </span>
                        ) : tokenSession.status === "error" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <AlertTriangle size={10} /> Chưa Xác Thực (Mã 401)
                          </span>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleFetchSessionToken(false)}
                        disabled={tokenSession.isLoading}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Gọi API /api/token/take để cấp mới Token"
                      >
                        <RefreshCw size={11} className={tokenSession.isLoading ? "animate-spin" : ""} />
                        <span>Lấy Lại Token</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                      {/* passwordHash */}
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                          <span>passwordHash (MD5)</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(tokenSession.passwordHash, "Đã sao chép passwordHash!")}
                            className="hover:text-blue-600 cursor-pointer"
                            title="Sao chép MD5 Hash"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-800 truncate mt-1 select-all" title={tokenSession.passwordHash}>
                          {tokenSession.passwordHash || "(Trống)"}
                        </div>
                      </div>

                      {/* tokenId */}
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                          <span>tokenId</span>
                          {tokenSession.tokenId && (
                            <button
                              type="button"
                              onClick={() => handleCopy(tokenSession.tokenId, "Đã sao chép tokenId!")}
                              className="hover:text-blue-600 cursor-pointer"
                              title="Sao chép tokenId"
                            >
                              <Copy size={11} />
                            </button>
                          )}
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-800 truncate mt-1 select-all" title={tokenSession.tokenId || "Chưa lấy được từ máy chủ"}>
                          {tokenSession.tokenId || <span className="text-slate-400 italic">Chưa cấp</span>}
                        </div>
                      </div>

                      {/* accessToken */}
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                          <span>accessToken</span>
                          {tokenSession.accessToken && (
                            <button
                              type="button"
                              onClick={() => handleCopy(tokenSession.accessToken, "Đã sao chép accessToken!")}
                              className="hover:text-blue-600 cursor-pointer"
                              title="Sao chép accessToken"
                            >
                              <Copy size={11} />
                            </button>
                          )}
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-800 truncate mt-1 select-all" title={tokenSession.accessToken || "Chưa lấy được từ máy chủ"}>
                          {tokenSession.accessToken ? (
                            `${tokenSession.accessToken.substring(0, 15)}...${tokenSession.accessToken.substring(tokenSession.accessToken.length - 8)}`
                          ) : (
                            <span className="text-slate-400 italic">Chưa cấp</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {tokenSession.error && (
                      <div className="text-[11px] text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 leading-tight">
                        <b>Phản hồi từ Cổng:</b> {tokenSession.error}
                      </div>
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
                    (() => {
                      const isSuccess =
                        String(apiResponse.maKetQua) === "200" ||
                        apiResponse.isOk === true ||
                        Boolean(apiResponse.maGiaoDich && !apiResponse.isError);
                      const maKetQua = String(apiResponse.maKetQua || (isSuccess ? "200" : "LỖI"));
                      const thongDiep =
                        apiResponse.thongDiep ||
                        apiResponse.ghiChu ||
                        apiResponse.message ||
                        (isSuccess
                          ? "Hồ sơ đã được Cổng BHXH tiếp nhận thành công."
                          : "Cổng BHXH từ chối tiếp nhận hồ sơ.");

                      return (
                        <div
                          className={`p-4 rounded-2xl border space-y-3 transition-all ${
                            isSuccess
                              ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                              : "bg-rose-50/90 border-rose-300 text-rose-950"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-extrabold text-xs flex items-center gap-2">
                              {isSuccess ? (
                                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                              ) : (
                                <AlertTriangle size={18} className="text-rose-600 shrink-0" />
                              )}
                              <span>
                                {isSuccess
                                  ? `Tiếp Nhận Thành Công (Mã ${maKetQua})`
                                  : `Cổng BHXH Từ Chối Tiếp Nhận (Mã ${maKetQua})`}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                isSuccess
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-rose-100 text-rose-800 border-rose-300"
                              }`}
                            >
                              {isSuccess ? "THÀNH CÔNG" : `MÃ LỖI ${maKetQua}`}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {apiResponse.maGiaoDich && (
                              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-500 uppercase">Mã Giao Dịch Cổng</div>
                                  <div className="font-mono font-bold text-slate-800 break-all">{apiResponse.maGiaoDich}</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(apiResponse.maGiaoDich, "Đã sao chép mã giao dịch!")}
                                  className="text-slate-500 hover:text-slate-800 p-1 rounded-md cursor-pointer"
                                  title="Sao chép mã giao dịch"
                                >
                                  <Copy size={13} />
                                </button>
                              </div>
                            )}

                            {(apiResponse.thoiGianTiepNhan || isSuccess) && (
                              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Thời Gian Tiếp Nhận</div>
                                <div className="font-semibold text-slate-800">
                                  {apiResponse.thoiGianTiepNhan || new Date().toLocaleString("vi-VN")}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 text-xs">
                            <span className="font-bold text-slate-600">Thông điệp: </span>
                            <span className={isSuccess ? "text-emerald-800 font-medium" : "text-rose-700 font-medium"}>
                              {thongDiep}
                            </span>
                          </div>

                          {!isSuccess && maKetQua === "401" && (
                            <div className="text-[11px] p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                              <b>💡 Hướng dẫn:</b> Tài khoản kết nối Cổng BHXH (<code className="font-mono">{DEFAULT_MA_CSKCB}_BV</code>) chưa xác thực thành công. Vui lòng kiểm tra lại mật khẩu tài khoản trong file <code className="font-mono">.env</code> hoặc liên hệ cơ quan BHXH tỉnh/thành phố để kiểm tra quyền API.
                            </div>
                          )}

                          <details className="text-[11px] text-slate-600">
                            <summary className="cursor-pointer font-bold hover:text-slate-900 select-none">
                              Xem chi tiết phản hồi JSON gốc
                            </summary>
                            <pre className="mt-1.5 p-2.5 bg-slate-900 text-emerald-300 rounded-lg font-mono text-[10px] overflow-x-auto select-text">
                              {JSON.stringify(apiResponse, null, 2)}
                            </pre>
                          </details>
                        </div>
                      );
                    })()
                  )}

                  <div className="flex items-center justify-between pt-2 select-none">
                    <div className="text-[11px] text-slate-500">
                      Cơ sở: <span className="font-semibold text-slate-700">{DEFAULT_MA_CSKCB}</span> • Tỉnh: <span className="font-semibold text-slate-700">{DEFAULT_MA_TINH}</span>
                    </div>
                    <button
                      type="button"
                      disabled={isSendingApi}
                      onClick={handleSendApiClick}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 transition-all cursor-pointer ${
                        isSendingApi
                          ? "bg-slate-400 cursor-not-allowed"
                          : isSigned
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-[0.98]"
                            : "bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 active:scale-[0.98]"
                      }`}
                      title={
                        isSigned
                          ? "Gửi hồ sơ XML đã ký lên Cổng Giám định BHXH"
                          : "Hồ sơ chưa ký số. Bấm để chuyển sang ký số hoặc tải tệp XML đã ký sẵn!"
                      }
                    >
                      <Send size={15} className={isSendingApi ? "animate-pulse" : ""} />
                      <span>
                        {isSendingApi
                          ? "Đang gửi Cổng Giám Định..."
                          : isSigned
                            ? "Gửi Lên Cổng BHXH (Đã Ký)"
                            : "Gửi Cổng BHXH (Yêu Cầu Ký Số)"}
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
            {uploadedCustomFileName ? (
              <span>
                Tệp tải lên: <b className="text-slate-700">{uploadedCustomFileName}</b>
                {itemsCount > 0 && <span> ({itemsCount} {itemLabel})</span>}
              </span>
            ) : (
              <span>
                Tổng số: <b>{itemsCount}</b> {itemLabel}
              </span>
            )}
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
