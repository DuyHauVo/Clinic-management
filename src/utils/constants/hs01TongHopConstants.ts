import type { SharedSchemaField } from '../shared/excelXmlShared';

/**
 * 20 trường thông tin chuẩn của Mẫu 01/BH (XML <HSTH01BH> - Loại HS 5)
 */
export const HS01_SCHEMA_FIELDS: SharedSchemaField[] = [
  {
    key: 'STT',
    label: 'Số Thứ Tự',
    type: 'number',
    required: true,
    desc: 'Ghi số thứ tự tăng từ 1 đến hết trong một lần gửi dữ liệu (tối đa 10 số).',
    aliases: ['STT', 'SO_THU_TU', 'SO_TT', 'NO']
  },
  {
    key: 'HO_TEN',
    label: 'Họ Và Tên Bệnh Nhân',
    type: 'string',
    required: true,
    desc: 'Ghi họ và tên của người bệnh (tối đa 255 ký tự).',
    aliases: ['HO_TEN', 'HOTEN', 'TEN_BN', 'TEN_BENH_NHAN', 'HO_VA_TEN', 'PATIENT_NAME']
  },
  {
    key: 'NGAY_SINH',
    label: 'Ngày Sinh (YYYYMMDDHHmm)',
    type: 'string',
    required: true,
    desc: 'Ghi ngày, tháng, năm sinh ghi trên thẻ BHYT (12 ký tự: 4 năm + 2 tháng + 2 ngày + 2 giờ + 2 phút).',
    aliases: ['NGAY_SINH', 'NGAYSINH', 'DOB', 'BIRTHDATE', 'NAM_SINH']
  },
  {
    key: 'GIOI_TINH',
    label: 'Giới Tính',
    type: 'string',
    required: true,
    desc: 'Ghi giới tính của người bệnh (1: Nam, 2: Nữ, 3: Chưa xác định).',
    aliases: ['GIOI_TINH', 'GIOITINH', 'PHAI', 'GENDER', 'SEX']
  },
  {
    key: 'MA_THE_BHYT',
    label: 'Mã Thẻ BHYT',
    type: 'string',
    required: true,
    desc: 'Ghi mã thẻ BHYT của người bệnh do cơ quan BHXH cấp (15 ký tự).',
    aliases: ['MA_THE_BHYT', 'MA_THE', 'SO_THE_BHYT', 'MATHE', 'SO_THE', 'MA_THE_BH']
  },
  {
    key: 'MA_BENH_CHINH',
    label: 'Mã Bệnh Chính (ICD-10)',
    type: 'string',
    required: true,
    desc: 'Ghi mã bệnh chính theo chuẩn ICD-10 (QĐ 4469/QĐ-BYT, tối đa 7 ký tự).',
    aliases: ['MA_BENH_CHINH', 'MA_BENH', 'ICD10', 'MA_ICD', 'BENH_CHINH', 'ICD_CHINH']
  },
  {
    key: 'NGAY_VAO',
    label: 'Ngày Vào KBCB (YYYYMMDDHHmm)',
    type: 'string',
    required: true,
    desc: 'Thời điểm người bệnh đến KBCB (12 ký tự: 4 năm + 2 tháng + 2 ngày + 2 giờ + 2 phút).',
    aliases: ['NGAY_VAO', 'NGAYVAO', 'THOI_GIAN_VAO', 'GIO_VAO']
  },
  {
    key: 'NGAY_VAO_NOI_TRU',
    label: 'Ngày Vào Nội Trú',
    type: 'string',
    required: false,
    desc: 'Thời điểm vào điều trị nội trú / ban ngày (12 ký tự hoặc để trống nếu ngoại trú).',
    aliases: ['NGAY_VAO_NOI_TRU', 'NGAY_NOI_TRU', 'VAO_NOI_TRU', 'NGAYVAONOITRU']
  },
  {
    key: 'NGAY_RA',
    label: 'Ngày Ra Viện (YYYYMMDDHHmm)',
    type: 'string',
    required: true,
    desc: 'Thời điểm kết thúc đợt KBCB hoặc đợt điều trị (12 ký tự: 4 năm + 2 tháng + 2 ngày + 2 giờ + 2 phút).',
    aliases: ['NGAY_RA', 'NGAYRA', 'THOI_GIAN_RA', 'GIO_RA', 'NGAY_KET_THUC']
  },
  {
    key: 'SO_NGAY_DTRI',
    label: 'Số Ngày Điều Trị',
    type: 'number',
    required: true,
    desc: 'Số ngày điều trị = NGAY_RA - NGAY_VAO + 1 (tối đa 3 chữ số).',
    aliases: ['SO_NGAY_DTRI', 'SO_NGAY_DIEU_TRI', 'NGAY_DTRI', 'SONGAYDTRI', 'SO_NGAY_DT']
  },
  {
    key: 'MA_LOAI_KCB',
    label: 'Mã Loại KBCB',
    type: 'string',
    required: true,
    desc: 'Mã hình thức KBCB theo Bộ mã DMDC (01: Khám bệnh, 02: Ngoại trú, 03: Nội trú, 04: Cấp cứu...).',
    aliases: ['MA_LOAI_KCB', 'LOAI_KCB', 'HINH_THUC_KCB', 'MALOAIKCB']
  },
  {
    key: 'T_TONGCHI_BV',
    label: 'Tổng Chi Phí BV (VNĐ)',
    type: 'number',
    required: true,
    desc: 'Tổng chi phí lần KBCB/đợt điều trị (làm tròn 2 chữ số thập phân).',
    aliases: ['T_TONGCHI_BV', 'TONG_CHI_BV', 'TONG_CHI_PHI', 'TONGCHI_BV', 'T_TONGCHI']
  },
  {
    key: 'T_TONGCHI_BH',
    label: 'Tổng Chi Phí BHYT (VNĐ)',
    type: 'number',
    required: true,
    desc: 'Tổng chi phí trong phạm vi Quỹ BHYT thanh toán (làm tròn 2 chữ số thập phân).',
    aliases: ['T_TONGCHI_BH', 'TONG_CHI_BH', 'TONGCHI_BH', 'CHI_PHI_BH', 'TONG_BH']
  },
  {
    key: 'T_BHTT',
    label: 'Tiền BHYT Thanh Toán (VNĐ)',
    type: 'number',
    required: true,
    desc: 'Tổng số tiền đề nghị cơ quan BHXH thanh toán (làm tròn 2 chữ số thập phân).',
    aliases: ['T_BHTT', 'BHYT_THANH_TOAN', 'TIEN_BHXH_TRA', 'BHTT', 'TIEN_BHYT']
  },
  {
    key: 'T_BNCCT',
    label: 'Tiền Người Bệnh Cùng Chi Trả (VNĐ)',
    type: 'number',
    required: true,
    desc: 'Tổng số tiền người bệnh cùng chi trả trong phạm vi BHYT (làm tròn 2 chữ số thập phân).',
    aliases: ['T_BNCCT', 'NGUOI_BENH_CUNG_CHI_TRA', 'BNCCT', 'TIEN_CUNG_CHI_TRA', 'CUNG_TRA']
  },
  {
    key: 'T_BNTT',
    label: 'Tiền Người Bệnh Tự Trả (VNĐ)',
    type: 'number',
    required: true,
    desc: 'Tổng số tiền người bệnh tự trả ngoài phạm vi Quỹ BHYT (làm tròn 2 chữ số thập phân).',
    aliases: ['T_BNTT', 'NGUOI_BENH_TU_TRA', 'BNTT', 'TIEN_TU_TRA', 'TU_TRA_NGOAI_BH']
  },
  {
    key: 'T_NGUONKHAC',
    label: 'Tiền Nguồn Khác Chi Trả (VNĐ)',
    type: 'number',
    required: false,
    desc: 'Tổng số tiền nguồn khác chi trả ngoài phạm vi BHYT (làm tròn 2 chữ số thập phân).',
    aliases: ['T_NGUONKHAC', 'NGUON_KHAC', 'TIEN_NGUON_KHAC', 'NGUONKHAC']
  },
  {
    key: 'MA_CSKCB',
    label: 'Mã Cơ Sở KCB',
    type: 'string',
    required: true,
    desc: 'Ghi mã cơ sở KBCB nơi người bệnh đến khám bệnh, điều trị (5 ký tự, vd: 01929).',
    aliases: ['MA_CSKCB', 'MA_CO_SO_KCB', 'MA_CS', 'MA_BV', 'FACILITY_CODE']
  },
  {
    key: 'NAM_QT',
    label: 'Năm Quyết Toán',
    type: 'number',
    required: true,
    desc: 'Năm mà cơ sở KBCB đề nghị cơ quan BHXH quyết toán (4 số, vd: 2026).',
    aliases: ['NAM_QT', 'NAM_QUYET_TOAN', 'NAM_BAO_CAO', 'YEAR']
  },
  {
    key: 'THANG_QT',
    label: 'Tháng Quyết Toán',
    type: 'string',
    required: true,
    desc: 'Tháng mà cơ sở KBCB đề nghị cơ quan BHXH quyết toán (2 số, vd: 01, 02..12).',
    aliases: ['THANG_QT', 'THANG_QUYET_TOAN', 'THANG_BAO_CAO', 'MONTH']
  }
];

