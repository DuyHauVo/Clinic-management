// ============================================================
// SERVERLESS GATEWAY HANDLERS - Xử lý nghiệp vụ ký số bảo mật
// theo chuẩn VNPT SmartCA v4.1 Mục 4 (Quy trình 1 - Ký qua App Mobile)
// ============================================================

import {
  computeXmlDigest,
  injectSignatureToXml,
  type XmlDSigParams,
} from "../../utils/xmlDsigEngine";
import {
  SMARTCA_ENV,
  SMARTCA_CLIENT_ID,
  SMARTCA_CLIENT_SECRET,
  SMARTCA_DEFAULT_CCCD,
} from "./smartcaConfig";
import { SmartCaHttpClient } from "./SmartCaClient";
import { MockSmartCaClient } from "./MockSmartCaClient";
import {
  SMARTCA_TRAN_STATUS,
  type SignerProfile,
} from "../../types/smartcaTypes";

// ============================================================================
// 1. CÁC KIỂU DỮ LIỆU YÊU CẦU & KẾT QUẢ KÝ (QUY TRÌNH 1 - Q1)
// ============================================================================
export interface SmartCaSignRequest {
  username?: string;
  password?: string;
  accessToken?: string;
  digestValue: string;
  fileName?: string;
  subjectDN?: string;
  serialNumber?: string;
  userId?: string;
  signer?: SignerProfile;
  otp?: string; // Tương thích ngược nếu có
}

export type SmartCaQ1SignRequest = SmartCaSignRequest;
export type SmartCaQ2SignRequest = SmartCaSignRequest;

export interface SmartCaQ1InitiateResponse {
  success: boolean;
  tranId: string;
  accessToken: string;
  credentialId: string;
  status: number; // 4000 (WAITING_FOR_SIGNER_CONFIRM)
  subjectDN: string;
  serialNumber: string;
  issuerDN: string;
  x509Certificate: string;
  rsaModulus?: string;
  rsaExponent?: string;
  digestValue: string;
  signer?: SignerProfile;
  error?: string;
}

export interface SmartCaSignResponse {
  success: boolean;
  tranId: string;
  tranCode?: string;
  status?: number;
  signatureValue: string;
  subjectDN: string;
  serialNumber: string;
  issuerDN: string;
  x509Certificate: string;
  rsaModulus?: string;
  rsaExponent?: string;
  signedAt: string;
  digestValue: string;
  signedXml?: string;
  signer?: SignerProfile;
  error?: string;
}

export type SmartCaQ1SignResponse = SmartCaSignResponse;
export type SmartCaQ2SignResponse = SmartCaSignResponse;

// ============================================================================
// 2. CẤU HÌNH BIẾN MÔI TRƯỜNG & CHỨNG THƯ SỐ MẪU
// ============================================================================
const CONFIG = {
  env: SMARTCA_ENV,
  clientId: SMARTCA_CLIENT_ID,
  clientSecret: SMARTCA_CLIENT_SECRET,
  defaultUsername: SMARTCA_DEFAULT_CCCD,
};

let mockCryptoCache: Promise<{
  rsaModulus: string;
  rsaExponent: string;
  x509Certificate: string;
}> | null = null;

/**
 * Sinh cặp khóa RSA 2048-bit động cho môi trường Mock/Sandbox lúc runtime bằng WebCrypto API.
 * Cache Lazy Singleton 1 lần mỗi phiên, không hardcode bất kỳ private key hay modulus nào trong source.
 */
export async function getRuntimeMockCrypto(): Promise<{
  rsaModulus: string;
  rsaExponent: string;
  x509Certificate: string;
}> {
  if (!mockCryptoCache) {
    mockCryptoCache = (async () => {
      try {
        if (typeof crypto !== "undefined" && crypto.subtle) {
          const keyPair = await crypto.subtle.generateKey(
            {
              name: "RSASSA-PKCS1-v1_5",
              modulusLength: 2048,
              publicExponent: new Uint8Array([1, 0, 1]),
              hash: "SHA-256",
            },
            true,
            ["sign", "verify"],
          );
          const jwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
          const base64UrlToBase64 = (b64u: string) => {
            let b64 = b64u.replace(/-/g, "+").replace(/_/g, "/");
            while (b64.length % 4) b64 += "=";
            return b64;
          };
          const modulus = base64UrlToBase64(jwk.n || "");
          const exponent = base64UrlToBase64(jwk.e || "AQAB");
          const pseudoCert = btoa(`MOCK_X509_CERTIFICATE_${modulus.slice(0, 32)}_${Date.now()}`);
          return {
            rsaModulus: modulus,
            rsaExponent: exponent,
            x509Certificate: pseudoCert,
          };
        }
      } catch {
        // Fallback an toàn nếu môi trường không có crypto.subtle
      }
      return {
        rsaModulus: "",
        rsaExponent: "AQAB",
        x509Certificate: "",
      };
    })();
  }
  return mockCryptoCache;
}

