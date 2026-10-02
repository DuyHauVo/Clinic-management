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
  type SmartCaSignFileRequest,
  type SmartCaSignResponse,
  type SmartCaTransactionInfo,
  type SmartCaEnvelope,
  type SmartCaClient as SmartCaClientContract,
  type SmartCaEnv,
} from "../../types/smartcaTypes";

const TOKEN_EXPIRY_SAFETY_MARGIN_MS = 5 * 60_000; // 5 phút - Biên an toàn chủ động làm mới token trước khi hết hạn
const REQUEST_TIMEOUT_MS = 30_000; // 30 giây - Thời gian chờ tối đa chống treo request

export interface SmartCaRealClientOptions {
  env: SmartCaEnv;
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
    let envelope: any;
    try {
      envelope = await response.json();
    } catch {
      throw new SmartCaError(
        `Không thể phân tích phản hồi từ máy chủ VNPT SmartCA (HTTP ${response.status})`,
        response.status,
      );
    }

    if (!response.ok) {
      const errDetail =
        envelope?.message ||
        envelope?.error_description ||
        envelope?.codeDesc ||
        envelope?.error ||
        `HTTP ${response.status} ${response.statusText || ""}`.trim();
      throw new SmartCaError(
        `Cổng VNPT SmartCA từ chối [HTTP ${response.status}]: ${errDetail}`,
        envelope?.code || response.status,
        envelope?.codeDesc || String(response.status),
      );
    }

    if (envelope.code !== undefined && envelope.code !== 0) {
      const errDetail =
        envelope.message ||
        envelope.codeDesc ||
        `Mã phản hồi từ SmartCA: ${envelope.code}`;
      throw new SmartCaError(
        errDetail,
        envelope.code,
        envelope.codeDesc,
      );
    }

    return envelope as SmartCaEnvelope<T>;
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
        let errorDescription = "";
        try {
          const err = (await response.json()) as {
            error?: string;
            error_description?: string;
            message?: string;
          };
          if (err.error) errorCode = err.error;
          if (err.error_description) errorDescription = err.error_description;
          else if (err.message) errorDescription = err.message;
        } catch {
          // body không phải JSON
        }

        const friendlyVi = SMARTCA_OAUTH_ERROR_VI[errorCode];
        const detailMessage = errorDescription
          ? friendlyVi
            ? `${friendlyVi} (${errorDescription})`
            : errorDescription
          : friendlyVi || `Lỗi xác thực VNPT SmartCA (HTTP ${response.status})`;

        throw new SmartCaError(detailMessage, errorCode);
      }
      const data = (await response.json()) as SmartCaTokenResponse;
      return toTokenPair(data);
    } finally {
      clearTimeout(timer);
    }
  }

  async getUserInfo(accessToken: string): Promise<SmartCaUserInfo> {
    const envelope = await postJson<any>(
      `${this.endpoints.resource}/identityapi/userinfo/info`,
      {},
      accessToken,
    );
    const data =
      envelope?.content !== undefined && envelope?.content !== null
        ? envelope.content
        : envelope;
    return data as SmartCaUserInfo;
  }

  async listCredentials(accessToken: string): Promise<string[]> {
    const envelope = await postJson<any>(
      `${this.endpoints.resource}/csc/credentials/list`,
      {},
      accessToken,
    );
    const raw: any = envelope;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.credentialIDs)) return raw.credentialIDs;
    return raw?.content ?? [];
  }

  async getCredentialInfo(
    accessToken: string,
    credentialId: string,
  ): Promise<SmartCaCredential> {
    const envelope = await postJson<any>(
      `${this.endpoints.resource}/csc/credentials/info`,
      {
        credentialId,
        certificates: "chain",
        certInfo: true,
        authInfo: true,
      },
      accessToken,
    );
    const data =
      envelope?.content !== undefined && envelope?.content !== null
        ? envelope.content
        : envelope;
    return data as SmartCaCredential;
  }

  async signHash(
    accessToken: string,
    request: SmartCaSignHashRequest,
  ): Promise<SmartCaSignResponse> {
    const envelope = await postJson<any>(
      `${this.endpoints.resource}/csc/signature/signhash`,
      request,
      accessToken,
    );
    const data =
      envelope?.content !== undefined && envelope?.content !== null
        ? envelope.content
        : envelope;
    return data as SmartCaSignResponse;
  }

  async sign(
    accessToken: string,
    request: SmartCaSignFileRequest,
  ): Promise<SmartCaSignResponse> {
    const envelope = await postJson<any>(
      `${this.endpoints.resource}/csc/signature/sign`,
      request,
      accessToken,
    );
    const data =
      envelope?.content !== undefined && envelope?.content !== null
        ? envelope.content
        : envelope;
    return data as SmartCaSignResponse;
  }

  async getTransactionInfo(
    accessToken: string,
    tranId: string,
  ): Promise<SmartCaTransactionInfo> {
    const envelope = await postJson<any>(
      `${this.endpoints.resource}/csc/credentials/gettraninfo`,
      { tranId },
      accessToken,
    );
    const data =
      envelope?.content !== undefined && envelope?.content !== null
        ? envelope.content
        : envelope;
    return data as SmartCaTransactionInfo;
  }
}
