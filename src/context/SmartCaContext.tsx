import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  loadSmartCaConfig,
  SMARTCA_DEFAULT_CONFIG,
  type SmartCaPersistentConfig,
} from '../services/smartca/smartcaConfig';
import {
  createSmartCaClient,
  isTokenUsable,
  type SmartCaClientConfig,
} from '../services/smartca/smartcaService';
import type {
  SmartCaClient,
  SmartCaCredential,
  SmartCaTokenPair,
  SmartCaUserInfo,
} from '../types/smartcaTypes';

// ============================================================================
// 1. CẤU HÌNH LƯU TRỮ PHIÊN LÀM VIỆC (DÀNH CHO QUY TRÌNH 1 - Q1)
// ============================================================================
const SMARTCA_SESSION_TOKEN_KEY = 'smartca-session:v1';

interface SmartCaSessionPersisted {
  tokenPair: SmartCaTokenPair;
  uid: string;
}

/**
 * [Q1] Đọc token phiên từ sessionStorage khi F5 / Reload trang web
 */
function loadSession(): SmartCaSessionPersisted | null {
  try {
    const raw = sessionStorage.getItem(SMARTCA_SESSION_TOKEN_KEY);
    return raw ? (JSON.parse(raw) as SmartCaSessionPersisted) : null;
  } catch {
    return null;
  }
}

/**
 * [Q1] Lưu token phiên vào sessionStorage hoặc xóa khi đăng xuất
 */
