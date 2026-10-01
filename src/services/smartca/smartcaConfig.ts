import type { SmartCaEnv } from "../../types/smartcaTypes";

export const SMARTCA_STORAGE_KEY = "smartca-config:v1";

export interface SmartCaPersistentConfig {
  env: SmartCaEnv;
  clientId: string;
  username: string;
}

// Nạp các giá trị cấu hình tập trung từ biến môi trường (.env)
export const SMARTCA_ENV: SmartCaEnv =
  (import.meta.env.VITE_SMARTCA_ENV as SmartCaEnv) || "production";
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

export function loadSmartCaConfig(): SmartCaPersistentConfig {
  try {
    localStorage.removeItem(SMARTCA_STORAGE_KEY);
  } catch {
    // bỏ qua nếu storage disabled
  }
  return SMARTCA_DEFAULT_CONFIG;
}
