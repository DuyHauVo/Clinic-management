// ============================================================
// MOCK CLIENT - Mô phỏng VNPT SmartCA cho môi trường demo/hướng dẫn
// Cùng contract với SmartCaHttpClient:
//   login -> token giả + 1 credential mẫu "VNPT SmartCA RS"
//   signHash -> giao dịch 4000 WAITING_FOR_SIGNER_CONFIRM
//   "Giả lập xác nhận OTP" (confirmMockSign) -> 1 SUCCESS với chữ ký giả
//   getTransactionInfo -> 4001 EXPIRED nếu quá 5 phút không xác nhận
// ============================================================

import {
  SmartCaError,
  SMARTCA_TRAN_STATUS,
  type SmartCaTokenPair,
  type SmartCaUserInfo,
  type SmartCaCredential,
  type SmartCaSignHashRequest,
  type SmartCaSignResponse,
  type SmartCaTransactionInfo,
  type SmartCaClient,
} from '../../types/smartcaTypes';

const MOCK_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 giờ
const MOCK_EXPIRY_AFTER_MS = 5 * 60 * 1000; // hết hạn sau 5 phút như SmartCA thật
const MOCK_CONFIRM_POLL_LATENCY_MS = 1200; // giả lập độ trễ poll

/** Giao dịch mock đang chờ xác nhận: tranId -> thông tin trạng thái */
interface MockTransaction {
  tranId: string;
  credentialId: string;
  documents: Array<{ name: string; hash: string }>;
  status: number;
  createdAt: number;
  confirmedAt?: number;
  signatures: string[];
}

export class MockSmartCaClient implements SmartCaClient {
  /** module-level mutable state: chỉ tồn tại trong phiên mock, không serialize */
  private static transactions = new Map<string, MockTransaction>();
  private static tokenToUid = new Map<string, string>();
  private static credentialId: string;

  private static makeToken(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }

  private static uidFromToken(accessToken: string): string {
    const uid = MockSmartCaClient.tokenToUid.get(accessToken);
    if (!uid) {
      throw new SmartCaError(
        'Phiên SmartCA mock đã hết hạn - vui lòng đăng nhập lại',
        401,
        'TOKEN_INVALID',
      );
    }
    return uid;
  }

  private static credential(): SmartCaCredential {
    return {
      credentialId: MockSmartCaClient.credentialId,
      key: { status: 'ENABLED', alg: ['1.2.840.113549.1.1.1'], len: 2048 },
      cert: {
        status: 'VALID',
        serialNumber: '54010101C89F68327FBA49DC613ECE93',
        subjectDN:
          'C=VN,ST=Quảng Nam,L=Huyện Bắc Trà My,CN=Bùi Sỹ Tuấn,UID=CCCD:038093015572',
        issuerDN: 'C=VN,O=VIETNAM POSTS AND TELECOMMUNICATIONS GROUP,CN=VNPT SmartCA RS',
        certificates: ['MIIFODCCBCCgAwIBAgIQVAEBAcifaD...'],
        validFrom: '20260101000000Z',
        validTo: '20261231235959Z',
      },
      authMode: 'oauth2password',
      scal: 'SCAL2',
      multisign: 1,
      status: 'VALID',
      signType: 0,
      defaultServicePackId: 'mock-pack-01',
      servicePacks: [
        {
          servicePackId: 'mock-pack-01',
          name: 'Gói lượt ký cá nhân demo (Mock)',
          type: 0,
          status: 0,
        },
      ],
    };
  }