function saveSession(session: SmartCaSessionPersisted | null): void {
  try {
    if (session) {
      sessionStorage.setItem(SMARTCA_SESSION_TOKEN_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(SMARTCA_SESSION_TOKEN_KEY);
    }
  } catch {
    // sessionStorage disabled - bỏ qua
  }
}

// ============================================================================
// 2. ĐỊNH NGHĨA KIỂU DỮ LIỆU CONTEXT
// ============================================================================
interface SmartCaContextValue {
  // --- [DÙNG CHUNG & HỖ TRỢ Q2 (KÝ NHANH SMART OTP)] ---
  config: SmartCaPersistentConfig; // Cấu hình môi trường (production/demo) nạp từ .env
  client: SmartCaClient;           // Đối tượng Client giao tiếp VNPT SmartCA

  // --- [QUY TRÌNH 1 - Q1 (QUẢN LÝ PHIÊN ĐĂNG NHẬP / ĐĂNG XUẤT LÂU DÀI)] ---
  tokenPair: SmartCaTokenPair | null;
  uid: string | null;
  userInfo: SmartCaUserInfo | null;
  credential: SmartCaCredential | null;
  isLoggedIn: boolean;

  // --- [CÁC HÀM XỬ LÝ QUY TRÌNH 1 (Q1)] ---
  login(password: string): Promise<void>;
  logout(): void;
  getAccessToken(): Promise<string>;

  // --- [CÁC HÀM CÀI ĐẶT CẤU HÌNH (DỰ PHÒNG CHO SETTINGS UI)] ---
  saveConfig(config: SmartCaPersistentConfig, clientSecret?: string): void;
  setClientSecret(secret: string): void;
}

const SmartCaContext = createContext<SmartCaContextValue | null>(null);

// ============================================================================
// 3. PROVIDER QUẢN LÝ TOÀN CỤC (SMART CA PROVIDER)
// ============================================================================
export const SmartCaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --------------------------------------------------------------------------
  // A. STATE DÙNG CHUNG & HỖ TRỢ Q2
  // --------------------------------------------------------------------------
  // Đọc cấu hình từ .env (production / demo, clientId, username)
  const [config, setConfig] = useState<SmartCaPersistentConfig>(loadSmartCaConfig);
  const [clientSecret, setClientSecretState] = useState<string>('');

  // Khởi tạo SmartCA Client dựa trên config môi trường
  const client = useMemo(
    () =>
      createSmartCaClient({
        env: config.env,
        clientId: config.clientId,
        clientSecret,
      }),
    [config, clientSecret],
  );

  // --------------------------------------------------------------------------
  // B. STATE QUY TRÌNH 1 (Q1 - DUY TRÌ PHIÊN ĐĂNG NHẬP)
  // --------------------------------------------------------------------------
  const [tokenPair, setTokenPair] = useState<SmartCaTokenPair | null>(() => {
    const session = loadSession();
    return session && isTokenUsable(session.tokenPair) ? session.tokenPair : null;
  });
  const [uid, setUid] = useState<string | null>(() => loadSession()?.uid ?? null);
  const [userInfo, setUserInfo] = useState<SmartCaUserInfo | null>(null);
  const [credential, setCredential] = useState<SmartCaCredential | null>(null);

  // --------------------------------------------------------------------------
  // C. CÁC HÀM PHỤC VỤ QUY TRÌNH 1 (Q1)
  // --------------------------------------------------------------------------
  const persistSession = useCallback(
    (pair: SmartCaTokenPair | null, userId: string) => {
      setTokenPair(pair);
      setUid(userId);
      saveSession(pair ? { tokenPair: pair, uid: userId } : null);
    },
    [setTokenPair, setUid],
  );

  /**
   * [Q1] Đăng nhập tài khoản SmartCA và lưu phiên làm việc
   */
  const login = useCallback(
    async (password: string) => {
      const pair = await client.login(config.username, password);
      persistSession(pair, config.username);
      // Lấy song song thông tin người dùng và danh sách chứng thư số
      const [info, ids] = await Promise.all([
        client.getUserInfo(pair.accessToken).catch(() => null),
        client.listCredentials(pair.accessToken).catch(() => [] as string[]),
      ]);
      setUserInfo(info);
      if (ids.length > 0) {
        setCredential(await client.getCredentialInfo(pair.accessToken, ids[0]));
      } else {
        setCredential(null);
      }
    },
    [client, config.username, persistSession, setUserInfo, setCredential],
  );

  /**
   * [Q1] Đăng xuất và xóa sạch phiên làm việc trong sessionStorage
   */
  const logout = useCallback(() => {
    persistSession(null, '');
    setUserInfo(null);
    setCredential(null);
  }, [persistSession, setUserInfo, setCredential]);

  /**
   * [Q1] Lấy Access Token hợp lệ, tự động làm mới (refresh) khi hết hạn
   */
  const getAccessToken = useCallback(async (): Promise<string> => {
    if (!tokenPair) {
      throw new Error(
        'Chưa đăng nhập SmartCA - vui lòng đăng nhập trước khi ký',
      );
    }
    if (isTokenUsable(tokenPair)) {
      return tokenPair.accessToken;
    }
    const refreshed = await client.refresh(tokenPair.refreshToken);
    persistSession(refreshed, uid ?? config.username);
    return refreshed.accessToken;
  }, [client, config.username, persistSession, tokenPair, uid]);

  // --------------------------------------------------------------------------
  // D. CÁC HÀM CẤU HÌNH (DỰ PHÒNG CHO SETTINGS UI NẾU CẦN ĐỔI CONFIG THỦ CÔNG)
  // --------------------------------------------------------------------------
  const saveConfig = useCallback(
    (next: SmartCaPersistentConfig, secret?: string) => {
      setConfig(next);
      if (secret !== undefined) {
        setClientSecretState(secret);
      }
      // Đổi môi trường hoặc tài khoản -> tự động đăng xuất phiên cũ
      logout();
    },
    [logout, setConfig, setClientSecretState],
  );

  const setClientSecret = useCallback(
    (secret: string) => {
      setClientSecretState(secret);
    },
    [setClientSecretState],
  );

  // --------------------------------------------------------------------------
  // E. TỔNG HỢP GIÁ TRỊ CUNG CẤP CHO TOÀN BỘ ỨNG DỤNG
  // --------------------------------------------------------------------------
  const value = useMemo<SmartCaContextValue>(
    () => ({
      // Phục vụ chung & Q2:
      config,
      client,

      // Phục vụ Q1:
      tokenPair,
      uid,
      userInfo,
      credential,
      isLoggedIn: tokenPair !== null,
      login,
      logout,
      getAccessToken,

      // Cấu hình dự phòng:
      saveConfig,
      setClientSecret,
    }),
    [
      config,
      client,
      tokenPair,
      uid,
      userInfo,
      credential,
      login,
      logout,
      getAccessToken,
      saveConfig,
      setClientSecret,
    ],
  );

  return <SmartCaContext.Provider value={value}>{children}</SmartCaContext.Provider>;
};

// ============================================================================
// 4. CUSTOM HOOK
// ============================================================================
export function useSmartCa(): SmartCaContextValue {
  const ctx = useContext(SmartCaContext);
  if (!ctx) {
    throw new Error('useSmartCa must be used within a SmartCaProvider');
  }
  return ctx;
}

export { SMARTCA_DEFAULT_CONFIG };
export type { SmartCaClientConfig };
