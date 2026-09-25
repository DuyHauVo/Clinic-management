import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ShieldCheck,
  Fingerprint,
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  FileCode,
  Download,
  Eye,
  Info,
  Send,
  Lock,
  EyeOff,
  BellRing,
  AlertCircle,
  CheckCheck,
  User,
  Mail,
} from "lucide-react";
import { useSmartCa } from "../../context/SmartCaContext";
import { SmartCaErrorModal } from "./ErrorModal";
import {
  computeXmlDigest,
  type ExtractedSignatureInfo,
  extractXmlSignature,
} from "../../utils/xmlDsigEngine";
import {
  initiateSignQ1,
  checkSignStatusQ1,
  confirmMockSignQ1,
  rejectMockSignQ1,
  type SmartCaSignResponse,
  type SmartCaQ1InitiateResponse,
} from "../../services/smartca/smartcaHandlers";
import { SMARTCA_CLIENT_SECRET } from "../../services/smartca/smartcaConfig";
import {
  SMARTCA_TRAN_STATUS,
  type SignerProfile,
} from "../../types/smartcaTypes";

export interface SmartCaSignPanelProps {
  xmlContent: string;
  signedXml?: string;
  fileName: string;
  itemsCount?: number;
  itemLabel?: string;
  signers?: SignerProfile[];
  onSignedSuccess: (
    signedXml: string,
    signResponse: SmartCaSignResponse,
  ) => void;
  onResetSignature: () => void;
  onViewSignedXml?: () => void;
  onDownloadSignedXml?: () => void;
}

const COUNTDOWN_SECONDS = 180; // 3 phút thời gian chờ xác nhận trên App SmartCA

