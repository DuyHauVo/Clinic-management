import * as XLSX from 'xlsx';
import type { GatewaySendResult } from '../shared/excelXmlShared';

export interface DmThuocPxItem {
  id?: string;
  stt: number;
  maThuoc: string; // 15: Mã thuốc phóng xạ hoặc chất đánh dấu
  tenThuoc: string; // 1024: Tên thuốc phóng xạ hoặc chất đánh dấu
  soDangKy?: string; // 50: Số đăng ký / Số GPNK
  donViTinh?: string; // 1024: Đơn vị tính
  ttThau?: string; // 1024: Thông tin thầu theo QĐ 3176
  donGiaThuoc: number; // 15: Đơn giá thuốc phóng xạ / chất đánh dấu
  dmNsxCdD?: number; // 15: Định mức NSX của chất đánh dấu
  dmThucTeCdD?: number; // 15: Định mức thực tế bình quân chất đánh dấu
  lieuBqPx?: number; // 8: Liều bình quân thuốc phóng xạ
  tlThucTeBqPx?: number; // 15: Tỷ lệ thực tế bình quân thuốc phóng xạ
  thanhTienThuoc: number; // 15: Thành tiền tính theo công thức BYT
}

export interface DmDichVuItem {
  id?: string;
  stt: number;
  maDichVu: string; // 20: Mã dịch vụ KBCB theo QĐ 3176/QĐ-BYT
  tenDichVu: string; // n: Tên DVKT / Giường / Khám theo DM dùng chung BYT
  tenDvktGia: string; // n: Tên DV phê duyệt giá (có thể có [gây tê] hoặc mô tả trong [ ])
  donGia: number; // 15: Đơn giá KBCB thanh toán BHYT (chưa gồm thuốc PX, chất đánh dấu)
  quyTrinh: string; // 50: YYYYMMDD_Z (QĐ ban hành quy trình CMKT)
  soLuongCgkt?: number; // 4: Số lượng DV thực hiện theo HĐ chuyển giao kỹ thuật
  cskcbCgkt?: string; // 5: Mã CSKCB chuyển giao kỹ thuật nếu có
  cskcbCls?: string; // 5: Mã CSKCB thực hiện CLS nếu chuyển đi
  qdDvkt: string; // 50: YYYYMMDD_Z (QĐ phê duyệt DMKT tại CSKCB)
  qdPdGia: string; // 50: YYYYMMDD_Z (QĐ/Nghị quyết phê duyệt giá)
  ghiChu?: string; // n: Ghi chú theo văn bản phê duyệt giá
  giaThanhToan: number; // 15: Giá TT BHYT = donGia + tổng thanhTienThuoc trong dsThuocPx
  tuNgay: string; // 8: YYYYMMDD
  denNgay?: string; // 8: YYYYMMDD
  maCskcb: string; // 5: Mã cơ sở KCB (vd 01929)
  dsThuocPx?: DmThuocPxItem[]; // Danh sách thuốc phóng xạ & chất đánh dấu
  isValid?: boolean;
  errors?: string[];
}

export interface DichVuSchemaField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date';
  required: boolean;
  desc: string;
  aliases: string[];
  example?: string;
}

export interface ParseDichVuExcelResult {
  items: DmDichVuItem[];
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

export type SendDichVuGatewayResult = GatewaySendResult;
