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
  ENV: (import.meta.env.VITE_BHXH_ENV || 'sandbox') as BhxhEnv,
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
   * 1. API Lấy Token xác thực Cổng BHXH
   */
  static async takeToken(
    req?: Partial<BhxhTokenRequest>,
    env: BhxhEnv = BHXH_CONFIG.ENV
  ): Promise<BhxhTokenResponse> {
    if (env === 'sandbox') {
      await new Promise(r => setTimeout(r, 600));
      const mockToken = `bhxh_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        maKetQua: '200',
        apiToken: mockToken,
        thongDiep: 'Lấy token kết nối Cổng BHXH thành công (Sandbox/Thử nghiệm)',
      };
    }

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

      const response = await fetch(`${BHXH_CONFIG.BASE_URL}${BHXH_CONFIG.ENDPOINTS.TAKE_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data: BhxhTokenResponse = await response.json();
      return data;
    } catch (err: any) {
      console.error('Lỗi takeToken BHXH:', err);
      return {
        maKetQua: '500',
        thongDiep: err.message || 'Không thể kết nối đến máy chủ Cổng BHXH Việt Nam',
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
    if (env === 'sandbox') {
      await new Promise(r => setTimeout(r, 1000));
      const isSuccess = req.fileBase64Str.length > 0;
      const maGiaoDich = `GD_TT25_${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}_${Math.floor(Math.random() * 9000 + 1000)}`;

      if (!isSuccess) {
        return {
          maKetQua: '400',
          ghiChu: 'Nội dung fileBase64Str rỗng',
        };
      }

      return {
        maKetQua: '200',
        maGiaoDich,
        ghiChu: 'Hồ sơ chứng từ TT25/2025/TT-BYT đã được tiếp nhận thành công vào hệ thống BHXH (Sandbox/Thử nghiệm)',
      };
    }

    try {
      const params = new URLSearchParams();
      params.append('token', req.token);
      params.append('loaiHs', req.loaiHs || '39');
      params.append('fileBase64Str', req.fileBase64Str);

      const response = await fetch(
        `${BHXH_CONFIG.BASE_URL}${BHXH_CONFIG.ENDPOINTS.GUI_HO_SO_CHUNG_TU_2025}`,
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
    } catch (err: any) {
      console.error('Lỗi guiHoSoChungTu2025:', err);
      return {
        maKetQua: '500',
        ghiChu: err.message || 'Lỗi truyền nhận dữ liệu Cổng BHXH',
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
    if (env === 'sandbox') {
      await new Promise(r => setTimeout(r, 1000));
      const maGiaoDich = `GD_GT_${req.loaiHs}_${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}`;

      return {
        maKetQua: '200',
        maGiaoDich,
        ghiChu: `Giấy tờ điện tử mã [${req.loaiHs}] đã được tiếp nhận thành công vào Hệ thống Sức khỏe BHXH (Sandbox/Thử nghiệm)`,
      };
    }

    try {
      const params = new URLSearchParams();
      params.append('token', req.token);
      params.append('loaiHs', req.loaiHs);
      params.append('fileBase64Str', req.fileBase64Str);

      const response = await fetch(
        `${BHXH_CONFIG.BASE_URL}${BHXH_CONFIG.ENDPOINTS.GUI_GIAY_TO_DIEN_TU}`,
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
    } catch (err: any) {
      console.error('Lỗi guiGiayToDienTu:', err);
      return {
        maKetQua: '500',
        ghiChu: err.message || 'Lỗi truyền nhận dữ liệu Giấy tờ điện tử Cổng BHXH',
      };
    }
  }
}
