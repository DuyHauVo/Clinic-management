import { useState, useEffect, useRef, useCallback } from "react";
import { useSmartCa } from "../context/SmartCaContext";
import { useToast } from "../context/ToastContext";
import { computeXmlDigest } from "../utils/xmlDsigEngine";
import {
  initiateSignQ1,
  checkSignStatusQ1,
  confirmMockSignQ1,
  rejectMockSignQ1,
  type SmartCaSignResponse,
  type SmartCaQ1InitiateResponse,
} from "../services/smartca/smartcaHandlers";
import { SMARTCA_CLIENT_SECRET } from "../services/smartca/smartcaConfig";
import { SMARTCA_TRAN_STATUS, type SignerProfile } from "../types/smartcaTypes";
import {
  type IdentityType,
  IDENTITY_LABELS,
  sanitizeIdentityInput,
  validateIdentity,
  validateEmail,
} from "../utils/validators";

export const COUNTDOWN_SECONDS = 180;


export interface UseSmartCaSignQ1Props {
  effectiveXmlToSign: string;
  effectiveFileName: string;
  isSigned: boolean;
  onSignedSuccess: (signedXml: string, signResponse: SmartCaSignResponse) => void;
  onResetSignature?: () => void;
}

export function useSmartCaSignQ1({
  effectiveXmlToSign,
  effectiveFileName,
  onSignedSuccess,
  onResetSignature,
}: UseSmartCaSignQ1Props) {
  const { credential, config } = useSmartCa();
  const toast = useToast();

  // Thông tin người ký
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

  // Timers
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCalculatedXmlRef = useRef<string>("");

  // Tính SHA-256 Digest của XML
  useEffect(() => {
    let isCancelled = false;
    if (effectiveXmlToSign) {
      if (lastCalculatedXmlRef.current === effectiveXmlToSign) {
        return;
      }
      lastCalculatedXmlRef.current = effectiveXmlToSign;
      computeXmlDigest(effectiveXmlToSign, { preserveOtherSignatures: true })
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
  }, [effectiveXmlToSign]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = sanitizeIdentityInput(e.target.value, idType);
    setIdentityValue(raw);
  };

  const handleSelectIdType = (type: IdentityType) => {
    if (idType !== type) {
      setIdType(type);
      setIdentityValue("");
    }
  };


  const handleCloseAuthErrorModal = () => {
    setAuthErrorModalData({ isOpen: false, errorMessage: "" });
  };

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
    onResetSignature?.();
  };

  /**
   * Polling tự động mỗi 2 giây
   */
  const startPollingTransaction = (
    tranId: string,
    accessToken: string,
    digestValue: string,
    signerProfile: SignerProfile,
  ) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    pollingTimerRef.current = setInterval(async () => {
      try {
        const checkRes = await checkSignStatusQ1({
          tranId,
          accessToken,
          digestValue,
          rawXml: effectiveXmlToSign,
          certInfo: {
            subjectDN: signerProfile.subjectDN,
            serialNumber: signerProfile.serialNumber,
            issuerDN: "VNPT SmartCA RS",
            x509Certificate: "",
          },
          signer: signerProfile,
        });

        if (checkRes.success && checkRes.signedXml) {
          handleCancelWaiting();
          onSignedSuccess(checkRes.signedXml, checkRes);
          return;
        }

        if (checkRes.status === SMARTCA_TRAN_STATUS.EXPIRED) {
          handleCancelWaiting();
          toast.error(checkRes.error || "Giao dịch ký số đã hết hạn trên App SmartCA.", "Hết Hạn");
          return;
        }

        if (checkRes.status === SMARTCA_TRAN_STATUS.SIGNER_REJECTED) {
          handleCancelWaiting();
          toast.warning(
            checkRes.error || "Người dùng đã từ chối xác nhận ký số trên App VNPT SmartCA.",
            "Từ Chối Ký",
          );
          return;
        }
      } catch (pollErr: unknown) {
        console.warn("Polling error:", pollErr);
      }
    }, 2000);
  };

  /**
   * Khởi tạo yêu cầu ký số Q1
   */
  const handleInitiateQ1Sign = async () => {
    if (!effectiveXmlToSign) {
      toast.warning("Nội dung XML trống - không thể ký số!", "Thiếu Dữ Liệu");
      return;
    }

    const trimmedIdentity = identityValue.trim();
    if (!trimmedIdentity) {
      toast.warning(
        `Vui lòng nhập ${IDENTITY_LABELS[idType]} nhận thông báo SmartCA`,
        "Thiếu Thông Tin",
      );
      return;
    }

    const identityCheck = validateIdentity(trimmedIdentity, idType);
    if (!identityCheck.isValid) {
      toast.warning(identityCheck.error || "Định danh không hợp lệ!", "Sai Định Dạng");
      return;
    }

    const trimmedEmail = signerEmail.trim();
    if (trimmedEmail) {
      const emailCheck = validateEmail(trimmedEmail);
      if (!emailCheck.isValid) {
        toast.warning(emailCheck.error || "Địa chỉ Email không hợp lệ!", "Sai Định Dạng");
        return;
      }
    }

    if (
      (config.env === "production" || config.env === "demo") &&
      (!config.clientId || !SMARTCA_CLIENT_SECRET)
    ) {
      const err = `[VNPT_SMARTCA_${config.env.toUpperCase()}_AUTH_FAILED] Chưa cấu hình VITE_SMARTCA_CLIENT_ID hoặc VITE_SMARTCA_CLIENT_SECRET trong file .env`;
      toast.error(err, "Cấu Hình SmartCA");
      setAuthErrorModalData({ isOpen: true, errorMessage: err });
      return;
    }

    setIsInitiating(true);

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
      roleTitle: isUnitSign ? "Chữ ký số Cơ sở KCB (Đơn vị)" : "Bác sĩ điều trị",
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
      const { digestValue } = await computeXmlDigest(effectiveXmlToSign, {
        preserveOtherSignatures: true,
      });

      const initResponse = await initiateSignQ1({
        username: trimmedIdentity,
        password: password.trim() || "123456",
        digestValue,
        fileName: effectiveFileName,
        signer: dynamicSigner,
      });

      if (!initResponse.success || !initResponse.tranId) {
        const errText =
          initResponse.error || "Không thể khởi tạo giao dịch ký số với VNPT SmartCA.";
        toast.error(errText, "Lỗi Khởi Tạo");
        if (config.env !== "mock") {
          setAuthErrorModalData({ isOpen: true, errorMessage: errText });
        }
        setIsInitiating(false);
        return;
      }

      setWaitingTransaction(initResponse);
      setIsInitiating(false);
      setCountdown(COUNTDOWN_SECONDS);
      toast.info("Đã gửi yêu cầu ký số. Vui lòng mở App VNPT SmartCA để xác nhận.", "Chờ Phê Duyệt");

      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleCancelWaiting();
            toast.warning("Giao dịch ký số đã hết thời gian chờ (180 giây). Vui lòng thử lại.", "Hết Giờ Chờ");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      startPollingTransaction(
        initResponse.tranId,
        initResponse.accessToken,
        digestValue,
        dynamicSigner,
      );
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi khởi tạo ký số Q1";
      toast.error(errorMsg, "Lỗi Ký Số Q1");
      setIsInitiating(false);
    }
  };

  const handleCheckNow = async () => {
    if (!waitingTransaction) return;
    try {
      const checkRes = await checkSignStatusQ1({
        tranId: waitingTransaction.tranId,
        accessToken: waitingTransaction.accessToken,
        digestValue: waitingTransaction.digestValue,
        rawXml: effectiveXmlToSign,
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
        toast.success("Ký số thành công!", "Hoàn Tất Ký");
        onSignedSuccess(checkRes.signedXml, checkRes);
      } else if (checkRes.status === SMARTCA_TRAN_STATUS.EXPIRED) {
        handleCancelWaiting();
        toast.error(checkRes.error || "Giao dịch đã hết hạn.", "Hết Hạn");
      } else if (checkRes.status === SMARTCA_TRAN_STATUS.SIGNER_REJECTED) {
        handleCancelWaiting();
        toast.warning(checkRes.error || "Người dùng đã từ chối ký.", "Từ Chối Ký");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lỗi kiểm tra trạng thái", "Lỗi Kiểm Tra");
    }
  };

  const handleSimulateAppConfirm = async () => {
    if (!waitingTransaction) return;
    try {
      await confirmMockSignQ1(waitingTransaction.tranId);
      await handleCheckNow();
    } catch (err: unknown) {
      console.error("Mock confirm error:", err);
    }
  };

  const handleSimulateAppReject = async () => {
    if (!waitingTransaction) return;
    try {
      await rejectMockSignQ1(waitingTransaction.tranId);
      await handleCheckNow();
    } catch (err: unknown) {
      console.error("Mock reject error:", err);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    credential,
    config,
    signerName,
    setSignerName,
    signerEmail,
    setSignerEmail,
    idType,
    identityValue,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isInitiating,
    waitingTransaction,
    countdown,
    authErrorModalData,
    digestInfo,
    copiedKey,
    handleCopy,
    handleIdentityChange,
    handleSelectIdType,
    handleCloseAuthErrorModal,
    handleCancelWaiting,
    handleResetAndResign,
    handleInitiateQ1Sign,
    handleCheckNow,
    handleSimulateAppConfirm,
    handleSimulateAppReject,
    formatCountdown,
  };
}
