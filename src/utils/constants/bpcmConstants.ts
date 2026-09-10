import type { BpcmSchemaField } from '../types/bpcmTypes';

export const BPCM_SCHEMA_FIELDS: BpcmSchemaField[] = [
  {
    key: 'STT',
    label: 'Số thứ tự',
    type: 'number',
    required: true,
    desc: 'Thứ tự bản ghi (1, 2, 3...), không trùng nhau',
    aliases: ['STT', 'SO_THU_TU', 'SỐ THỨ TỰ', 'SOTHUTU', 'NO', 'ORDER', 'TT', 'STT.', 'SO TT', 'SỐ TT', 'NUM']
  },
  {
    key: 'MA_KHOA',
    label: 'Mã khoa / Bàn khám',
    type: 'string',
    required: true,
    desc: 'Mã theo danh mục BYT (vd: K01, K0809, K02.D35)',
    aliases: [
      'MA_KHOA', 'MAKHOA', 'MÃ KHOA', 'MÃ KHOA / BÀN KHÁM', 'MÃ KHOA/BÀN KHÁM', 'MÃ BÀN KHÁM',
      'MA_BAN_KHAM', 'MA KHOA', 'MÃ KHOA PHÒNG', 'MA KHOA PHONG', 'MÃ KHOA/PHÒNG',
      'MÃ KHOA, PHÒNG', 'MA_KHOA_PHONG', 'MA_KP', 'MÃ KP', 'MAKP'
    ]
  },
  {
    key: 'TEN_KHOA',
    label: 'Tên khoa / Bàn khám',
    type: 'string',
    required: true,
    desc: 'Tên chuyên khoa hoặc khoa lâm sàng',
    aliases: [
      'TEN_KHOA', 'TENKHOA', 'TÊN KHOA', 'TÊN KHOA / BÀN KHÁM', 'TÊN KHOA/BÀN KHÁM', 'TÊN BÀN KHÁM',
      'TEN_BAN_KHAM', 'TEN KHOA', 'TÊN KHOA PHÒNG', 'TEN KHOA PHONG', 'TÊN KHOA/PHÒNG',
      'TÊN KHOA, PHÒNG', 'TEN_KHOA_PHONG', 'TÊN BỘ PHẬN', 'TEN BO PHAN', 'BỘ PHẬN CHUYÊN MÔN',
      'TÊN BỘ PHẬN CHUYÊN MÔN', 'TEN_BPCM', 'TÊN BPCM', 'TEN BPCM'
    ]
  },
  {
    key: 'BAN_KHAM',
    label: 'Bàn khám',
    type: 'number',
    required: true,
    desc: 'Số lượng bàn khám từng chuyên khoa',
    aliases: [
      'BAN_KHAM', 'BANKHAM', 'BÀN KHÁM', 'SỐ BÀN KHÁM', 'SO_BAN_KHAM', 'SO BAN KHAM', 'SOBANKHAM',
      'BAN KHAM', 'BÀN KHÁM NGOẠI TRÚ', 'SỐ BÀN KHÁM NGOẠI TRÚ', 'SO_BAN_KHAM_NGOAI_TRU', 'SO BAN KHAM NGOAI TRU'
    ]
  },
  {
    key: 'GIUONG_PD',
    label: 'Giường phê duyệt',
    type: 'number',
    required: true,
    desc: 'Số giường được cấp thẩm quyền phê duyệt',
    aliases: [
      'GIUONG_PD', 'GIUONGPD', 'GIƯỜNG PHÊ DUYỆT', 'GIƯỜNG P.DUYỆT', 'GIUONG_PHE_DUYET', 'GIUONG PHE DUYET',
      'GIUONGPHEDUYET', 'GIƯỜNG PD', 'GIUONG PD', 'GIƯỜNG KẾ HOẠCH', 'GIUONG_KE_HOACH', 'GIUONG KE HOACH',
      'GIƯỜNG THEO KẾ HOẠCH', 'GIƯỜNG KH', 'GIUONG KH', 'SỐ GIƯỜNG PHÊ DUYỆT', 'SO_GIUONG_PD', 'SO GIUONG PD'
    ]
  },
  {
    key: 'GIUONG_TK',
    label: 'Giường thực kê',
    type: 'number',
    required: true,
    desc: 'Tổng số giường thực tế tại khoa',
    aliases: [
      'GIUONG_TK', 'GIUONGTK', 'GIƯỜNG THỰC KÊ', 'GIƯỜNG T.KÊ', 'GIUONG_THUC_KE', 'GIUONG THUC KE',
      'GIUONGTHUCKE', 'GIƯỜNG TK', 'GIUONG TK', 'GIƯỜNG THỰC TẾ', 'GIUONG_THUC_TE', 'GIUONG THUC TE',
      'SỐ GIƯỜNG THỰC KÊ', 'SO_GIUONG_TK', 'SO GIUONG TK'
    ]
  },
  {
    key: 'GIUONG_HSTC',
    label: 'Giường HSTC',
    type: 'number',
    required: true,
    desc: 'Số giường hồi sức tích cực',
    aliases: [
      'GIUONG_HSTC', 'GIUONGHSTC', 'GIƯỜNG HSTC', 'GIƯỜNG HỒI SỨC TÍCH CỰC', 'GIUONG_HOI_SUC_TICH_CUC',
      'GIUONG HOI SUC TICH CUC', 'HSTC', 'GIƯỜNG HSTC (HỒI SỨC TÍCH CỰC)', 'SỐ GIƯỜNG HSTC', 'SO_GIUONG_HSTC',
      'GIUONG_HSTC_CC', 'GIUONG HSTC'
    ]
  },
  {
    key: 'GIUONG_HSCC',
    label: 'Giường HSCC',
    type: 'number',
    required: true,
    desc: 'Số giường hồi sức cấp cứu',
    aliases: [
      'GIUONG_HSCC', 'GIUONGHSCC', 'GIƯỜNG HSCC', 'GIƯỜNG HỒI SỨC CẤP CỨU', 'GIUONG_HOI_SUC_CAP_CUU',
      'GIUONG HOI SUC CAP CUU', 'HSCC', 'GIƯỜNG HSCC (HỒI SỨC CẤP CỨU)', 'SỐ GIƯỜNG HSCC', 'SO_GIUONG_HSCC',
      'GIUONG HSCC'
    ]
  },
  {
    key: 'TU_NGAY',
    label: 'Từ ngày',
    type: 'string',
    required: true,
    desc: 'Định dạng 8 ký tự: YYYYMMDD (vd: 20260101)',
    aliases: [
      'TU_NGAY', 'TUNGAY', 'TỪ NGÀY', 'TU NGAY', 'TỪ NGÀY (YYYYMMDD)', 'TỪ NGÀY (YYYYMMDDHHMM)',
      'HIỆU LỰC TỪ', 'HIEU_LUC_TU', 'HIEU LUC TU', 'NGÀY ÁP DỤNG', 'NGAY_AP_DUNG', 'NGAY AP DUNG',
      'NGÀY BẮT ĐẦU', 'NGAY_BAT_DAU', 'NGAY BAT DAU', 'TU_NGAY_HL', 'NGÀY HIỆU LỰC', 'NGAY HIEU LUC'
    ]
  },
  {
    key: 'DEN_NGAY',
    label: 'Đến ngày',
    type: 'string',
    required: false,
    desc: 'Định dạng YYYYMMDD hoặc để trống',
    aliases: [
      'DEN_NGAY', 'DENNGAY', 'ĐẾN NGÀY', 'DEN NGAY', 'ĐẾN NGÀY (YYYYMMDD)', 'ĐẾN NGÀY (YYYYMMDDHHMM)',
      'HIỆU LỰC ĐẾN', 'HIEU_LUC_DEN', 'HIEU LUC DEN', 'NGÀY HẾT HẠN', 'NGAY_HET_HAN', 'NGAY HET HAN',
      'NGÀY KẾT THÚC', 'NGAY_KET_THUC', 'NGAY KET THUC', 'DEN_NGAY_HL'
    ]
  },
  {
    key: 'MA_CSKCB',
    label: 'Mã CSKCB',
    type: 'string',
    required: true,
    desc: 'Mã cơ sở 5 ký tự (vd: 01929, 79012)',
    aliases: [
      'MA_CSKCB', 'MACSKCB', 'MÃ CSKCB', 'MÃ CƠ SỞ KCB', 'MA_CƠ SỞ KCB', 'MA_CO_SO_KCB', 'MA_CS',
      'MÃ CS', 'MA CS', 'CƠ SỞ KCB', 'MA_COSO_KCB', 'MÃ BỆNH VIỆN', 'MA_BV', 'MA BV', 'MABV',
      'MÃ ĐƠN VỊ', 'MA_DON_VI', 'MA DON VI', 'MADONVI', 'CSKCB', 'MACS_KCB', 'MA_CS_KCB',
      'MÃ CƠ SỞ KHÁM CHỮA BỆNH', 'MA CO SO KHAM CHUA BENH'
    ]
  }
];