// Metadata chứng thư số mẫu chuẩn của Cơ sở khám chữa bệnh (dùng cho Mock & Sandbox)
export const MOCK_CERTIFICATE_CONFIG = {
  subjectDN:
    "C=VN, S=Quảng Nam, L=Thành phố Tam Kỳ, CN=CÔNG TY CP ĐẦU TƯ FQ VIỆT NAM, OID.0.9.2342.19200300.100.1.1=MST:4001266514",
  issuerDN: "VNPT SmartCA RS, VIETNAM POSTS AND TELECOMMUNICATIONS GROUP, C=VN",
  serialNumber: "4001266514_SMARTCA_2026",
  validTo: "2026-11-17 17:00:00",
};

/**
 * Sinh chữ ký mô phỏng RSA 2048-bit (Base64) chuẩn đặc tả VNPT SmartCA
 */
export function generateMockSignatureValue(_digestValue: string): string {
  return "roeBokGItwTuObPRrnZkmvu8vpTLzLMz7Vx01nlHcKCn+bTElXK0KM7PixT17kScDy4hD2agfoDjzNb1AZ+LiYBBgni01JPpTIRcTmpQJmSYcZKbO0dVSuY4FLg9bGHWkGAsTj7nN0HbxUMfuEui4vBGrW0N0G54hEHOboPpz44DIRkyS5cKiRWcMiMuZTAZHjtOS6tB0HK6RW8okkVKHn/IGX97fnXyJ4J40BoDicolX7oR1okb+K7bUGqYUDwpGehqcCAzIHUCJVZQ0BaFn7eNa0MYuH98H7+Phzv6tmL7SJaFACY+qGXm+247c1KXF+a4WVJaZI/NvToc1k0iHQ==";
}

// ============================================================================
// 3. LOGIC XỬ LÝ QUY TRÌNH 1 (Q1 - KÝ PHÊ DUYỆT TRÊN APP SMARTCA)
// ============================================================================

/**
 * Bước 1 (Q1): Khởi tạo giao dịch ký số và gửi Push Notification lên App VNPT SmartCA
 */
