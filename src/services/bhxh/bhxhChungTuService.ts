import type {
  BhxhTokenRequest,
  BhxhTokenResponse,
  BhxhSendChungTuRequest,
  BhxhSendChungTuResponse,
  BhxhSendGiayToDienTuRequest,
  BhxhSendGiayToDienTuResponse,
} from '../../types/tt25ChungTuTypes';

export type BhxhEnv = 'sandbox' | 'production';

// Config endpoints theo Phụ lục 02 (2025) & biến môi trường .env
export const BHXH_CONFIG = {
  ENV: (import.meta.env.VITE_BHXH_ENV || 'production') as BhxhEnv,
  BASE_URL: import.meta.env.VITE_BHXH_BASE_URL || 'https://egw.baohiemxahoi.gov.vn',
  USERNAME: import.meta.env.VITE_BHXH_USERNAME || '',
  PASSWORD: import.meta.env.VITE_BHXH_PASSWORD || '',
  ENDPOINTS: {
    TAKE_TOKEN: '/api/token/take',
    GUI_HO_SO_CHUNG_TU_2025: '/api/chungtugw/GuiHoSoChungTu2025', // Mã 39
    GUI_GIAY_TO_DIEN_TU: '/api/hososuckhoe/guiGiayToDienTu',       // Mã 60, 61
  },
};

export class BhxhChungTuService {
  /**
   * Xác định URL cổng BHXH dựa trên môi trường được yêu cầu:
   * - Nếu cấu hình VITE_BHXH_BASE_URL (proxy hoặc URL tùy chỉnh) thì ưu tiên sử dụng
   * - Ngược lại: 'sandbox' -> Cổng Test (https://gdbhyt.baohiemxahoi.gov.vn), 'production' -> Cổng Thật (https://egw.baohiemxahoi.gov.vn)
   */
  static getBaseUrl(env?: BhxhEnv): string {
    const targetEnv = env || BHXH_CONFIG.ENV;
    if (import.meta.env.VITE_BHXH_BASE_URL) {
      return import.meta.env.VITE_BHXH_BASE_URL;
    }
    return targetEnv === 'sandbox'
      ? 'https://gdbhyt.baohiemxahoi.gov.vn'
      : 'https://egw.baohiemxahoi.gov.vn';
  }

  /**
   * 1. API Lấy Token xác thực Cổng BHXH
   */
  static async takeToken(
    req?: Partial<BhxhTokenRequest>,
    env: BhxhEnv = BHXH_CONFIG.ENV
  ): Promise<BhxhTokenResponse> {
    try {
      const username = req?.username || BHXH_CONFIG.USERNAME;
      const password = req?.password || BHXH_CONFIG.PASSWORD;

      if (!username || !password) {
        return {
          maKetQua: '401',
          thongDiep: 'Chưa cấu hình VITE_BHXH_USERNAME hoặc VITE_BHXH_PASSWORD trong file .env',
        };
      }

      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const baseUrl = BhxhChungTuService.getBaseUrl(env);
      const response = await fetch(`${baseUrl}${BHXH_CONFIG.ENDPOINTS.TAKE_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data: BhxhTokenResponse = await response.json();
      return data;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ Cổng BHXH Việt Nam';
      console.error('Lỗi takeToken BHXH:', err);
      return {
        maKetQua: '500',
        thongDiep: errorMsg,
      };
    }
  }

  /**
   * 2. API Gửi Hồ Sơ Chứng Từ TT25 (Loại 39 - HSCHUNGTU)
   */
  static async guiHoSoChungTu2025(
    req: BhxhSendChungTuRequest,
    env: BhxhEnv = BHXH_CONFIG.ENV
  ): Promise<BhxhSendChungTuResponse> {
    try {
      if (!req.fileBase64Str) {
        return {
          maKetQua: '400',
          ghiChu: 'Nội dung tệp gửi lên (fileBase64Str) rỗng',
        };
      }

      const params = new URLSearchParams();
      params.append('token', req.token);
      params.append('loaiHs', req.loaiHs || '39');
      params.append('fileBase64Str', req.fileBase64Str);

      const baseUrl = BhxhChungTuService.getBaseUrl(env);
      const response = await fetch(
        `${baseUrl}${BHXH_CONFIG.ENDPOINTS.GUI_HO_SO_CHUNG_TU_2025}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      const data: BhxhSendChungTuResponse = await response.json();
      return data;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi truyền nhận dữ liệu Cổng BHXH';
      console.error('Lỗi guiHoSoChungTu2025:', err);
      return {
        maKetQua: '500',
        ghiChu: errorMsg,
      };
    }
  }

  /**
   * 3. API Gửi Giấy Tờ Điện Tử (Loại 60 - Giấy Báo Tử, Loại 61 - Giấy Chứng Sinh)
   */
  static async guiGiayToDienTu(
    req: BhxhSendGiayToDienTuRequest,
    env: BhxhEnv = BHXH_CONFIG.ENV
  ): Promise<BhxhSendGiayToDienTuResponse> {
    try {
      if (!req.fileBase64Str) {
        return {
          maKetQua: '400',
          ghiChu: 'Nội dung tệp gửi lên (fileBase64Str) rỗng',
        };
      }

      const params = new URLSearchParams();
      params.append('token', req.token);
      params.append('loaiHs', req.loaiHs);
      params.append('fileBase64Str', req.fileBase64Str);

      const baseUrl = BhxhChungTuService.getBaseUrl(env);
      const response = await fetch(
        `${baseUrl}${BHXH_CONFIG.ENDPOINTS.GUI_GIAY_TO_DIEN_TU}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      const data: BhxhSendGiayToDienTuResponse = await response.json();
      return data;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi truyền nhận dữ liệu Giấy tờ điện tử Cổng BHXH';
      console.error('Lỗi guiGiayToDienTu:', err);
      return {
        maKetQua: '500',
        ghiChu: errorMsg,
      };
    }
  }
}