export const BPCM_EXCEL_TEMPLATE_HEADERS: string[] = [
  'STT',
  'MA_KHOA',
  'TEN_KHOA',
  'BAN_KHAM',
  'GIUONG_PD',
  'GIUONG_TK',
  'GIUONG_HSTC',
  'GIUONG_HSCC',
  'TU_NGAY',
  'DEN_NGAY',
  'MA_CSKCB'
];

export const BPCM_EXCEL_TEMPLATE_SAMPLES: (string | number)[][] = [
  [1, 'K01', 'Khoa Khám Bệnh Đa Khoa', 8, 0, 0, 0, 0, '20260101', '', '01929'],
  [2, 'K02', 'Khoa Hồi Sức Cấp Cứu - Chống Độc', 2, 25, 28, 10, 15, '20260101', '', '01929'],
  [3, 'K0809', 'Khoa Nội Tiết - Dị Ứng Miễn Dịch', 4, 40, 45, 0, 0, '20260101', '', '01929'],
  [4, 'K02.D35', 'Đơn nguyên Thận Nhân Tạo', 2, 15, 15, 5, 0, '20260101', '', '01929'],
  [5, 'K05', 'Khoa Nhi & Sơ Sinh', 3, 35, 35, 4, 6, '20260101', '', '01929'],
];
