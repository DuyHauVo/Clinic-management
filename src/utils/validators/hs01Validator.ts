import { isValidYmdHmDate } from '../shared/excelXmlShared';
import type { Hs01ValidationInput } from '../types/hs01TongHopTypes';
import { runValidationRules, type ValidationRule } from './base';

export type { Hs01ValidationInput };

export const hs01Rules: ValidationRule<Hs01ValidationInput>[] = [
  [d => !d.hoTen?.trim(), 'Thiếu họ và tên bệnh nhân (HO_TEN)'],
  [d => !d.maTheBhyt?.trim(), 'Thiếu mã thẻ BHYT (MA_THE_BHYT)'],
  [
    d => Boolean(d.maTheBhyt?.trim() && d.maTheBhyt.trim().length < 10),
    'Mã thẻ BHYT không đủ độ dài quy định (tối thiểu 10 ký tự)'
  ],
  [
    d => !d.gioiTinh || !['1', '2', '3'].includes(d.gioiTinh),
    'Thiếu hoặc sai giới tính (GIOI_TINH: 1-Nam, 2-Nữ, 3-Khác)'
  ],
  [d => !d.maBenhChinh?.trim(), 'Thiếu mã bệnh chính theo ICD-10 (MA_BENH_CHINH)'],
  [d => !d.maLoaiKcb?.trim(), 'Thiếu mã loại khám chữa bệnh (MA_LOAI_KCB)'],
  [
    d => !d.ngaySinh || !isValidYmdHmDate(d.ngaySinh),
    'Ngày sinh (NGAY_SINH) phải đủ 12 chữ số hợp lệ YYYYMMDDHHmm'
  ],
  [
    d => !d.ngayVao || !isValidYmdHmDate(d.ngayVao),
    'Ngày vào viện (NGAY_VAO) phải đủ 12 chữ số YYYYMMDDHHmm (có giờ phút thực tế)'
  ],
  [
    d => !d.ngayRa || !isValidYmdHmDate(d.ngayRa),
    'Ngày ra viện (NGAY_RA) phải đủ 12 chữ số YYYYMMDDHHmm (có giờ phút thực tế)'
  ],
  [
    d => Boolean(d.ngayVaoNoiTru && !isValidYmdHmDate(d.ngayVaoNoiTru)),
    'Ngày vào nội trú (NGAY_VAO_NOI_TRU) phải đủ 12 chữ số hợp lệ YYYYMMDDHHmm'
  ],
  [
    d => Boolean(d.ngayVao && d.ngayRa && d.ngayRa < d.ngayVao),
    'Thời gian ra viện (NGAY_RA) không thể trước thời gian vào viện (NGAY_VAO)'
  ],
  [
    d => d.tTongchiBv === undefined || d.tTongchiBv <= 0,
    'Tổng chi phí BV (T_TONGCHI_BV) phải lớn hơn 0'
  ]
];

/**
 * Kiểm tra tính hợp lệ của dòng dữ liệu Hồ sơ tổng hợp Mẫu 01/BH (XML 130)
 */
export function validateHs01Data(data: Hs01ValidationInput): string[] {
  return runValidationRules(data, hs01Rules);
}