export async function initiateSignQ1(
  req: SmartCaSignRequest,
): Promise<SmartCaQ1InitiateResponse> {
  const username =
    req.username ||
    req.signer?.phone ||
    req.signer?.cccd ||
    req.signer?.mst ||
    req.userId ||
    CONFIG.defaultUsername;

  const isUnitSign = req.signer?.role === "DON_VI" || Boolean(req.signer?.mst);
  const signerName =
    req.signer?.name ||
    (isUnitSign
      ? `PHÒNG KHÁM ĐA KHOA (MST: ${req.signer?.mst || "4001266514"})`
      : "Bác sĩ điều trị");
  const roleTitle =
    req.signer?.roleTitle || (isUnitSign ? "Chữ ký đơn vị" : "Bác sĩ");
  const idValue =
    req.signer?.mst || req.signer?.phone || req.signer?.cccd || username || "0901234567";

  // --- A. MÔI TRƯỜNG MOCK ---
  if (CONFIG.env === "mock") {
    const mockClient = new MockSmartCaClient();
    const tokenPair = await mockClient.login(username, req.password || "123456");
    const credIds = await mockClient.listCredentials();
    const credInfo = await mockClient.getCredentialInfo(
      tokenPair.accessToken,
      credIds[0],
    );

    const signRes = await mockClient.signHash(tokenPair.accessToken, {
      credentialId: credIds[0],
      datas: [
        {
          name: req.fileName || `DOC_${Date.now()}.xml`,
          hash: req.digestValue,
        },
      ],
    });

    const mockCrypto = await getRuntimeMockCrypto();
    return {
      success: true,
      tranId: signRes.tranId,
      accessToken: tokenPair.accessToken,
      credentialId: credIds[0],
      status: SMARTCA_TRAN_STATUS.WAITING_FOR_SIGNER_CONFIRM,
      subjectDN:
        credInfo.cert?.subjectDN ||
        req.signer?.subjectDN ||
        (isUnitSign
          ? `CN=CƠ SỞ KCB, OID.0.9.2342.19200300.100.1.1=MST:${idValue}, C=VN`
          : `CN=${signerName.toUpperCase()}, TITLE=${roleTitle}, UID=${idValue}, O=PHÒNG KHÁM, C=VN`),
      serialNumber:
        credInfo.cert?.serialNumber ||
        req.signer?.serialNumber ||
        `SMARTCA_${idValue}`,
      issuerDN: MOCK_CERTIFICATE_CONFIG.issuerDN,
      x509Certificate: mockCrypto.x509Certificate,
      rsaModulus: mockCrypto.rsaModulus,
      rsaExponent: mockCrypto.rsaExponent,
      digestValue: req.digestValue,
      signer: req.signer,
    };
  }

  // --- B. MÔI TRƯỜNG DEMO / PRODUCTION ---
  try {
    const realClient = new SmartCaHttpClient({
      env: CONFIG.env as "demo" | "production",
      clientId: CONFIG.clientId,
      clientSecret: CONFIG.clientSecret,
    });

    let accessToken = req.accessToken;
    if (!accessToken) {
      if (!req.password) {
        throw new Error(
          "Vui lòng nhập mật khẩu tài khoản SmartCA để khởi tạo yêu cầu ký số.",
        );
      }
      const tokenPair = await realClient.login(username, req.password);
      accessToken = tokenPair.accessToken;
    }

    const credIds = await realClient.listCredentials(accessToken);
    if (!credIds || credIds.length === 0) {
      throw new Error(
        `Tài khoản VNPT SmartCA (${username}) chưa đăng ký hoặc chưa có chứng thư số hợp lệ.`,
      );
    }

    const credInfo = await realClient.getCredentialInfo(accessToken, credIds[0]);
    const x509Certificate = credInfo.cert?.certificates?.[0] || "";
    const rsaModulus = credInfo.cert?.rsaModulus;
    const rsaExponent = credInfo.cert?.rsaExponent || "AQAB";

    const signRes = await realClient.signHash(accessToken, {
      credentialId: credIds[0],
      datas: [
        {
          name: req.fileName || `DOC_${Date.now()}.xml`,
          hash: req.digestValue,
        },
      ],
    });

    return {
      success: true,
      tranId: signRes.tranId,
      accessToken,
      credentialId: credIds[0],
      status: SMARTCA_TRAN_STATUS.WAITING_FOR_SIGNER_CONFIRM,
      subjectDN:
        credInfo.cert?.subjectDN ||
        req.signer?.subjectDN ||
        (isUnitSign
          ? `CN=CƠ SỞ KCB, OID.0.9.2342.19200300.100.1.1=MST:${idValue}, C=VN`
          : `CN=${signerName.toUpperCase()}, TITLE=${roleTitle}, UID=${idValue}, O=PHÒNG KHÁM, C=VN`),
      serialNumber:
        credInfo.cert?.serialNumber ||
        req.signer?.serialNumber ||
        `SMARTCA_${idValue}`,
      issuerDN:
        credInfo.cert?.issuerDN ||
        "C=VN,O=VIETNAM POSTS AND TELECOMMUNICATIONS GROUP,CN=VNPT SmartCA RS",
      x509Certificate,
      rsaModulus,
      rsaExponent,
      digestValue: req.digestValue,
      signer: req.signer,
    };
  } catch (err: unknown) {
    const endpoint =
      CONFIG.env === "production" ? "gwsca.vnpt.vn" : "rmgateway.vnptit.vn";
    const rawError =
      err instanceof Error ? err.message : "Khởi tạo ký số VNPT thất bại";
    return {
      success: false,
      tranId: "",
      accessToken: "",
      credentialId: "",
      status: 0,
      subjectDN: "",
      serialNumber: "",
      issuerDN: "",
      x509Certificate: "",
      digestValue: req.digestValue,
      signer: req.signer,
      error: `[VNPT_SMARTCA_${CONFIG.env.toUpperCase()}_AUTH_FAILED] Không thể kết nối hoặc khởi tạo giao dịch với Cổng VNPT SmartCA (${endpoint}): ${rawError}`,
    };
  }
}

