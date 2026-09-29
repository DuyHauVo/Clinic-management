// ============================================================
// TYPES - VNPT SmartCA API Gateway (Tài liệu v1.1, 15-05-2024)
// ============================================================

/** Môi trường kết nối SmartCA */
export type SmartCaEnv = 'mock' | 'demo' | 'production';

/** Endpoint gốc theo môi trường (Mục 2 - Giao thức API) */
export interface SmartCaEndpoints {
  authorize: string;
  token: string;
  resource: string;
}

export const SMARTCA_ENDPOINTS: Record<Exclude<SmartCaEnv, 'mock'>, SmartCaEndpoints> = {
  demo: {
    authorize: 'https://rmgateway.vnptit.vn/auth/authorize',
    token: 'https://rmgateway.vnptit.vn/auth/token',
    resource: 'https://rmgateway.vnptit.vn',
  },
  production: {
    authorize: 'https://gwsca.vnpt.vn/auth/authorize',
    token: 'https://gwsca.vnpt.vn/auth/token',
    resource: 'https://gwsca.vnpt.vn',
  },
};

// ------------------------------------------------------------
// OAuth2 Token (Mục 3 - Token Authorization)
// ------------------------------------------------------------

export interface SmartCaTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number; // giây
  scope: string;
}

export interface SmartCaTokenPair {
  accessToken: string;
  refreshToken: string;
  /** Unix ms khi access_token hết hạn (trừ biên an toàn 60s) */
  accessTokenExpiresAt: number;
}

// ------------------------------------------------------------
// Thông tin người dùng (5.1.1 Userinfo)
// ------------------------------------------------------------

export interface SmartCaUserInfo {
  accType: number; // 0 cá nhân, 1 doanh nghiệp, 2 cá nhân trong DN, 3 Onetime CA
  uid: string;
  uidPre?: string;
  email?: string;
  phone?: string;
}

// ------------------------------------------------------------
// Credential (5.2.1 List credential / 5.2.2 Credential Info)
// ------------------------------------------------------------

export interface SmartCaCredentialKeyInfo {
  status: string;
  alg: string[];
  len: number;
}

export interface SmartCaCredentialCertInfo {
  status: string;
  serialNumber: string;
  subjectDN: string;
  issuerDN: string;
  certificates: string[]; // base64 DER chain
  validFrom: string;
  validTo: string;
  rsaModulus?: string;
  rsaExponent?: string;
}

