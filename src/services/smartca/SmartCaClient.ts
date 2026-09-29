// ============================================================
// REAL CLIENT - Gọi VNPT SmartCA API Gateway bằng fetch
// Theo đặc tả: Tài liệu Tích hợp VNPT-SmartCA v1.1 (15-05-2024)
//   - OAuth2: POST {resource}/auth/token (x-www-form-urlencoded)
//   - API:    {resource}/csc/credentials/list|info, /csc/signature/signhash,
//             /csc/credentials/gettraninfo (JSON + Bearer)
// Lưu ý CORS: trình duyệt gọi trực tiếp cần VNPT mở CORS cho origin;
// khi bị chặn cần proxy server-side (ngoài phạm vi giai đoạn này).
// ============================================================

import {
  SMARTCA_ENDPOINTS,
  SmartCaError,
  SMARTCA_OAUTH_ERROR_VI,
  type SmartCaEndpoints,
  type SmartCaTokenPair,
  type SmartCaTokenResponse,
  type SmartCaUserInfo,
  type SmartCaCredential,
  type SmartCaSignHashRequest,
  type SmartCaSignResponse,
  type SmartCaTransactionInfo,
  type SmartCaEnvelope,
  type SmartCaClient as SmartCaClientContract,
  type SmartCaEnv,
} from "../../types/smartcaTypes";

const TOKEN_EXPIRY_SAFETY_MARGIN_MS = 5 * 60_000; // 5 phút - Biên an toàn chủ động làm mới token trước khi hết hạn
const REQUEST_TIMEOUT_MS = 30_000; // 30 giây - Thời gian chờ tối đa chống treo request

export interface SmartCaRealClientOptions {
  env: Exclude<SmartCaEnv, "mock">;
  clientId: string;
  clientSecret: string;
}

/** Tính thời điểm hết hạn có biên an toàn */
function tokenExpiresAt(expiresIn: number): number {
  return Date.now() + expiresIn * 1000 - TOKEN_EXPIRY_SAFETY_MARGIN_MS;
}

function toTokenPair(res: SmartCaTokenResponse): SmartCaTokenPair {
  return {
    accessToken: res.access_token,
    refreshToken: res.refresh_token,
    accessTokenExpiresAt: tokenExpiresAt(res.expires_in ?? 3600),
  };
}

/** fetch + timeout + parse envelope chuẩn, code !== 0 -> SmartCaError */
async function postJson<T>(
  url: string,
  body: unknown,
  accessToken?: string,
): Promise<SmartCaEnvelope<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const envelope = (await response.json()) as SmartCaEnvelope<T>;
    if (envelope.code !== 0) {
      throw new SmartCaError(
        envelope.message ||
          envelope.codeDesc ||
          `SmartCA trả về mã lỗi ${envelope.code}`,
        envelope.code,
        envelope.codeDesc,
      );
    }
    return envelope;
  } finally {
    clearTimeout(timer);
  }
}

export class SmartCaHttpClient implements SmartCaClientContract {
  private readonly endpoints: SmartCaEndpoints;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(options: SmartCaRealClientOptions) {
    this.endpoints = SMARTCA_ENDPOINTS[options.env];
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
  }

  /** 
   * [DÙNG CHO CẢ Q1 & Q2] Xác thực lấy access_token từ VNPT SmartCA:
   * - Quy trình 1 (Q1 - Ký qua App): `password` là Mật khẩu tài khoản SmartCA (đăng nhập duy trì phiên).
   * - Quy trình 2 (Q2 - Smart OTP): `password` là Mã Smart OTP 6 số nhập từ người dùng.
   */
  async login(username: string, password: string): Promise<SmartCaTokenPair> {
    const body = new URLSearchParams({
      grant_type: "password",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      username,
      password,
    });
    return this.tokenRequest(body);
  }