/**
 * Bước 2 (Q1): Kiểm tra trạng thái giao dịch ký số (Polling từ Web)
 */
export async function checkSignStatusQ1(options: {
  tranId: string;
  accessToken: string;
  digestValue: string;
  rawXml?: string;
  certInfo?: {
    subjectDN: string;
    serialNumber: string;
    issuerDN: string;
    x509Certificate: string;
    rsaModulus?: string;
    rsaExponent?: string;
  };
  signer?: SignerProfile;
}): Promise<SmartCaSignResponse> {
  const { tranId, accessToken, digestValue, rawXml, certInfo, signer } = options;

  // --- A. MÔI TRƯỜNG MOCK ---
  if (CONFIG.env === "mock") {
    const mockClient = new MockSmartCaClient();
    try {
      const tranInfo = await mockClient.getTransactionInfo(accessToken, tranId);
      if (tranInfo.tranStatus === SMARTCA_TRAN_STATUS.SUCCESS) {
        const signatureValue =
          tranInfo.documents?.[0]?.sig || generateMockSignatureValue(digestValue);

        const mockCrypto = await getRuntimeMockCrypto();
        const subjectDN =
          certInfo?.subjectDN ||
          signer?.subjectDN ||
          `CN=BS. NGUYỄN VĂN AN, O=PHÒNG KHÁM, C=VN`;
        const serialNumber =
          certInfo?.serialNumber || signer?.serialNumber || "4001266514_SMARTCA_2026";
        const issuerDN = certInfo?.issuerDN || MOCK_CERTIFICATE_CONFIG.issuerDN;
        const x509Certificate =
          certInfo?.x509Certificate || mockCrypto.x509Certificate;
        const rsaModulus = certInfo?.rsaModulus || mockCrypto.rsaModulus;
        const rsaExponent = certInfo?.rsaExponent || mockCrypto.rsaExponent;

        let signedXml = rawXml;
        if (rawXml) {
          const dsigParams: XmlDSigParams = {
            signatureId: `Id-${crypto.randomUUID()}`,
            digestValue,
            signatureValue,
            subjectDN,
            x509Certificate,
            rsaModulus,
            rsaExponent,
            signingTime: new Date().toISOString(),
          };
          signedXml = injectSignatureToXml(rawXml, dsigParams);
        }

        return {
          success: true,
          status: SMARTCA_TRAN_STATUS.SUCCESS,
          tranId,
          tranCode: "00",
          signatureValue,
          subjectDN,
          serialNumber,
          issuerDN,
          x509Certificate,
          rsaModulus,
          rsaExponent,
          signedAt: new Date().toISOString(),
          digestValue,
          signedXml,
          signer,
        };
      }

      if (tranInfo.tranStatus === SMARTCA_TRAN_STATUS.EXPIRED) {
        return {
          success: false,
          status: SMARTCA_TRAN_STATUS.EXPIRED,
          tranId,
          signatureValue: "",
          subjectDN: "",
          serialNumber: "",
          issuerDN: "",
          x509Certificate: "",
          signedAt: "",
          digestValue,
          error: "Giao dịch ký số đã hết hạn trên App SmartCA (quá thời gian chờ)",
        };
      }

      if (tranInfo.tranStatus === SMARTCA_TRAN_STATUS.SIGNER_REJECTED) {
        return {
          success: false,
          status: SMARTCA_TRAN_STATUS.SIGNER_REJECTED,
          tranId,
          signatureValue: "",
          subjectDN: "",
          serialNumber: "",
          issuerDN: "",
          x509Certificate: "",
          signedAt: "",
          digestValue,
          error: "Người dùng đã từ chối xác nhận ký số trên App SmartCA",
        };
      }

      return {
        success: false,
        status: SMARTCA_TRAN_STATUS.WAITING_FOR_SIGNER_CONFIRM,
        tranId,
        signatureValue: "",
        subjectDN: "",
        serialNumber: "",
        issuerDN: "",
        x509Certificate: "",
        signedAt: "",
        digestValue,
        signer,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi kiểm tra trạng thái mock";
      return {
        success: false,
        status: 0,
        tranId,
        signatureValue: "",
        subjectDN: "",
        serialNumber: "",
        issuerDN: "",
        x509Certificate: "",
        signedAt: "",
        digestValue,
        error: errorMsg,
      };
    }
  }

  // --- B. MÔI TRƯỜNG DEMO / PRODUCTION ---
  try {
    const realClient = new SmartCaHttpClient({
      env: CONFIG.env as "demo" | "production",
      clientId: CONFIG.clientId,
      clientSecret: CONFIG.clientSecret,
    });

    const tranInfo = await realClient.getTransactionInfo(accessToken, tranId);

    if (tranInfo.tranStatus === SMARTCA_TRAN_STATUS.SUCCESS) {
      const signatureValue = tranInfo.documents?.[0]?.sig;
      if (!signatureValue) {
        return {
          success: false,
          status: SMARTCA_TRAN_STATUS.WAITING_FOR_SIGNER_CONFIRM,
          tranId,
          signatureValue: "",
          subjectDN: "",
          serialNumber: "",
          issuerDN: "",
          x509Certificate: "",
          signedAt: "",
          digestValue,
          error: "Đang chờ hệ thống VNPT hoàn tất chuỗi chữ ký số...",
        };
      }

      const subjectDN = certInfo?.subjectDN || "";
      const serialNumber = certInfo?.serialNumber || "";
      const issuerDN = certInfo?.issuerDN || "VNPT SmartCA RS";
      const x509Certificate = certInfo?.x509Certificate || "";
      const rsaModulus = certInfo?.rsaModulus || "";
      const rsaExponent = certInfo?.rsaExponent || "AQAB";

      let signedXml = rawXml;
      if (rawXml) {
        if (!x509Certificate || !rsaModulus) {
          throw new Error(
            "Lỗi chữ ký số Production: Không nhận được X509 Certificate hoặc RSA Modulus từ chứng thư số thực tế của SmartCA.",
          );
        }
        const dsigParams: XmlDSigParams = {
          signatureId: `Id-${crypto.randomUUID()}`,
          digestValue,
          signatureValue,
          subjectDN,
          x509Certificate,
          rsaModulus,
          rsaExponent,
          signingTime: new Date().toISOString(),
        };
        signedXml = injectSignatureToXml(rawXml, dsigParams);
      }

      return {
        success: true,
        status: SMARTCA_TRAN_STATUS.SUCCESS,
        tranId,
        tranCode: "00",
        signatureValue,
        subjectDN,
        serialNumber,
        issuerDN,
        x509Certificate,
        signedAt: new Date().toISOString(),
        digestValue,
        signedXml,
        signer,
      };
    }

    if (tranInfo.tranStatus === SMARTCA_TRAN_STATUS.EXPIRED) {
      return {
        success: false,
        status: SMARTCA_TRAN_STATUS.EXPIRED,
        tranId,
        signatureValue: "",
        subjectDN: "",
        serialNumber: "",
        issuerDN: "",
        x509Certificate: "",
        signedAt: "",
        digestValue,
        error: "Giao dịch ký số đã hết hạn trên App SmartCA",
      };
    }

    if (tranInfo.tranStatus === SMARTCA_TRAN_STATUS.SIGNER_REJECTED) {
      return {
        success: false,
        status: SMARTCA_TRAN_STATUS.SIGNER_REJECTED,
        tranId,
        signatureValue: "",
        subjectDN: "",
        serialNumber: "",
        issuerDN: "",
        x509Certificate: "",
        signedAt: "",
        digestValue,
        error: "Người dùng đã từ chối xác nhận ký số trên App VNPT SmartCA",
      };
    }

    return {
      success: false,
      status: SMARTCA_TRAN_STATUS.WAITING_FOR_SIGNER_CONFIRM,
      tranId,
      signatureValue: "",
      subjectDN: "",
      serialNumber: "",
      issuerDN: "",
      x509Certificate: "",
      signedAt: "",
      digestValue,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Lỗi kiểm tra trạng thái ký VNPT";
    return {
      success: false,
      status: 0,
      tranId,
      signatureValue: "",
      subjectDN: "",
      serialNumber: "",
      issuerDN: "",
      x509Certificate: "",
      signedAt: "",
      digestValue,
      error: errorMsg,
    };
  }
}

/**
 * Giả lập người dùng bấm "Xác nhận" trên App SmartCA (dành cho chế độ Mock & Test)
 */
export async function confirmMockSignQ1(tranId: string): Promise<void> {
  const mockClient = new MockSmartCaClient();
  await mockClient.confirmMockSign(tranId);
}

/**
 * Giả lập người dùng bấm "Từ chối" trên App SmartCA (dành cho chế độ Mock & Test)
 */
export async function rejectMockSignQ1(tranId: string): Promise<void> {
  const mockClient = new MockSmartCaClient();
  await mockClient.rejectMockSign(tranId);
}

// ============================================================================
// 4. HÀM TƯƠNG THÍCH NGƯỢC (TỰ ĐỘNG KHỞI TẠO VÀ KÝ Q1)
// ============================================================================

/**
 * Xử lý ký số một chạm (Hỗ trợ Q1)
 */
export async function handleSignQ1(
  req: SmartCaSignRequest,
): Promise<SmartCaSignResponse> {
  const initRes = await initiateSignQ1(req);
  if (!initRes.success) {
    return {
      success: false,
      tranId: "",
      signatureValue: "",
      subjectDN: "",
      serialNumber: "",
      issuerDN: "",
      x509Certificate: "",
      signedAt: "",
      digestValue: req.digestValue,
      error: initRes.error,
    };
  }

  // Nếu ở chế độ mock và cần hoàn tất ngay
  if (CONFIG.env === "mock") {
    await confirmMockSignQ1(initRes.tranId);
    return await checkSignStatusQ1({
      tranId: initRes.tranId,
      accessToken: initRes.accessToken,
      digestValue: req.digestValue,
      certInfo: {
        subjectDN: initRes.subjectDN,
        serialNumber: initRes.serialNumber,
        issuerDN: initRes.issuerDN,
        x509Certificate: initRes.x509Certificate,
        rsaModulus: initRes.rsaModulus,
        rsaExponent: initRes.rsaExponent,
      },
      signer: req.signer,
    });
  }

  return {
    success: false,
    status: SMARTCA_TRAN_STATUS.WAITING_FOR_SIGNER_CONFIRM,
    tranId: initRes.tranId,
    signatureValue: "",
    subjectDN: initRes.subjectDN,
    serialNumber: initRes.serialNumber,
    issuerDN: initRes.issuerDN,
    x509Certificate: initRes.x509Certificate,
    signedAt: "",
    digestValue: req.digestValue,
    signer: req.signer,
  };
}

export const handleSignQ2 = handleSignQ1;

/**
 * Xử lý băm và ghép chữ ký XML hoàn chỉnh (Hỗ trợ Q1)
 */
export async function handleSignAndInjectXml(
  rawXml: string,
  _otpOrPassword?: string,
  fileName?: string,
  signer?: SignerProfile,
): Promise<{
  success: boolean;
  signedXml: string;
  signResponse: SmartCaSignResponse;
  error?: string;
}> {
  try {
    const { digestValue } = await computeXmlDigest(rawXml, {
      preserveOtherSignatures: true,
    });

    const signResponse = await handleSignQ1({
      digestValue,
      fileName,
      signer,
    });

    if (!signResponse.success || !signResponse.signatureValue) {
      return {
        success: false,
        signedXml: rawXml,
        signResponse,
        error: signResponse.error || "Giao dịch đang chờ xác nhận trên App SmartCA",
      };
    }

    const dsigParams: XmlDSigParams = {
      signatureId: `Id-${crypto.randomUUID()}`,
      digestValue,
      signatureValue: signResponse.signatureValue,
      subjectDN: signResponse.subjectDN,
      x509Certificate: signResponse.x509Certificate,
      rsaModulus: signResponse.rsaModulus,
      rsaExponent: signResponse.rsaExponent,
      signingTime: signResponse.signedAt,
    };

    const signedXml = injectSignatureToXml(rawXml, dsigParams);

    return {
      success: true,
      signedXml,
      signResponse,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi ký số XML";
    return {
      success: false,
      signedXml: rawXml,
      signResponse: {
        success: false,
        tranId: "",
        signatureValue: "",
        subjectDN: "",
        serialNumber: "",
        issuerDN: "",
        x509Certificate: "",
        signedAt: "",
        digestValue: "",
        error: errorMsg,
      },
      error: errorMsg,
    };
  }
}
