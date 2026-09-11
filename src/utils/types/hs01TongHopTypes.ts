import type * as XLSX from 'xlsx';

/**
 * Interface 20 trường thông tin chuẩn theo Quyết định BHXH
 * Mục VIII: HỒ SƠ TỔNG HỢP MẪU 01/BH (XML <HSTH01BH> - Loại HS 5)
 */
export interface Hs01TongHopItem {
  id: string;
  stt: number; // 1. STT (Số 10)
  hoTen: string; // 2. HO_TEN (Chuỗi 255)
  ngaySinh: string; // 3. NGAY_SINH (Chuỗi 12 - YYYYMMDDHHmm)
  gioiTinh: string; // 4. GIOI_TINH (1: Nam, 2: Nữ, 3: Chưa xác định)
  maTheBhyt: string; // 5. MA_THE_BHYT (Chuỗi 15)
  maBenhChinh: string; // 6. MA_BENH_CHINH (Chuỗi 7 - ICD-10)
  ngayVao: string; // 7. NGAY_VAO (Chuỗi 12 - YYYYMMDDHHmm)
  ngayVaoNoiTru?: string; // 8. NGAY_VAO_NOI_TRU (Chuỗi 12 hoặc rỗng)
  ngayRa: string; // 9. NGAY_RA (Chuỗi 12 - YYYYMMDDHHmm)
  soNgayDtri: number; // 10. SO_NGAY_DTRI (Chuỗi/Số 3)
  maLoaiKcb: string; // 11. MA_LOAI_KCB (Số 2 - '01', '02', '03', '04', '05'...)
  tTongchiBv: number; // 12. T_TONGCHI_BV (Số 15, 2 số thập phân)
  tTongchiBh: number; // 13. T_TONGCHI_BH (Số 15, 2 số thập phân)
  tBhtt: number; // 14. T_BHTT (Số 15, 2 số thập phân)
  tBncct: number; // 15. T_BNCCT (Số 15, 2 số thập phân)
  tBntt: number; // 16. T_BNTT (Số 15, 2 số thập phân)
  tNguonkhac: number; // 17. T_NGUONKHAC (Số 15, 2 số thập phân)
  maCskcb: string; // 18. MA_CSKCB (Chuỗi 5)
  namQt: number; // 19. NAM_QT (Số 4)
  thangQt: string; // 20. THANG_QT (Số 2 - '01'..'12')

  // Trạng thái đối soát
  isValid?: boolean;
  errors?: string[];
  trangThai?: 'hop_le' | 'canh_bao' | 'da_gui_cong';
}

export type Hs01ValidationInput = Partial<Hs01TongHopItem>;

export interface ParseHs01ExcelResult {
  items: Hs01TongHopItem[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  detectedHeaders: { [colIdx: number]: string };
  missingRequiredFields: string[];
  availableSheets: string[];
  selectedSheet: string;
  fileName: string;
  workbook?: XLSX.WorkBook;
}

export interface SendHs01GatewayResult {
  maKetQua: string;
  maGiaoDich: string;
  thongDiep: string;
  thoiGianTiepNhan: string;
  totalRecords: number;
  kyQT: string;
  loaiHs: string;
}