export interface SmartCaServicePack {
  servicePackId: string;
  name: string;
  type: number;
  status: number;
  admin?: {
    uid: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface SmartCaCredential {
  credentialId: string;
  key?: SmartCaCredentialKeyInfo;
  cert?: SmartCaCredentialCertInfo;
  authMode?: string;
  scal?: string;
  multisign?: number;
  status?: string;
  servicePacks?: SmartCaServicePack[];
  defaultServicePackId?: string;
  signType?: number;
}

// ------------------------------------------------------------
// Ký & Giao dịch (5.2.3 Sign / 5.2.4 Sign hash / 5.2.5 Get tran info)
// ------------------------------------------------------------

export interface SmartCaSignHashItem {
  name: string;
  /** SHA-256 digest, base64 chuẩn (vd: y4ahlQA4RZxb1Fh7V6dfK84ga3nnEecSdroDx1LmLGE=) */
  hash: string;
}

export interface SmartCaSignFileItem {
  name: string;
  dataBase64: string;
}

export interface SmartCaSignHashRequest {
  credentialId: string;
  refTranId?: string;
  notifyUrl?: string;
  description?: string;
  datas: SmartCaSignHashItem[]; // tối đa 50
}

export interface SmartCaSignFileRequest {
  credentialId: string;
  refTranId?: string;
  notifyUrl?: string;
  description?: string;
  datas: SmartCaSignFileItem[]; // tối đa 10
}

export interface SmartCaSignResponse {
  tranId: string;
}

/** Trạng thái giao dịch ký số (Mục 5.2.5) */
export const SMARTCA_TRAN_STATUS = {
  SUCCESS: 1,
  WAITING_FOR_SIGNER_CONFIRM: 4000,
  EXPIRED: 4001,
  SIGNER_REJECTED: 4002,
  AUTHORIZE_KEY_FAILED: 4003,
  SIGN_FAILED: 4004,
} as const;

export type SmartCaTranStatus =
  (typeof SMARTCA_TRAN_STATUS)[keyof typeof SMARTCA_TRAN_STATUS];

/** Nhãn hiển thị tiếng Việt theo mã trạng thái giao dịch */
export const SMARTCA_TRAN_STATUS_VI: Record<number, string> = {
  1: 'Ký số thành công',
  4000: 'Chờ người dùng xác nhận OTP trên app SmartCA',
  4001: 'Giao dịch đã hết hạn',
  4002: 'Người dùng từ chối xác nhận',
  4003: 'Xác thực khóa authorize thất bại',
  4004: 'Ký số thất bại',
};

export interface SmartCaSignedDocument {
  name: string;
  type?: string;
  size?: string;
  data?: string;
  hash?: string;
  sig?: string | null;
  dataSigned?: string | null;
  url?: string | null;
}

export interface SmartCaTransactionInfo {
  refTranId?: string;
  documents: SmartCaSignedDocument[];
  tranId: string;
  sub: string;
  credentialId: string;
  tranType: number;
  tranTypeDesc: string;
  tranStatus: number;
  tranStatusDesc: string;
  reqTime: string;
}

// ------------------------------------------------------------
// Envelope phản hồi chuẩn (Mục 4.2 Response)
// ------------------------------------------------------------

export interface SmartCaEnvelope<T = unknown> {
  code: number; // 0 = SUCCESS
  codeDesc: string | null;
  message: string | null;
  content: T | null;
}

// ------------------------------------------------------------
// Lỗi ứng dụng
// ------------------------------------------------------------

export class SmartCaError extends Error {
  /** Mã lỗi SmartCA (envelope code) hoặc mã OAuth2 (invalid_client, invalid_grant...) */
  readonly code: string | number;
  readonly codeDesc: string | null;

  constructor(message: string, code: string | number, codeDesc: string | null = null) {
    super(message);
    this.name = 'SmartCaError';
    this.code = code;
    this.codeDesc = codeDesc;
  }
}

/** Ánh xạ lỗi OAuth2 400 -> thông điệp tiếng Việt */
export const SMARTCA_OAUTH_ERROR_VI: Record<string, string> = {
  invalid_client: 'Sai thông tin App client (client_id / client_secret không đúng)',
  invalid_grant: 'Sai thông tin tài khoản SmartCA (username hoặc password)',
  invalid_scope: 'Scope API không hợp lệ - cần phạm vi "sign offline_access"',
};

// ------------------------------------------------------------
// Kết quả ký ứng dụng (đính kèm hồ sơ khi gửi Cổng BHXH)
// ------------------------------------------------------------

export interface SmartCaSignatureResult {
  tranId: string;
  credentialId: string;
  serialNumber: string;
  subjectDN: string;
  signedAt: string; // ISO 8601
  signatures: Array<{ name: string; sig: string }>;
}

// ------------------------------------------------------------
// Client interface dùng chung cho Mock & Real (facade điều phối)
// ------------------------------------------------------------

export interface SmartCaClient {
  login(username: string, password: string): Promise<SmartCaTokenPair>;
  refresh(refreshToken: string): Promise<SmartCaTokenPair>;
  getUserInfo(accessToken: string): Promise<SmartCaUserInfo>;
  listCredentials(accessToken: string): Promise<string[]>;
  getCredentialInfo(
    accessToken: string,
    credentialId: string,
  ): Promise<SmartCaCredential>;
  signHash(
    accessToken: string,
    request: SmartCaSignHashRequest,
  ): Promise<SmartCaSignResponse>;
  getTransactionInfo(
    accessToken: string,
    tranId: string,
  ): Promise<SmartCaTransactionInfo>;
}

// ------------------------------------------------------------
// Ký Số Theo Chức Danh / Từng Thành Viên Đơn Vị (Cách 2)
// ------------------------------------------------------------

export type SignerRole =
  | 'BAC_SI'
  | 'NGUOI_LAP'
  | 'TRUONG_KHOA'
  | 'THU_TRUONG'
  | 'DON_VI';

export interface SignerProfile {
  id: string;
  name: string;
  role: SignerRole;
  roleTitle: string; // "Bác sĩ điều trị", "Kế toán viện phí", "Giám đốc phòng khám", "Chữ ký đơn vị"
  cchn?: string; // Mã chứng chỉ hành nghề (nếu là bác sĩ)
  cccd: string; // Số CCCD / Định danh nhận SmartCA
  phone: string; // Số điện thoại nhận OTP / Push App SmartCA
  mst?: string; // Mã số thuế (nếu ký với tư cách Đơn vị / Cơ sở KCB / Doanh nghiệp)
  email?: string;
  department?: string; // Khoa / Phòng ban
  subjectDN: string;
  serialNumber: string;
}

export const DEFAULT_CLINIC_SIGNERS: SignerProfile[] = [
  {
    id: 'signer-bs-01',
    name: 'BS.CKI Nguyễn Văn An',
    role: 'BAC_SI',
    roleTitle: 'Bác sĩ điều trị',
    cchn: '012345/HCM-CCHN',
    cccd: '079085012345',
    phone: '0901234567',
    department: 'Khoa Khám Bệnh',
    subjectDN:
      'CN=BS.CKI NGUYỄN VĂN AN, TITLE=Bác sĩ điều trị, CCHN=012345/HCM-CCHN, O=PHÒNG KHÁM ĐA KHOA QUỐC TẾ, C=VN',
    serialNumber: 'BS01_SMARTCA_079085012345',
  },
  {
    id: 'signer-bs-02',
    name: 'BS. Trần Thị Mai',
    role: 'BAC_SI',
    roleTitle: 'Bác sĩ khám bệnh',
    cchn: '014568/HCM-CCHN',
    cccd: '079190045678',
    phone: '0912345678',
    department: 'Khoa Nội Tổng Hợp',
    subjectDN:
      'CN=BS. TRẦN THỊ MAI, TITLE=Bác sĩ khám bệnh, CCHN=014568/HCM-CCHN, O=PHÒNG KHÁM ĐA KHOA QUỐC TẾ, C=VN',
    serialNumber: 'BS02_SMARTCA_079190045678',
  },
  {
    id: 'signer-kt-01',
    name: 'Trần Thị Thu Thảo',
    role: 'NGUOI_LAP',
    roleTitle: 'Kế toán / Người lập bảng kê',
    cccd: '079192087654',
    phone: '0934567890',
    department: 'Phòng Tài Chính - Kế Toán',
    subjectDN:
      'CN=TRẦN THỊ THU THẢO, TITLE=Kế toán viện phí, O=PHÒNG KHÁM ĐA KHOA QUỐC TẾ, C=VN',
    serialNumber: 'KT01_SMARTCA_079192087654',
  },
  {
    id: 'signer-gd-01',
    name: 'TS.BS Lê Hoàng Nam',
    role: 'THU_TRUONG',
    roleTitle: 'Giám đốc phòng khám (Thủ trưởng)',
    cchn: '001988/BYT-CCHN',
    cccd: '079075001988',
    phone: '0988776655',
    department: 'Ban Giám Đốc',
    subjectDN:
      'CN=TS.BS LÊ HOÀNG NAM, TITLE=Giám đốc, CCHN=001988/BYT-CCHN, O=PHÒNG KHÁM ĐA KHOA QUỐC TẾ, C=VN',
    serialNumber: 'GD01_SMARTCA_079075001988',
  },
  {
    id: 'signer-dv-01',
    name: 'PHÒNG KHÁM ĐA KHOA QUỐC TẾ',
    role: 'DON_VI',
    roleTitle: 'Chữ ký số Cơ sở KCB (Đơn vị)',
    mst: '4001266514',
    cccd: '4001266514',
    phone: '02838123456',
    department: 'Ban Quản Lý',
    subjectDN:
      'CN=CÔNG TY CP ĐẦU TƯ FQ VIỆT NAM, OID.0.9.2342.19200300.100.1.1=MST:4001266514, C=VN',
    serialNumber: '4001266514_SMARTCA_2026',
  },
];