  async login(username: string, password: string): Promise<SmartCaTokenPair> {
    if (!username.trim() || !password.trim()) {
      throw new SmartCaError(
        'Sai thông tin tài khoản SmartCA (username hoặc password)',
        'invalid_grant',
      );
    }
    const accessToken = MockSmartCaClient.makeToken('mock_access');
    const refreshToken = MockSmartCaClient.makeToken('mock_refresh');
    MockSmartCaClient.tokenToUid.set(accessToken, username.trim());
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: Date.now() + MOCK_TOKEN_TTL_MS,
    };
  }

  async refresh(refreshToken: string): Promise<SmartCaTokenPair> {
    if (!refreshToken.startsWith('mock_refresh_')) {
      throw new SmartCaError(
        'Sai thông tin App client (client_id / client_secret không đúng)',
        'invalid_client',
      );
    }
    return {
      accessToken: MockSmartCaClient.makeToken('mock_access'),
      refreshToken: MockSmartCaClient.makeToken('mock_refresh'),
      accessTokenExpiresAt: Date.now() + MOCK_TOKEN_TTL_MS,
    };
  }

  async getUserInfo(accessToken: string): Promise<SmartCaUserInfo> {
    const uid = MockSmartCaClient.uidFromToken(accessToken);
    return {
      accType: 0,
      uid,
      email: `${uid}@smartca-demo.vn`,
      phone: '0947156062',
    };
  }

  async listCredentials(): Promise<string[]> {
    MockSmartCaClient.credentialId ||= '5d5c0a0f-59b8-498c-9e8e-c3e9b8f1e718';
    return [MockSmartCaClient.credentialId];
  }

  async getCredentialInfo(
    _accessToken: string,
    credentialId: string,
  ): Promise<SmartCaCredential> {
    MockSmartCaClient.credentialId ||= credentialId || '5d5c0a0f-59b8-498c-9e8e-c3e9b8f1e718';
    return MockSmartCaClient.credential();
  }

  async signHash(
    accessToken: string,
    request: SmartCaSignHashRequest,
  ): Promise<SmartCaSignResponse> {
    MockSmartCaClient.uidFromToken(accessToken);
    const tranId = `mock-tran-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    MockSmartCaClient.transactions.set(tranId, {
      tranId,
      credentialId: request.credentialId,
      documents: request.datas.map((d) => ({ name: d.name, hash: d.hash })),
      status: SMARTCA_TRAN_STATUS.WAITING_FOR_SIGNER_CONFIRM,
      createdAt: Date.now(),
      signatures: [],
    });
    return { tranId };
  }

  async getTransactionInfo(
    accessToken: string,
    tranId: string,
  ): Promise<SmartCaTransactionInfo> {
    MockSmartCaClient.uidFromToken(accessToken);
    const tran = MockSmartCaClient.transactions.get(tranId);
    if (!tran) {
      throw new SmartCaError(
        'Không tồn tại giao dịch ký số đang tìm kiếm trên hệ thống',
        64000,
        'SIGNATURE_TRANSACTION_NOT_FOUND',
      );
    }
    // Hết hạn 5 phút nếu chưa xác nhận (4001) - như SmartCA thật
    if (
      tran.status === SMARTCA_TRAN_STATUS.WAITING_FOR_SIGNER_CONFIRM &&
      Date.now() - tran.createdAt > MOCK_EXPIRY_AFTER_MS
    ) {
      tran.status = SMARTCA_TRAN_STATUS.EXPIRED;
    }
    return {
      refTranId: undefined,
      documents: tran.documents.map((d, i) => ({
        name: d.name,
        type: 'xml',
        size: `${Math.max(1, Math.round(d.hash.length * 0.75 / 1024))}KB`,
        hash: d.hash,
        data: d.hash,
        sig: tran.signatures[i] ?? null,
        dataSigned: tran.signatures[i] ?? null,
        url: null,
      })),
      tranId: tran.tranId,
      sub: 'mock-sub-879f198d',
      credentialId: tran.credentialId,
      tranType: 3,
      tranTypeDesc: 'SIGNHASH',
      tranStatus: tran.status,
      tranStatusDesc:
        tran.status === SMARTCA_TRAN_STATUS.SUCCESS
          ? 'SUCCESS'
          : tran.status === SMARTCA_TRAN_STATUS.EXPIRED
            ? 'EXPIRED'
            : 'WAITING_FOR_SIGNER_CONFIRM',
      reqTime: new Date(tran.createdAt).toISOString(),
    };
  }

  /**
   * Nút "Giả lập xác nhận OTP" ở giao diện mock:
   * mô phỏng người dùng mở app SmartCA -> nhập PIN/OTP -> xác nhận ký.
   * Latency nhỏ để trạng thái 4000 kịp hiển thị trên timeline.
   */
  async confirmMockSign(tranId: string): Promise<void> {
    await new Promise((r) => setTimeout(r, MOCK_CONFIRM_POLL_LATENCY_MS));
    const tran = MockSmartCaClient.transactions.get(tranId);
    if (!tran) {
      throw new SmartCaError(
        'Không tồn tại giao dịch ký số đang tìm kiếm trên hệ thống',
        64000,
        'SIGNATURE_TRANSACTION_NOT_FOUND',
      );
    }
    if (
      Date.now() - tran.createdAt > MOCK_EXPIRY_AFTER_MS &&
      tran.status === SMARTCA_TRAN_STATUS.WAITING_FOR_SIGNER_CONFIRM
    ) {
      tran.status = SMARTCA_TRAN_STATUS.EXPIRED;
      throw new SmartCaError('Giao dịch đã hết hạn', 4001, 'EXPIRED');
    }
    tran.status = SMARTCA_TRAN_STATUS.SUCCESS;
    tran.confirmedAt = Date.now();
    tran.signatures = tran.documents.map(
      () =>
        'roeBokGItwTuObPRrnZkmvu8vpTLzLMz7Vx01nlHcKCn+bTElXK0KM7PixT17kScDy4hD2agfoDjzNb1AZ+LiYBBgni01JPpTIRcTmpQJmSYcZKbO0dVSuY4FLg9bGHWkGAsTj7nN0HbxUMfuEui4vBGrW0N0G54hEHOboPpz44DIRkyS5cKiRWcMiMuZTAZHjtOS6tB0HK6RW8okkVKHn/IGX97fnXyJ4J40BoDicolX7oR1okb+K7bUGqYUDwpGehqcCAzIHUCJVZQ0BaFn7eNa0MYuH98H7+Phzv6tmL7SJaFACY+qGXm+247c1KXF+a4WVJaZI/NvToc1k0iHQ==',
    );
  }

  /** Đưa giao dịch về trạng thái từ chối (kịch bản kiểm thử 4002) */
  async rejectMockSign(tranId: string): Promise<void> {
    const tran = MockSmartCaClient.transactions.get(tranId);
    if (tran) {
      tran.status = SMARTCA_TRAN_STATUS.SIGNER_REJECTED;
    }
  }

  static reset(): void {
    MockSmartCaClient.transactions.clear();
    MockSmartCaClient.tokenToUid.clear();
  }
}