/**
 * Heuristics so khớp cột Excel tự động
 */
export const HS01_FIELD_HEURISTICS: Array<[RegExp | string, string]> = [
  // 1. Họ tên
  [/^(HOTEN|TENBN|BENHNHAN|TENBENHNHAN|HOVATEN)/, 'HO_TEN'],
  // 2. Thẻ BHYT
  [/^(MATHE|SOTHE|THEBHYT|SOTHEBHYT)/, 'MA_THE_BHYT'],
  // 3. Ngày sinh
  [/^(NGAYSINH|DOB|NAMSINH)/, 'NGAY_SINH'],
  // 4. Giới tính
  [/^(GIOITINH|PHAI|SEX|GENDER)/, 'GIOI_TINH'],
  // 5. Mã bệnh ICD
  [/^(MABENH|ICD10|MAICD|BENHCHINH|ICD)/, 'MA_BENH_CHINH'],
  // 6. Thời điểm vào
  [/^(NGAYVAO|THOIGIANVAO|GIOVAO)/, 'NGAY_VAO'],
  // 7. Vào nội trú
  [/^(VAONOITRU|NGAYNOITRU|NGAYVAONOITRU)/, 'NGAY_VAO_NOI_TRU'],
  // 8. Thời điểm ra
  [/^(NGAYRA|THOIGIANRA|GIORA|NGAYKETTHUC)/, 'NGAY_RA'],
  // 9. Số ngày điều trị
  [/^(SONGAYDTRI|SONGAYDIEUTRI|NGAYDTRI|SONGAYDT)/, 'SO_NGAY_DTRI'],
  // 10. Loại KCB
  [/^(MALOAIKCB|LOAIKCB|HINHTHUCKCB)/, 'MA_LOAI_KCB'],
  // 11. Chi phí BV
  [/^(TTONGCHIBV|TONGCHIBV|TONGCHIPHI|TONGCHI)/, 'T_TONGCHI_BV'],
  // 12. Chi phí BHYT
  [/^(TTONGCHIBH|TONGCHIBH|CHIPHIBH|TONGBH)/, 'T_TONGCHI_BH'],
  // 13. BHYT thanh toán
  [/^(TBHTT|BHYTTHANHTOAN|BHTT|TIENBH)/, 'T_BHTT'],
  // 14. Bệnh nhân cùng chi trả
  [/^(TBNCCT|CUNGCHITRA|BNCCT|CUNGTRA)/, 'T_BNCCT'],
  // 15. Bệnh nhân tự trả
  [/^(TBNTT|TUTRA|BNTT|TIENTUTRA)/, 'T_BNTT'],
  // 16. Nguồn khác
  [/^(TNGUONKHAC|NGUONKHAC|TIENNGUONKHAC)/, 'T_NGUONKHAC'],
  // 17. Mã CSKCB
  [/^(MACSKCB|MACOSOKCB|MABV|MACS)/, 'MA_CSKCB'],
  // 18. Năm QT
  [/^(NAMQT|NAMQUYETTOAN|NAM)/, 'NAM_QT'],
  // 19. Tháng QT
  [/^(THANGQT|THANGQUYETTOAN|THANG)/, 'THANG_QT'],
  // 20. STT
  [/^(STT|SOTHUTU|SOTT)/, 'STT']
];

/**
 * Danh mục Mã loại KBCB chuẩn Bộ Y Tế
 */
export const LOAI_KCB_OPTIONS = [
  { code: '01', name: 'Khám bệnh (Ngoại trú)' },
  { code: '02', name: 'Điều trị ngoại trú' },
  { code: '03', name: 'Điều trị nội trú' },
  { code: '04', name: 'Điều trị ban ngày' },
  { code: '05', name: 'Khám sức khỏe' },
  { code: '06', name: 'Cấp cứu' },
  { code: '07', name: 'Cấp thuốc bệnh mạn tính' },
  { code: '08', name: 'DVKT ngoại trú' },
  { code: '09', name: 'Khác' }
];

export const GIOI_TINH_MAP: Record<string, string> = {
  '1': 'Nam',
  '2': 'Nữ',
  '3': 'Chưa xác định'
};
