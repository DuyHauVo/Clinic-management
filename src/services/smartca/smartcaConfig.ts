// ============================================================
// CONFIG - Cấu hình kết nối SmartCA (phi nhạy cảm, localStorage
// có version + try/catch theo chuẩn client-localstorage-schema)
// ============================================================

import type { SmartCaEnv } from "../../types/smartcaTypes";

export const SMARTCA_STORAGE_KEY = "smartca-config:v1";

export interface SmartCaPersistentConfig {
  env: SmartCaEnv;
  /** Client ID do VNPT cấp khi đăng ký dịch vụ (không phải mật khẩu) */
  clientId: string;
  /** Username đăng nhập SmartCA (CCCD) - không lưu password/client_secret */
  username: string;
}

// Nạp các giá trị cấu hình tập trung từ biến môi trường (.env)
export const SMARTCA_ENV: SmartCaEnv =
  (import.meta.env.VITE_SMARTCA_ENV as SmartCaEnv) || "mock";
export const SMARTCA_CLIENT_ID: string =
  (import.meta.env.VITE_SMARTCA_CLIENT_ID as string) || "";
export const SMARTCA_CLIENT_SECRET: string =
  (import.meta.env.VITE_SMARTCA_CLIENT_SECRET as string) || "";
export const SMARTCA_DEFAULT_CCCD: string =
  (import.meta.env.VITE_SMARTCA_DEFAULT_CCCD as string) || "";

export const SMARTCA_DEFAULT_CONFIG: SmartCaPersistentConfig = {
  env: SMARTCA_ENV,
  clientId: SMARTCA_CLIENT_ID,
  username: SMARTCA_DEFAULT_CCCD,
};

/**
 * Trả về cấu hình từ biến môi trường (.env) và tự động dọn dẹp dữ liệu cũ trong localStorage nếu có
 */
export function loadSmartCaConfig(): SmartCaPersistentConfig {
  try {
    localStorage.removeItem(SMARTCA_STORAGE_KEY);
  } catch {
    // bỏ qua nếu storage disabled
  }
  return SMARTCA_DEFAULT_CONFIG;
}