  /** 
   * [CHỦ YẾU PHỤC VỤ Q1] Làm mới access_token tự động khi phiên đăng nhập hết hạn.
   */
  async refresh(refreshToken: string): Promise<SmartCaTokenPair> {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      scope: "sign offline_access",
    });
    return this.tokenRequest(body);
  }

  private async tokenRequest(body: URLSearchParams): Promise<SmartCaTokenPair> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(this.endpoints.token, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal: controller.signal,
      });
      if (!response.ok) {
        let errorCode = "unknown_error";
        try {
          const err = (await response.json()) as { error?: string };
          if (err.error) errorCode = err.error;
        } catch {
          // body không phải JSON
        }
        throw new SmartCaError(
          SMARTCA_OAUTH_ERROR_VI[errorCode] ??
            `Lỗi xác thực SmartCA (HTTP ${response.status})`,
          errorCode,
        );
      }
      const data = (await response.json()) as SmartCaTokenResponse;
      return toTokenPair(data);
    } finally {
      clearTimeout(timer);
    }
  }

  /** 
   * [PHỤC VỤ Q1] Lấy thông tin định danh Bác sĩ (họ tên, CCCD, SĐT) để hiển thị lên Header/UI.
   */
  async getUserInfo(accessToken: string): Promise<SmartCaUserInfo> {
    const envelope = await postJson<SmartCaUserInfo>(
      `${this.endpoints.resource}/identityapi/userinfo/info`,
      {},
      accessToken,
    );
    return envelope.content as SmartCaUserInfo;
  }

  /** 
   * [DÙNG CHO CẢ Q1 & Q2] Lấy danh sách ID chứng thư số (Credential IDs) của Bác sĩ trên VNPT.
   */
  async listCredentials(accessToken: string): Promise<string[]> {
    const envelope = await postJson<string[]>(
      `${this.endpoints.resource}/csc/credentials/list`,
      {},
      accessToken,
    );
    return envelope.content ?? [];
  }

  /** 
   * [DÙNG CHO CẢ Q1 & Q2] Lấy chi tiết chứng thư số (SubjectDN, Serial, X509 Cert) để nhúng vào XMLDSig.
   */
  async getCredentialInfo(
    accessToken: string,
    credentialId: string,
  ): Promise<SmartCaCredential> {
    const envelope = await postJson<SmartCaCredential>(
      `${this.endpoints.resource}/csc/credentials/info`,
      {
        credentialId,
        certificates: "chain",
        certInfo: true,
        authInfo: true,
      },
      accessToken,
    );
    return envelope.content as SmartCaCredential;
  }

  /** 
   * [DÙNG CHO CẢ Q1 & Q2] Gửi mã băm (Hash Digest) của XML sang VNPT để yêu cầu ký:
   * - Q1: Khởi tạo giao dịch ký, trả về `tranId` để chờ duyệt trên App.
   * - Q2: Yêu cầu ký nhanh với phiên đã xác thực bằng OTP.
   */
  async signHash(
    accessToken: string,
    request: SmartCaSignHashRequest,
  ): Promise<SmartCaSignResponse> {
    const envelope = await postJson<SmartCaSignResponse>(
      `${this.endpoints.resource}/csc/signature/signhash`,
      request,
      accessToken,
    );
    return envelope.content as SmartCaSignResponse;
  }

  /** 
   * [DÙNG CHO CẢ Q1 & Q2] Kiểm tra trạng thái giao dịch & lấy kết quả chữ ký (Signature Value):
   * - Q1: Dùng để Polling (hỏi liên tục) xem người dùng đã bấm đồng ý trên điện thoại chưa.
   * - Q2: Dùng để lấy ngay chuỗi chữ ký số sau khi gọi signHash.
   */
  async getTransactionInfo(
    accessToken: string,
    tranId: string,
  ): Promise<SmartCaTransactionInfo> {
    const envelope = await postJson<SmartCaTransactionInfo>(
      `${this.endpoints.resource}/csc/credentials/gettraninfo`,
      { tranId },
      accessToken,
    );
    return envelope.content as SmartCaTransactionInfo;
  }
}
