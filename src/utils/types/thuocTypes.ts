import type * as XLSX from 'xlsx';

/**
 * 03/DM: Danh Mục Thuốc, Máu, Chế Phẩm Máu BHYT (Loại hồ sơ 10)
 * Quyết định 130/QĐ-BYT & Quyết định 3176/QĐ-BYT
 */
export interface DmThuocItem {
  id: string;
  stt: number; // 1. STT
  maThuoc: string; // 2. MA_THUOC (bắt buộc) - Mã thuốc theo QĐ 3176
  tenHoatChat?: string; // 3. TEN_HOAT_CHAT - Tên hoạt chất/thành phần
  tenThuoc: string; // 4. TEN_THUOC (bắt buộc) - Tên thương mại/chế phẩm
  donViTinh: string; // 5. DON_VI_TINH (bắt buộc) - Viên, Lọ, Gói, Chai, Túi...
  hamLuong?: string; // 6. HAM_LUONG - Hàm lượng/thể tích thực
  duongDung: string; // 7. DUONG_DUNG - Đường dùng (Uống, Tiêm, Bôi...)
  maDuongDung: string; // 8. MA_DUONG_DUNG (bắt buộc) - Mã đường dùng Bộ Y Tế (1.01, 2.01...)
  dangBaoChe?: string; // 9. DANG_BAO_CHE - Viên nén, Dung dịch tiêm...
  soDangKy: string; // 10. SO_DANG_KY (bắt buộc) - Số ĐK hoặc GPNK
  soLuong?: number; // 11. SO_LUONG - Số lượng trúng thầu
  donGia: number; // 12. DON_GIA (bắt buộc) - Đơn giá trúng thầu
  donGiaBh: number; // 13. DON_GIA_BH (bắt buộc) - Đơn giá BHYT thanh toán
  quyCach?: string; // 14. QUY_CACH - Hộp 10 vỉ x 10 viên...
  nhaSx?: string; // 15. NHA_SX - Nhà sản xuất
  nuocSx?: string; // 16. NUOC_SX - Nước sản xuất
  nhaThau?: string; // 17. NHA_THAU - Nhà thầu/Đơn vị cung ứng
  ttThau?: string; // 18. TT_THAU - Thông tin gói thầu
  tuNgayHd?: string; // 19. TU_NGAY_HD - Ngày hiệu lực HĐ (YYYYMMDD)
  denNgayHd?: string; // 20. DEN_NGAY_HD - Ngày hết hạn HĐ (YYYYMMDD)
  maCskcb: string; // 21. MA_CSKCB (bắt buộc) - Mã cơ sở KCB (vd: 01929)
  loaiThuoc: number; // 22. LOAI_THUOC (bắt buộc) - 1..10 (1: Tân dược, 2: Chế phẩm, 3: Vị thuốc, 9: Máu, 10: Chế phẩm máu...)
  loaiThau?: number; // 23. LOAI_THAU - 1..7 (1: Thầu tập trung, 2: Thầu riêng...)
  htThau?: number; // 24. HT_THAU - 1..9 (1: Đấu thầu rộng rãi, 3: Chỉ định thầu...)
  maDvkt?: string; // 25. MA_DVKT - Mã DVKT dùng thuốc phóng xạ
  tccl?: string; // 26. TCCL - Tiêu chuẩn chất lượng
  boPhanVt?: number; // 27. BO_PHAN_VT - 1: Rễ, 2: Thân rễ, 3: Quả, 4: Hạt, 5: Vỏ, 6: Khác
  tenKhoaHoc?: string; // 28. TEN_KHOA_HOC - Tên khoa học dược liệu
  nguonGoc?: string; // 29. NGUON_GOC - Nguồn gốc dược liệu
  ppChebien?: string; // 30. PP_CHEBIEN - Phương pháp chế biến YHCT
  maDlNhap?: string; // 31. MA_DL_NHAP - Mã dược liệu nhập
  maDlCb?: string; // 32. MA_DL_CB - Mã dược liệu chế biến
  tlhhCb?: number; // 33. TLHH_CB - Tỷ lệ hao hụt chế biến (%)
  tlhhBq?: number; // 34. TLHH_BQ - Tỷ lệ hao hụt bảo quản (%)
  maCskcbThuoc?: string; // 35. MA_CSKCB_THUOC - C.XXXXX (nếu điều chuyển từ viện khác)
  tuNgay: string; // 36. TU_NGAY (bắt buộc) - Ngày áp dụng (YYYYMMDD)
  denNgay?: string; // 37. DEN_NGAY - Ngày ngừng áp dụng (YYYYMMDD)

  // Trạng thái đối soát UI
  isValid?: boolean;
  errors?: string[];
}

export interface ThuocValidationInput {
  maThuoc?: string;
  tenThuoc?: string;
  donViTinh?: string;
  soDangKy?: string;
  donGia?: number;
  tuNgay?: string;
  rawDenNgay?: unknown;
  denNgay?: string;
}

export interface ParseThuocExcelResult {
  fileName: string;
  selectedSheet: string;
  availableSheets: string[];
  sheets?: Array<{ name: string; rowCount: number; isBestMatch?: boolean }>;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  items: DmThuocItem[];
  missingRequiredColumns: string[];
  matchedFields: string[];
  matchedColumnsMap: { [schemaKey: string]: string };
  isMultiSheet: boolean;
  workbook?: XLSX.WorkBook;
}

export interface SendThuocGatewayResult {
  maKetQua: string;
  maGiaoDich: string;
  thongDiep: string;
  thoiGianTiepNhan: string;
  totalRecords: number;
}
