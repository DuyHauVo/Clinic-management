import * as XLSX from 'xlsx';
import type { GatewaySendResult } from '../shared/excelXmlShared';

export interface DmTbytThdvItem {
  id?: string;
  stt: number; // 1. STT (Số, 10): Số thứ tự
  tenTb: string; // 2. TEN_TB (Chuỗi, n): Tên thiết bị y tế (*)
  kyHieu?: string; // 3. KY_HIEU (Chuỗi, 1024): Model / Ký hiệu của TBYT
  congTySx?: string; // 4. CONGTY_SX (Chuỗi, 1024): Tên công ty sản xuất
  nuocSx?: string; // 5. NUOC_SX (Chuỗi, 100): Tên nước sản xuất
  namSx?: number; // 6. NAM_SX (Số, 4): Năm sản xuất
  namSd?: number; // 7. NAM_SD (Số, 4): Năm bắt đầu đưa vào sử dụng
  maMay: string; // 8. MA_MAY (Chuỗi, n): Mã máy thực hiện DV CLS, phẫu thuật, thủ thuật theo QĐ 3176/QĐ-BYT (*)
  soLuuHanh?: string; // 9. SO_LUU_HANH (Chuỗi, 20): Số lưu hành của TBYT theo Nghị định 07/2025/NĐ-CP
  hdTu?: string; // 10. HD_TU (Chuỗi, 8): Thời điểm hiệu lực trên hợp đồng thuê/mượn (YYYYMMDD)
  hdDen?: string; // 11. HD_DEN (Chuỗi, 8): Thời điểm hết hiệu lực trên hợp đồng thuê/mượn (YYYYMMDD)
  tuNgay: string; // 12. TU_NGAY (Chuỗi, 8): Thời điểm bắt đầu áp dụng (YYYYMMDD) (*)
  denNgay?: string; // 13. DEN_NGAY (Chuỗi, 8): Thời điểm ngừng áp dụng / hết hiệu lực kiểm định (YYYYMMDD)
  maCskcb: string; // 14. MA_CSKCB (Chuỗi, 5): Mã cơ sở KCB (*)
  isValid?: boolean;
  errors?: string[];
}

export interface TbytThdvSchemaField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date';
  required: boolean;
  desc: string;
  aliases: string[];
  example?: string;
}

export interface ParseTbytThdvExcelResult {
  items: DmTbytThdvItem[];
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

export type SendTbytThdvGatewayResult = GatewaySendResult;
