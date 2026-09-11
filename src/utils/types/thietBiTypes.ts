import * as XLSX from 'xlsx';
import type { GatewaySendResult } from '../shared/excelXmlShared';

export interface DmThietBiItem {
  id?: string;
  stt: number;
  maVatTu: string; // 50: Mã theo danh mục dùng chung BYT (TT 04/2017 & 24/2025)
  nhomVatTu: string; // 1024: Tên nhóm thiết bị y tế theo TT 04/2017 & TT 24/2025
  tenVatTu: string; // n: Tên thương mại ghi theo QĐ trúng thầu / mua sắm
  maHieu?: string; // 1024: Mã hiệu ghi theo QĐ 3176/QĐ-BYT
  soLuuHanh?: string; // 20: Số lưu hành của TBYT theo NĐ 07/2025/NĐ-CP
  tinhnangKt?: string; // n: Cấu hình, tính năng kỹ thuật cơ bản
  quyCach?: string; // 1024: Quy cách đóng gói
  hangSx?: string; // 1024: Tên hãng sản xuất
  nuocSx?: string; // 100: Tên nước sản xuất
  donViTinh: string; // 50: Đơn vị tính
  donGia: number; // 10: Đơn giá kết quả trúng thầu / tự SX phê duyệt
  donGiaBh: number; // 10: Đơn giá thanh toán BHYT theo QĐ 3176
  tyleTtBh: number; // 3: Tỷ lệ TT BHYT (0-100, default 100)
  soLuong: number; // 10: Số lượng theo kết quả trúng thầu / mua sắm
  dinhMuc?: number; // 4: Số lần sử dụng của TBYT tái sử dụng (nếu có)
  nhaThau?: string; // 1024: Tên nhà thầu / đơn vị cung ứng
  ttThau?: string; // 50: Thông tin thầu theo QĐ 3176 (vd: 456/XXXX;G1;N1;2023)
  tuNgayHd?: string; // 8: YYYYMMDD
  denNgayHd?: string; // 8: YYYYMMDD
  maCskcb: string; // 5: Mã cơ sở KCB
  loaiThau: number; // 2: 1..7
  htThau?: number; // 2: 1..9 (nếu loaiThau = 3,4,5,7 thì để trống)
  maCskcbTbyt?: string; // 5: C.XXXXX nếu là điều chuyển
  tuNgay: string; // 8: YYYYMMDD
  denNgay?: string; // 8: YYYYMMDD (để trống nếu đang áp dụng)
  isValid?: boolean;
  errors?: string[];
}

export interface ThietBiValidationInput {
  maVatTu?: string;
  nhomVatTu?: string;
  tenVatTu?: string;
  donViTinh?: string;
  donGia?: number;
  donGiaBh?: number;
  rawTuNgay?: unknown;
  parsedTuNgay?: string;
}

export interface ThietBiSchemaField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date';
  required: boolean;
  desc: string;
  aliases: string[];
  example?: string;
}

export interface ParseThietBiExcelResult {
  items: DmThietBiItem[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  detectedHeaders: { [colIndex: number]: string };
  missingRequiredFields: string[];
  availableSheets: string[];
  selectedSheet: string;
  fileName: string;
  workbook?: XLSX.WorkBook;
}

export type SendThietBiGatewayResult = GatewaySendResult;
