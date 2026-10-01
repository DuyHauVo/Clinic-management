import {
  computeXmlDigest,
  injectSignatureToXml,
  type XmlDSigParams,
} from "../../utils/xmlDsigEngine";
import {
  SMARTCA_ENV,
  SMARTCA_CLIENT_ID,
  SMARTCA_CLIENT_SECRET,
  SMARTCA_DEFAULT_MST,
  SMARTCA_DEFAULT_CCCD,
} from "./smartcaConfig";
import { SmartCaHttpClient } from "./SmartCaClient";
import {
  SMARTCA_TRAN_STATUS,
  type SignerProfile,
} from "../../types/smartcaTypes";

export interface SmartCaSignRequest {
  username?: string;
  password?: string;
  accessToken?: string;
  digestValue: string;
  fileName?: string;
  refTranId?: string;
  subjectDN?: string;
  serialNumber?: string;
  userId?: string;
  signer?: SignerProfile;
  otp?: string;
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

// CẤU HÌNH BIẾN MÔI TRƯỜNG KẾT NỐI SMARTCA (PRODUCTION / DEMO)
const CONFIG = {
  env: SMARTCA_ENV,
  clientId: SMARTCA_CLIENT_ID,
  clientSecret: SMARTCA_CLIENT_SECRET,
  defaultUsername: SMARTCA_DEFAULT_MST || SMARTCA_DEFAULT_CCCD,
};

// ============================================================================
// LOGIC XỬ LÝ QUY TRÌNH 1 (Q1 - KÝ PHÊ DUYỆT TRÊN APP VNPT SMARTCA)
// ============================================================================

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

  try {
    const realClient = new SmartCaHttpClient({
      env: CONFIG.env,
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

    const credInfo = await realClient.getCredentialInfo(
      accessToken,
      credIds[0],
    );
    if (!credInfo || !credInfo.cert) {
      throw new Error(
        `Không thể lấy thông tin chứng thư số từ SmartCA (${JSON.stringify(credInfo || {})})`,
      );
    }
    const x509Certificate = credInfo.cert?.certificates?.[0] || "";
    const rsaModulus = credInfo.cert?.rsaModulus;
    const rsaExponent = credInfo.cert?.rsaExponent || "AQAB";

    const refTranId =
      req.refTranId ||
      `REF_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    const signRes = await realClient.signHash(accessToken, {
      credentialId: credIds[0],
      refTranId,
      datas: [
        {
          name: req.fileName || `DOC_${Date.now()}.xml`,
          hash: req.digestValue,
        },
      ],
    });

    const tranId = signRes?.tranId || (signRes as any)?.content?.tranId || (signRes as any)?.tran_id || "";
    if (!tranId) {
      throw new Error(
        `SmartCA không trả về mã giao dịch tranId hợp lệ (${JSON.stringify(signRes || {})})`,
      );
    }

    return {
      success: true,
      tranId,
      accessToken,
      credentialId: credIds[0],
      status: SMARTCA_TRAN_STATUS.WAITING_FOR_SIGNER_CONFIRM,
      subjectDN: credInfo.cert?.subjectDN || req.signer?.subjectDN || "",
      serialNumber: credInfo.cert?.serialNumber || req.signer?.serialNumber || "",
      issuerDN: credInfo.cert?.issuerDN || "",
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
  const { tranId, accessToken, digestValue, rawXml, certInfo, signer } =
    options;

  try {
    const realClient = new SmartCaHttpClient({
      env: CONFIG.env,
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
      const issuerDN = certInfo?.issuerDN || "";
      const x509Certificate = certInfo?.x509Certificate || "";
      const rsaModulus = certInfo?.rsaModulus || "";
      const rsaExponent = certInfo?.rsaExponent || "AQAB";

      let signedXml = rawXml;
      if (rawXml) {
        if (!x509Certificate) {
          throw new Error(
            "Lỗi chữ ký số Production: Không nhận được X509 Certificate từ chứng thư số thực tế của SmartCA.",
          );
        }
        const dsigParams: XmlDSigParams = {
          signatureId: `Id-${crypto.randomUUID()}`,
          digestValue,
          signatureValue,
          subjectDN,
          x509Certificate,
          rsaModulus: rsaModulus || undefined,
          rsaExponent: rsaExponent || "AQAB",
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
        error: "Giao dịch ký số đã hết hạn trên App VNPT SmartCA",
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

// Xử lý ký số một chạm (Hỗ trợ Q1)
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

// Xử lý băm và ghép chữ ký XML hoàn chỉnh (Hỗ trợ Q1)
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
        error:
          signResponse.error || "Giao dịch đang chờ xác nhận trên App VNPT SmartCA",
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
