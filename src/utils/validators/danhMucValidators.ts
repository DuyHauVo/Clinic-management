import type {
  BpcmValidationInput,
  NhanLucValidationInput,
  ThuocValidationInput,
  ThietBiValidationInput,
  DichVuValidationInput,
  TbytThdvValidationInput
} from '../types';
import { runValidationRules, type ValidationRule } from './base';

export type {
  BpcmValidationInput,
  NhanLucValidationInput,
  ThuocValidationInput,
  ThietBiValidationInput,
  DichVuValidationInput,
  TbytThdvValidationInput
};

// ==========================================
// 1. Bộ phận chuyên môn (Mẫu 01/DM)
// ==========================================
export const bpcmRules: ValidationRule<BpcmValidationInput>[] = [
  [d => !d.maKhoa?.trim(), 'Thiếu Mã khoa (MA_KHOA)'],
  [d => !d.tenKhoa?.trim(), 'Thiếu Tên khoa (TEN_KHOA)'],
  [d => !d.tuNgay || d.tuNgay.length !== 8, 'Từ ngày (TU_NGAY) phải có đúng 8 số định dạng YYYYMMDD'],
  [
    d => Boolean(d.rawDenNgay && (!d.denNgay || d.denNgay.length !== 8)),
    'Đến ngày (DEN_NGAY) nếu có phải đủ 8 số định dạng YYYYMMDD'
  ],
  [d => !d.maCskcb?.trim(), 'Thiếu Mã CSKCB']
];

export function validateBpcmData(data: BpcmValidationInput): string[] {
  return runValidationRules(data, bpcmRules);
}

// ==========================================
// 2. Nhân lực y tế (Mẫu 02/DM)
// ==========================================
export const nhanLucRules: ValidationRule<NhanLucValidationInput>[] = [
  [d => !d.maKhoa?.trim(), 'Thiếu Mã khoa (MA_KHOA)'],
  [d => !d.tenKhoa?.trim(), 'Thiếu Tên khoa (TEN_KHOA)'],
  [d => !d.hoTen?.trim(), 'Thiếu Họ và tên (HO_TEN)'],
  [d => !d.soDinhDanh?.trim(), 'Thiếu Số định danh / CCCD (SO_DINH_DANH)'],
  [d => !d.chucDanhNn?.trim(), 'Thiếu Chức danh nghề nghiệp (CHUCDANH_NN)'],
  [d => !d.tuNgay || d.tuNgay.length !== 8, 'Từ ngày (TU_NGAY) phải đủ 8 ký tự YYYYMMDD']
];

export function validateNhanLucData(data: NhanLucValidationInput): string[] {
  return runValidationRules(data, nhanLucRules);
}

// ==========================================
// 3. Thuốc / Chế phẩm (Mẫu 03/DM)
// ==========================================
export const thuocRules: ValidationRule<ThuocValidationInput>[] = [
  [d => !d.maThuoc?.trim(), 'Thiếu Mã thuốc (MA_THUOC)'],
  [d => !d.tenThuoc?.trim(), 'Thiếu Tên thuốc/chế phẩm (TEN_THUOC)'],
  [d => !d.donViTinh?.trim(), 'Thiếu Đơn vị tính (DON_VI_TINH)'],
  [d => !d.soDangKy?.trim(), 'Thiếu Số đăng ký/GPNK (SO_DANG_KY)'],
  [d => d.donGia === undefined || d.donGia <= 0, 'Đơn giá trúng thầu phải > 0 (DON_GIA)'],
  [d => !d.tuNgay || d.tuNgay.length !== 8, 'Từ ngày phải đủ 8 ký tự YYYYMMDD (TU_NGAY)'],
  [
    d => Boolean(d.rawDenNgay && (!d.denNgay || d.denNgay.length !== 8)),
    'Đến ngày sai định dạng YYYYMMDD (DEN_NGAY)'
  ]
];

export function validateThuocData(data: ThuocValidationInput): string[] {
  return runValidationRules(data, thuocRules);
}

// ==========================================
// 4. Thiết bị / Vật tư y tế (Mẫu 04/DM)
// ==========================================
export const thietBiRules: ValidationRule<ThietBiValidationInput>[] = [
  [d => !d.maVatTu?.trim(), 'Thiếu mã vật tư / TBYT'],
  [d => !d.nhomVatTu?.trim(), 'Thiếu tên nhóm vật tư'],
  [d => !d.tenVatTu?.trim(), 'Thiếu tên thương mại vật tư'],
  [d => !d.donViTinh?.trim(), 'Thiếu đơn vị tính'],
  [d => d.donGia !== undefined && d.donGia < 0, 'Đơn giá không được âm'],
  [d => d.donGiaBh !== undefined && d.donGiaBh < 0, 'Đơn giá BHYT không được âm'],
  [
    d => !d.rawTuNgay || !d.parsedTuNgay,
    'Thiếu hoặc sai định dạng ngày bắt đầu áp dụng (TU_NGAY, YYYYMMDD)'
  ]
];

export function validateThietBiData(data: ThietBiValidationInput): string[] {
  return runValidationRules(data, thietBiRules);
}

// ==========================================
// 5. Dịch vụ kỹ thuật (Mẫu 05/DM)
// ==========================================
export const dichVuRules: ValidationRule<DichVuValidationInput>[] = [
  [d => !d.maDichVu?.trim(), 'Thiếu mã dịch vụ (MA_DICH_VU)'],
  [d => !d.tenDichVu?.trim(), 'Thiếu tên dịch vụ (TEN_DICH_VU)'],
  [d => d.donGia !== undefined && d.donGia < 0, 'Đơn giá không được âm'],
  [d => !d.parsedTuNgay, 'Thiếu hoặc sai định dạng TU_NGAY (đã gán mặc định ngày hiện tại)']
];

export function validateDichVuData(data: DichVuValidationInput): string[] {
  return runValidationRules(data, dichVuRules);
}

// ==========================================
// 6. TBYT thực hiện DVKT (Mẫu 06/DM)
// ==========================================
export const tbytThdvRules: ValidationRule<TbytThdvValidationInput>[] = [
  [d => !d.tenTb?.trim(), 'Thiếu tên thiết bị y tế (TEN_TB)'],
  [d => !d.maMay?.trim(), 'Thiếu mã máy theo QĐ 3176 (MA_MAY)'],
  [d => !d.parsedTuNgay, 'Thiếu hoặc sai định dạng TU_NGAY (đã gán mặc định ngày hiện tại)']
];

export function validateTbytThdvData(data: TbytThdvValidationInput): string[] {
  return runValidationRules(data, tbytThdvRules);
}