export const SmartCaSignPanel: React.FC<SmartCaSignPanelProps> = ({
  xmlContent,
  signedXml,
  fileName,
  itemsCount,
  itemLabel = "bản ghi",
  onSignedSuccess,
  onResetSignature,
  onViewSignedXml,
  onDownloadSignedXml,
}) => {
  const { credential, config } = useSmartCa();
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [idType, setIdType] = useState<"phone" | "cccd" | "mst">("phone");
  const [identityValue, setIdentityValue] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Trạng thái giao dịch Q1
  const [isInitiating, setIsInitiating] = useState(false);
  const [waitingTransaction, setWaitingTransaction] =
    useState<SmartCaQ1InitiateResponse | null>(null);
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authErrorModalData, setAuthErrorModalData] = useState<{
    isOpen: boolean;
    errorMessage: string;
  }>({
    isOpen: false,
    errorMessage: "",
  });
  const [digestInfo, setDigestInfo] = useState<{
    digestValue: string;
    hexDigest: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Polling ref để quản lý timer
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tính mã SHA-256 Digest thực tế từ XML gốc mỗi khi xmlContent thay đổi
  const lastCalculatedXmlRef = useRef<string>("");
  useEffect(() => {
    let isCancelled = false;
    if (xmlContent) {
      if (lastCalculatedXmlRef.current === xmlContent) {
        return;
      }
      lastCalculatedXmlRef.current = xmlContent;
      computeXmlDigest(xmlContent)
        .then((res) => {
          if (!isCancelled) setDigestInfo(res);
        })
        .catch(() => {
          if (!isCancelled) setDigestInfo(null);
        });
    } else {
      lastCalculatedXmlRef.current = "";
      setDigestInfo(null);
    }
    return () => {
      isCancelled = true;
    };
  }, [xmlContent]);

  // Trích xuất thông tin chữ ký từ XML đã ký (nếu có)
  const signatureInfo: ExtractedSignatureInfo = useMemo(() => {
    return extractXmlSignature(signedXml || xmlContent);
  }, [signedXml, xmlContent]);

  const isSigned = signatureInfo.hasSignature;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopySignedXml = () => {
    handleCopy(signedXml || xmlContent, "signedXml");
  };

  const handleCopyTranId = () => {
    if (waitingTransaction?.tranId) {
      handleCopy(waitingTransaction.tranId, "tranId");
    }
  };

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw =
      idType === "mst"
        ? e.target.value.replace(/[^0-9-]/g, "")
        : e.target.value.replace(/[^0-9]/g, "");
    setIdentityValue(raw);
    setErrorMessage(null);
  };

  const handleSelectIdType = (type: "phone" | "cccd" | "mst") => {
    if (idType !== type) {
      setIdType(type);
      setIdentityValue("");
      setErrorMessage(null);
    }
  };

  const handleCloseAuthErrorModal = () => {
    setAuthErrorModalData({ isOpen: false, errorMessage: "" });
  };

  // Hủy phiên chờ và làm mới
  const handleCancelWaiting = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setWaitingTransaction(null);
    setIsInitiating(false);
    setCountdown(COUNTDOWN_SECONDS);
  }, []);

  const handleResetAndResign = () => {
    handleCancelWaiting();
    setErrorMessage(null);
    onResetSignature?.();
  };

  // Dừng polling khi component unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  /**
   * Bước 1: Khởi tạo yêu cầu ký số Q1 và gửi Push Notification lên App SmartCA
   */
  const handleInitiateQ1Sign = async () => {
    if (!xmlContent) {
      setErrorMessage("Nội dung XML trống - không thể ký số!");
      return;
    }

    const trimmedIdentity = identityValue.trim();
    if (!trimmedIdentity) {
      const typeLabel =
        idType === "phone"
          ? "Số điện thoại"
          : idType === "cccd"
          ? "Số CCCD"
          : "Mã số thuế (MST)";
      setErrorMessage(`Vui lòng nhập ${typeLabel} nhận thông báo SmartCA`);
      return;
    }

    // Validate Số điện thoại: 10 chữ số, bắt đầu bằng 0
    if (idType === "phone") {
      const phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(trimmedIdentity)) {
        setErrorMessage(
          "Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số (bắt đầu bằng 0).",
        );
        return;
      }
    }

    // Validate CCCD: 12 chữ số
    if (idType === "cccd") {
      const cccdRegex = /^[0-9]{12}$/;
      if (!cccdRegex.test(trimmedIdentity)) {
        setErrorMessage("Số CCCD không hợp lệ! Vui lòng nhập đúng 12 chữ số.");
        return;
      }
    }

    // Validate Mã số thuế (MST): 10 chữ số hoặc 13 chữ số
    if (idType === "mst") {
      const mstRegex = /^[0-9]{10}(-[0-9]{3})?$|^[0-9]{13}$/;
      if (!mstRegex.test(trimmedIdentity)) {
        setErrorMessage(
          "Mã số thuế (MST) không hợp lệ! Vui lòng nhập 10 hoặc 13 chữ số (VD: 4001266514).",
        );
        return;
      }
    }

    // Validate Email nếu người dùng có nhập
    const trimmedEmail = signerEmail.trim();
    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage("Địa chỉ Email không hợp lệ! Vui lòng kiểm tra lại định dạng email.");
        return;
      }
    }

    // Kiểm tra cấu hình môi trường VNPT thật
    if (config.env === "production" || config.env === "demo") {
      const endpoint =
        config.env === "production" ? "gwsca.vnpt.vn" : "rmgateway.vnptit.vn";
      if (!config.clientId || !SMARTCA_CLIENT_SECRET) {
        const err = `[VNPT_SMARTCA_${config.env.toUpperCase()}_AUTH_FAILED] Chưa cấu hình VITE_SMARTCA_CLIENT_ID hoặc VITE_SMARTCA_CLIENT_SECRET trong file .env để kết nối Cổng ${endpoint}`;
        setErrorMessage(err);
        setAuthErrorModalData({
          isOpen: true,
          errorMessage: err,
        });
        return;
      }

      if (!password.trim()) {
        setErrorMessage("Vui lòng nhập mật khẩu tài khoản SmartCA để kết nối với Cổng VNPT.");
        return;
      }
    }

    setIsInitiating(true);
    setErrorMessage(null);

    const isUnitSign = idType === "mst";
    const customName = signerName.trim();
    const displayName =
      customName ||
      (isUnitSign
        ? `Cơ sở KCB (MST: ${trimmedIdentity})`
        : `Bác sĩ (${idType === "phone" ? "SĐT" : "CCCD"}: ${trimmedIdentity})`);

    const dynamicSigner: SignerProfile = {
      id: `signer-${Date.now()}`,
      name: displayName,
      role: isUnitSign ? "DON_VI" : "BAC_SI",
      roleTitle: isUnitSign
        ? "Chữ ký số Cơ sở KCB (Đơn vị)"
        : "Bác sĩ điều trị",
      phone: idType === "phone" ? trimmedIdentity : "",
      cccd: idType === "cccd" ? trimmedIdentity : "",
      mst: idType === "mst" ? trimmedIdentity : "",
      email: trimmedEmail || undefined,
      subjectDN: isUnitSign
        ? `CN=${displayName.toUpperCase()}, OID.0.9.2342.19200300.100.1.1=MST:${trimmedIdentity}, C=VN`
        : `CN=${displayName.toUpperCase()}, UID=${trimmedIdentity}, O=PHÒNG KHÁM, C=VN`,
      serialNumber: isUnitSign
        ? `SMARTCA_MST_${trimmedIdentity.replace(/[^0-9]/g, "")}`
        : `SMARTCA_${trimmedIdentity}`,
    };

    try {
      const { digestValue } = await computeXmlDigest(xmlContent);

      const initResponse = await initiateSignQ1({
        username: trimmedIdentity,
        password: password.trim() || "123456",
        digestValue,
        fileName,
        signer: dynamicSigner,
      });

      if (!initResponse.success || !initResponse.tranId) {
        const errText =
          initResponse.error || "Không thể khởi tạo giao dịch ký số với VNPT SmartCA.";
        setErrorMessage(errText);
        if (config.env !== "mock") {
          setAuthErrorModalData({
            isOpen: true,
            errorMessage: errText,
          });
        }
        setIsInitiating(false);
        return;
      }

      // Khởi tạo thành công -> Chuyển sang màn hình chờ xác nhận trên App
      setWaitingTransaction(initResponse);
      setIsInitiating(false);
      setCountdown(COUNTDOWN_SECONDS);

      // Bắt đầu đếm ngược countdown
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleCancelWaiting();
            setErrorMessage("Giao dịch ký số đã hết thời gian chờ (180 giây). Vui lòng thử lại.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Bắt đầu vòng lặp Polling (mỗi 2 giây)
      startPolling(initResponse);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Lỗi trong quá trình gửi yêu cầu ký số";
      setErrorMessage(errorMsg);
      setIsInitiating(false);
      if (config.env !== "mock") {
        setAuthErrorModalData({
          isOpen: true,
          errorMessage: errorMsg,
        });
      }
    }
  };

  /**
   * Bước 2: Vòng lặp Polling kiểm tra trạng thái phê duyệt từ App Mobile
   */
  const startPolling = (initRes: SmartCaQ1InitiateResponse) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    pollingTimerRef.current = setInterval(async () => {
      try {
        const checkRes = await checkSignStatusQ1({
          tranId: initRes.tranId,
          accessToken: initRes.accessToken,
          digestValue: initRes.digestValue,
          rawXml: xmlContent,
          certInfo: {
            subjectDN: initRes.subjectDN,
            serialNumber: initRes.serialNumber,
            issuerDN: initRes.issuerDN,
            x509Certificate: initRes.x509Certificate,
            rsaModulus: initRes.rsaModulus,
            rsaExponent: initRes.rsaExponent,
          },
          signer: initRes.signer,
        });

        // Nếu đã ký thành công trên App
        if (checkRes.success && checkRes.signedXml) {
          handleCancelWaiting();
          onSignedSuccess(checkRes.signedXml, checkRes);
          return;
        }

        // Nếu hết hạn hoặc bị từ chối
        if (checkRes.status === SMARTCA_TRAN_STATUS.EXPIRED) {
          handleCancelWaiting();
          setErrorMessage(
            checkRes.error || "Giao dịch ký số đã hết hạn trên App SmartCA.",
          );
          return;
        }

        if (checkRes.status === SMARTCA_TRAN_STATUS.SIGNER_REJECTED) {
          handleCancelWaiting();
          setErrorMessage(
            checkRes.error || "Người dùng đã từ chối xác nhận ký số trên App VNPT SmartCA.",
          );
          return;
        }
      } catch (pollErr: unknown) {
        // Lỗi mạng nhất thời trong khi poll -> tiếp tục poll lượt sau
        console.warn("Polling error:", pollErr);
      }
    }, 2000);
  };

  /**
   * Nút kiểm tra thủ công (Poll Now)
   */
  const handleCheckNow = async () => {
    if (!waitingTransaction) return;
    try {
      const checkRes = await checkSignStatusQ1({
        tranId: waitingTransaction.tranId,
        accessToken: waitingTransaction.accessToken,
        digestValue: waitingTransaction.digestValue,
        rawXml: xmlContent,
        certInfo: {
          subjectDN: waitingTransaction.subjectDN,
          serialNumber: waitingTransaction.serialNumber,
          issuerDN: waitingTransaction.issuerDN,
          x509Certificate: waitingTransaction.x509Certificate,
          rsaModulus: waitingTransaction.rsaModulus,
          rsaExponent: waitingTransaction.rsaExponent,
        },
        signer: waitingTransaction.signer,
      });

      if (checkRes.success && checkRes.signedXml) {
        handleCancelWaiting();
        onSignedSuccess(checkRes.signedXml, checkRes);
      } else if (checkRes.status === SMARTCA_TRAN_STATUS.EXPIRED) {
        handleCancelWaiting();
        setErrorMessage(checkRes.error || "Giao dịch đã hết hạn.");
      } else if (checkRes.status === SMARTCA_TRAN_STATUS.SIGNER_REJECTED) {
        handleCancelWaiting();
        setErrorMessage(checkRes.error || "Người dùng đã từ chối ký.");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Lỗi kiểm tra trạng thái";
      setErrorMessage(errorMsg);
    }
  };

  /**
   * Mock Utility: Giả lập bấm xác nhận trên App điện thoại
   */
  const handleSimulateAppConfirm = async () => {
    if (!waitingTransaction) return;
    try {
      await confirmMockSignQ1(waitingTransaction.tranId);
      // Gọi kiểm tra ngay lập tức
      await handleCheckNow();
    } catch (err: unknown) {
      console.error("Mock confirm error:", err);
    }
  };

  /**
   * Mock Utility: Giả lập bấm từ chối trên App
   */
  const handleSimulateAppReject = async () => {
    if (!waitingTransaction) return;
    try {
      await rejectMockSignQ1(waitingTransaction.tranId);
      await handleCheckNow();
    } catch (err: unknown) {
      console.error("Mock reject error:", err);
    }
  };

  // Định dạng hiển thị thời gian còn lại (MM:SS)
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* 1. THẺ THÔNG TIN TỆP TIN ĐANG KÝ (FILE OVERVIEW CARD) */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <FileCode size={18} />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Tệp Tin XML Cần Ký (Quy Trình 1 - Q1)
              </span>
              <h4 className="text-sm font-extrabold text-white font-mono">
                {fileName}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSigned ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-extrabold flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 size={13} /> ĐÃ KÝ SỐ CHUẨN XMLDSIG
              </span>
            ) : waitingTransaction ? (
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-extrabold flex items-center gap-1.5 animate-pulse">
                <BellRing size={13} /> ĐANG CHỜ PHÊ DUYỆT TRÊN APP
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold flex items-center gap-1.5">
                <Clock size={13} /> CHỜ KÝ SỐ (Q1)
              </span>
            )}
          </div>
        </div>

        {/* Thông tin số lượng dữ liệu */}
        <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Số lượng dữ liệu:</span>
          <span className="font-extrabold text-white font-mono">
            {itemsCount !== undefined
              ? `${itemsCount} ${itemLabel}`
              : "Tập hợp bản ghi"}
          </span>
        </div>
      </div>

      {/* 2. GIAO DIỆN KHI ĐÃ KÝ SỐ THÀNH CÔNG */}
      {isSigned ? (
        <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-emerald-950">
                  Tài liệu XML đã được ký số thành công (Quy trình 1)
                </h4>
                <p className="text-[11px] text-emerald-700">
                  Khối thẻ <code className="font-bold">&lt;CHUKYDONVI&gt;</code>{" "}
                  đã được đóng gói chuẩn W3C XMLDSig vào XML.
                </p>
              </div>
            </div>
          </div>

          {/* Chi tiết chứng thư đã ký */}
          <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-2 text-xs text-slate-700 shadow-xs">
            <div className="font-extrabold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <Info size={14} className="text-emerald-600" />
              Thông Tin Chứng Thư Số & Chữ Ký Đã Ký
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
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
                <b className="text-slate-500">Tổ chức cấp (CA):</b>{" "}
                <span className="font-mono text-slate-900">
                  VNPT SmartCA RS
                </span>
              </div>
              <div>
                <b className="text-slate-500">Thuật toán ký:</b>{" "}
                <span className="font-mono text-slate-900">
                  RSA-SHA256 (Enveloped)
                </span>
              </div>
              <div>
                <b className="text-slate-500">Mã Digest:</b>{" "}
                <span className="font-mono text-amber-700 font-bold">
                  {signatureInfo.digestValue || digestInfo?.digestValue || "—"}
                </span>
              </div>
            </div>

            {/* Xem trước SignatureValue */}
            {signatureInfo.signatureValue && (
              <div className="pt-1.5">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">
                  SignatureValue (Chuỗi chữ ký Base64):
                </span>
                <div className="p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg break-all max-h-16 overflow-y-auto select-text outline-none">
                  {signatureInfo.signatureValue}
                </div>
              </div>
            )}
          </div>

          {/* CÁC NÚT THAO TÁC SAU KHI KÝ SỐ */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-200">
            <div className="flex items-center gap-2 flex-wrap">
              {onViewSignedXml && (
                <button
                  type="button"
                  onClick={onViewSignedXml}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Eye size={14} />
                  <span>Xem File XML Đã Ký</span>
                </button>
              )}

              {onDownloadSignedXml && (
                <button
                  type="button"
                  onClick={onDownloadSignedXml}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download size={14} />
                  <span>Tải File .XML Đã Ký</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopySignedXml}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedKey === "signedXml" ? (
                  <Check size={14} className="text-emerald-600" />
                ) : (
                  <Copy size={14} />
                )}
                {copiedKey === "signedXml" ? "Đã chép XML" : "Sao chép XML"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetAndResign}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Hủy chữ ký và ký lại"
            >
              <RefreshCw size={13} />
              <span>Hủy Chữ Ký / Ký Lại</span>
            </button>
          </div>
        </div>
      ) : waitingTransaction ? (
        /* 3. MÀN HÌNH ĐANG CHỜ XÁC NHẬN KÝ TRÊN APP VNPT SMARTCA (Q1) */
        <div className="p-5 bg-gradient-to-br from-indigo-50 via-purple-50/40 to-slate-50 border border-indigo-200 rounded-2xl space-y-4 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <Smartphone size={22} className="animate-bounce" />
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-ping" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <span>Đang Chờ Xác Nhận Trên App VNPT SmartCA</span>
                </h4>
                <p className="text-xs text-indigo-700 font-medium">
                  Hệ thống đã gửi yêu cầu ký đến ứng dụng điện thoại của bạn
                </p>
              </div>
            </div>

            {/* ĐẾM NGƯỢC THỜI GIAN CHỜ */}
            <div className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 shadow-xs flex items-center gap-1.5 text-xs font-mono font-extrabold text-indigo-900">
              <Clock size={14} className="text-indigo-600" />
              <span>{formatCountdown(countdown)}</span>
            </div>
          </div>

          {/* CARD CHI TIẾT GIAO DỊCH KÝ */}
          <div className="p-4 bg-white rounded-xl border border-indigo-100 space-y-3 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">
                  Mã Giao Dịch (TranId):
                </span>
                <div className="flex items-center gap-1.5">
                  <code className="px-2 py-1 bg-slate-100 text-indigo-950 font-mono font-extrabold rounded-lg text-xs truncate max-w-[200px] block">
                    {waitingTransaction.tranId}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyTranId}
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                    title="Sao chép mã giao dịch"
                  >
                    {copiedKey === "tranId" ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">
                  Tài Khoản Nhận Thông Báo:
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {identityValue} (
                  {idType === "phone"
                    ? "SĐT"
                    : idType === "cccd"
                    ? "CCCD"
                    : "MST"}
                  )
                </span>
              </div>
            </div>

            {/* HƯỚNG DẪN 3 BƯỚC CHO NGƯỜI DÙNG */}
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/80 space-y-2 text-xs">
              <div className="font-bold text-indigo-900 flex items-center gap-1">
                <Info size={14} className="text-indigo-600 shrink-0" />
                <span>Các bước thực hiện trên điện thoại:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] pl-1">
                <li>
                  Mở ứng dụng <b>VNPT SmartCA</b> trên điện thoại của bạn.
                </li>
                <li>
                  Kiểm tra thông báo yêu cầu ký số cho tệp tin:{" "}
                  <code className="font-mono font-bold text-indigo-800">
                    {fileName}
                  </code>
                </li>
                <li>
                  Bấm <b>"Xác nhận"</b> (hoặc quét FaceID / Vân tay / nhập PIN)
                  để hoàn tất ký số.
                </li>
              </ol>
            </div>

            {/* TRẠNG THÁI POLLING TỰ ĐỘNG */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-indigo-600" />
                <span>Hệ thống đang tự động kiểm tra phản hồi từ App (mỗi 2s)...</span>
              </div>
              <button
                type="button"
                onClick={handleCheckNow}
                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg font-bold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Kiểm tra ngay</span>
              </button>
            </div>
          </div>

          {/* KHUNG TIỆN ÍCH GIẢ LẬP TRÊN MÔI TRƯỜNG MOCK / TEST */}
          {config.env === "mock" && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-600" />
                  Môi Trường Mock / Thử Nghiệm:
                </span>
                <span className="text-[10px] text-amber-700">
                  (Dành cho Tester & Lập trình viên)
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSimulateAppConfirm}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <CheckCheck size={14} />
                  <span>⚡ Giả Lập Bấm "Xác Nhận" Trên App Ngay</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimulateAppReject}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <XCircle size={13} />
                  <span>Giả Lập "Từ Chối" (Test lỗi)</span>
                </button>
              </div>
            </div>
          )}

          {/* NÚT HỦY GIAO DỊCH */}
          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={handleCancelWaiting}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <XCircle size={14} />
              <span>Hủy Giao Dịch & Chọn Lại</span>
            </button>
          </div>
        </div>
      ) : (
        /* 4. FORM KHỞI TẠO KÝ SỐ QUY TRÌNH 1 (Q1 - KÝ QUA APP SMARTCA) */
        <div className="p-5 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <Smartphone size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-extrabold text-indigo-950">
                    Ký Số Phê Duyệt Qua App VNPT SmartCA (Q1)
                  </h4>
                  {/* Tooltip Hover Icon Hướng dẫn ký số */}
                  <div className="relative group/tooltip inline-flex items-center">
                    <button
                      type="button"
                      className="text-indigo-400 hover:text-indigo-600 transition-colors p-0.5 rounded-full cursor-help"
                      aria-label="Hướng dẫn ký số SmartCA"
                    >
                      <Info size={14} />
                    </button>
                    <div className="absolute left-0 top-full mt-1.5 hidden group-hover/tooltip:block w-72 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-2xl border border-slate-700 z-50 pointer-events-none">
                      <div className="font-bold text-amber-300 mb-1 flex items-center gap-1">
                        <Info size={12} /> Hướng dẫn Quy trình 1 (Q1):
                      </div>
                      <p className="text-slate-200 leading-relaxed font-normal">
                        Nhập Tên, Email, SĐT/CCCD/MST → Nhấn{" "}
                        <b className="text-white">"Gửi Ký Lên App (Q1)"</b> →
                        Hệ thống sẽ gửi thông báo Push Notification đến App
                        VNPT SmartCA trên điện thoại để mở và xác nhận ký số.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-700">
                  Xác thực bảo mật 2 yếu tố: Ký duyệt trực tiếp trên điện thoại
                  di động thông qua ứng dụng VNPT SmartCA.
                </p>
              </div>
            </div>

            {/* BADGE MÔI TRƯỜNG KẾT NỐI */}
            <div className="shrink-0">
              {config.env === "mock" && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 text-[10px] font-extrabold flex items-center gap-1">
                  MÔI TRƯỜNG: MOCK
                </span>
              )}
              {config.env === "demo" && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-800 text-[10px] font-extrabold flex items-center gap-1">
                  MÔI TRƯỜNG: DEMO (VNPT)
                </span>
              )}
              {config.env === "production" && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                  MÔI TRƯỜNG: PRODUCTION
                </span>
              )}
            </div>
          </div>

          {/* CÁC TRƯỜNG NHẬP THÔNG TIN: TÊN NGƯỜI KÝ, EMAIL, ĐỊNH DANH, MẬT KHẨU & NÚT GỬI KÝ */}
          <div className="space-y-3.5">
            {/* HÀNG 1: HỌ TÊN NGƯỜI KÝ & EMAIL NGƯỜI KÝ */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* 1. Tên người ký */}
              <div className="space-y-1 md:col-span-6 lg:col-span-6">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 h-6">
                  <User size={14} className="text-indigo-600" />
                  <span>Họ và tên người ký:</span>
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => {
                    setSignerName(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Nhập họ và tên (VD: BS. Nguyễn Văn An, CSKCB...)"
                  className="w-full h-[42px] px-3.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all placeholder:font-normal placeholder:text-xs placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              {/* 2. Email người ký */}
              <div className="space-y-1 md:col-span-6 lg:col-span-6">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between h-6">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-indigo-600" />
                    <span>Địa chỉ Email người ký:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Tùy chọn)
                  </span>
                </label>
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => {
                    setSignerEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Nhập email (VD: bacsian@phongkham.vn...)"
                  className="w-full h-[42px] px-3.5 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all placeholder:font-normal placeholder:text-xs placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>

            {/* HÀNG 2: ĐỊNH DANH (SĐT/CCCD/MST), MẬT KHẨU & NÚT GỬI KÝ */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* 3. Định danh SmartCA: 3 lựa chọn SĐT / CCCD / MST */}
              <div className="space-y-1 md:col-span-5 lg:col-span-5">
                <div className="flex items-center justify-between h-6 gap-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <Fingerprint size={13} className="text-indigo-600" />
                    <span>Định danh nhận SmartCA:</span>
                  </label>

                  {/* CỤM NÚT CHUYỂN ĐỔI: SĐT / CCCD / MST */}
                  <div className="flex items-center gap-0.5 bg-indigo-100/70 p-0.5 rounded-lg border border-indigo-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelectIdType("phone")}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                        idType === "phone"
                          ? "bg-white text-indigo-700 shadow-2xs"
                          : "text-slate-600 hover:text-indigo-900"
                      }`}
                    >
                      SĐT
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectIdType("cccd")}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                        idType === "cccd"
                          ? "bg-white text-indigo-700 shadow-2xs"
                          : "text-slate-600 hover:text-indigo-900"
                      }`}
                    >
                      CCCD
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectIdType("mst")}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                        idType === "mst"
                          ? "bg-white text-indigo-700 shadow-2xs"
                          : "text-slate-600 hover:text-indigo-900"
                      }`}
                      title="Ký số bằng tài khoản Mã số thuế Đơn vị / Cơ sở KCB"
                    >
                      MST
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  maxLength={
                    idType === "phone" ? 10 : idType === "cccd" ? 12 : 14
                  }
                  value={identityValue}
                  onChange={handleIdentityChange}
                  placeholder={
                    idType === "phone"
                      ? "Nhập SĐT SmartCA (090...)"
                      : idType === "cccd"
                      ? "Nhập 12 số CCCD"
                      : "Nhập MST Đơn vị (VD: 4001266514)"
                  }
                  className="w-full h-[42px] px-3.5 bg-white border border-indigo-200 rounded-xl font-mono text-base font-extrabold tracking-wide text-indigo-950 focus:outline-indigo-600 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-xs placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              {/* 4. Mật Khẩu SmartCA (Nếu môi trường Demo / Prod) */}
              <div className="space-y-1 md:col-span-4 lg:col-span-4">
                <div className="flex items-center justify-between h-6">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate">
                    <Lock size={13} className="text-indigo-600" />
                    <span>Mật khẩu SmartCA:</span>
                  </label>
                  {config.env === "mock" && (
                    <span className="text-[10px] text-slate-400">
                      (Tùy chọn ở Mock)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder={
                      config.env === "mock" ? "mock 123456" : "Nhập mật khẩu SmartCA"
                    }
                    className="w-full h-[42px] pl-3.5 pr-8 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-950 focus:outline-indigo-600 transition-all placeholder:text-xs placeholder:text-slate-400 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* 5. NÚT GỬI YÊU CẦU KÝ LÊN APP (Q1) */}
              <div className="space-y-1 md:col-span-3 lg:col-span-3">
                <div className="h-6 hidden md:block" />
                <button
                  type="button"
                  disabled={isInitiating || !xmlContent || !identityValue.trim()}
                  onClick={handleInitiateQ1Sign}
                  className={`w-full h-[42px] px-3 rounded-xl font-extrabold text-xs text-white flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ${
                    isInitiating || !xmlContent || !identityValue.trim()
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25 active:scale-95"
                  }`}
                >
                  {isInitiating ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span className="truncate">Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span className="truncate">Gửi Ký Lên App</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* THÔNG BÁO LỖI NẾU CÓ */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 animate-shake">
                <XCircle size={15} className="text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL THÔNG BÁO LỖI KẾT NỐI VNPT SMARTCA PRODUCTION */}
      <SmartCaErrorModal
        isOpen={authErrorModalData.isOpen}
        onClose={handleCloseAuthErrorModal}
        env={config.env}
        errorMessage={authErrorModalData.errorMessage}
        clientId={config.clientId}
        username={config.username}
      />
    </div>
  );
};
