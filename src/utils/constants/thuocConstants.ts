import { getCurrentYearStartYmd } from '../shared/excelXmlShared';

export interface ThuocSchemaField {
  key: string;
  label: string;
  type?: string;
  required: boolean;
  desc?: string;
  description?: string;
  aliases: string[];
}

/**
 * 37 trường schema chuẩn Mẫu 03/DM: Danh mục thuốc, máu, chế phẩm máu (Loại HS 10)
 * Theo Quyết định 130/QĐ-BYT & Quyết định 3176/QĐ-BYT
 */
export const THUOC_SCHEMA_FIELDS: ThuocSchemaField[] = [
  {
    key: 'STT',
    label: 'Số Thứ Tự',
    required: false,
    aliases: ['STT', 'SO THU TU', 'NO', 'THU TU'],
    desc: 'Số thứ tự dòng (1, 2, 3...)'
  },
  {
    key: 'MA_THUOC',
    label: 'Mã Thuốc BHYT (*)',
    required: true,
    aliases: ['MA THUOC', 'MA_THUOC', 'MA THUOC BHYT', 'MATHUOC', 'MA_THUOC_BHYT', 'CODE', 'MA HOAT CHAT'],
    desc: 'Mã thuốc, máu, chế phẩm máu theo hướng dẫn tại QĐ 3176/QĐ-BYT'
  },
  {
    key: 'TEN_HOAT_CHAT',
    label: 'Tên Hoạt Chất',
    required: false,
    aliases: ['TEN HOAT CHAT', 'TEN_HOAT_CHAT', 'HOAT CHAT', 'TENHOATCHAT', 'HOATCHAT', 'ACTIVE INGREDIENT'],
    desc: 'Tên hoạt chất hoặc thành phần thuốc'
  },
  {
    key: 'TEN_THUOC',
    label: 'Tên Thuốc / Chế Phẩm (*)',
    required: true,
    aliases: ['TEN THUOC', 'TEN_THUOC', 'TENTHUOC', 'TEN THUONG MAI', 'TEN BIET DUOC', 'TEN CHE PHAM MAU'],
    desc: 'Tên thương mại của thuốc hoặc tên máu, chế phẩm máu'
  },
  {
    key: 'DON_VI_TINH',
    label: 'Đơn Vị Tính (*)',
    required: true,
    aliases: ['DON VI TINH', 'DON_VI_TINH', 'DVT', 'DONVITINH', 'DON VI', 'UNIT'],
    desc: 'Đơn vị tính (Viên, Lọ, Chai, Ống, Gói, Túi, ml, Liều...)'
  },
  {
    key: 'HAM_LUONG',
    label: 'Hàm Lượng / Thể Tích',
    required: false,
    aliases: ['HAM LUONG', 'HAM_LUONG', 'HAMLUONG', 'NONG DO', 'STRENGTH', 'THE TICH'],
    desc: 'Hàm lượng của thuốc hoặc thể tích thực của máu, chế phẩm máu'
  },
  {
    key: 'DUONG_DUNG',
    label: 'Đường Dùng',
    required: false,
    aliases: ['DUONG DUNG', 'DUONG_DUNG', 'DUONGDUNG', 'CACH DUNG', 'ROUTE'],
    desc: 'Đường dùng (Uống, Tiêm bắp, Tiêm tĩnh mạch, Truyền tĩnh mạch, Bôi ngoài da...)'
  },
  {
    key: 'MA_DUONG_DUNG',
    label: 'Mã Đường Dùng BYT (*)',
    required: true,
    aliases: ['MA DUONG DUNG', 'MA_DUONG_DUNG', 'MADUONGDUNG', 'MA DUONG DUNG BYT'],
    desc: 'Mã đường dùng theo danh mục dùng chung Bộ Y Tế (1.01: Uống, 2.01: Tiêm...)'
  },
  {
    key: 'DANG_BAO_CHE',
    label: 'Dạng Bào Chế',
    required: false,
    aliases: ['DANG BAO CHE', 'DANG_BAO_CHE', 'DANGBAOCHE', 'DANG THUOC', 'DOSAGE FORM'],
    desc: 'Viên nén, Viên nang, Dung dịch tiêm, Hỗn dịch, Bột pha tiêm...'
  },
  {
    key: 'SO_DANG_KY',
    label: 'Số Đăng Ký / GPNK (*)',
    required: true,
    aliases: ['SO DANG KY', 'SO_DANG_KY', 'SODANGKY', 'SDK', 'SO GPNK', 'GPNK', 'REG NO'],
    desc: 'Số đăng ký lưu hành hoặc Giấy phép nhập khẩu'
  },
  {
    key: 'SO_LUONG',
    label: 'Số Lượng',
    required: false,
    aliases: ['SO LUONG', 'SO_LUONG', 'SOLUONG', 'SO LUONG TRUNG THAU', 'QUANTITY'],
    desc: 'Số lượng trúng thầu hoặc hình thức mua sắm khác'
  },
  {
    key: 'DON_GIA',
    label: 'Đơn Giá Trúng Thầu (*)',
    required: true,
    aliases: ['DON GIA', 'DON_GIA', 'DONGIA', 'GIA MUA', 'GIA TRUNG THAU', 'PRICE'],
    desc: 'Đơn giá ghi theo kết quả trúng thầu hoặc giá phê duyệt'
  },
  {
    key: 'DON_GIA_BH',
    label: 'Đơn Giá BHYT (*)',
    required: true,
    aliases: ['DON GIA BH', 'DON_GIA_BH', 'DONGIABH', 'GIA BHYT', 'GIA THANH TOAN BHYT', 'DON GIA BHYT'],
    desc: 'Đơn giá thanh toán bảo hiểm y tế'
  },
  {
    key: 'QUY_CACH',
    label: 'Quy Cách Đóng Gói',
    required: false,
    aliases: ['QUY CACH', 'QUY_CACH', 'QUYCACH', 'QUY CACH DONG GOI', 'DONG GOI', 'PACKAGE'],
    desc: 'Hộp 10 vỉ x 10 viên, Hộp 1 lọ 100ml...'
  },
  {
    key: 'NHA_SX',
    label: 'Nhà Sản Xuất',
    required: false,
    aliases: ['NHA SX', 'NHA_SX', 'NHASX', 'NHA SAN XUAT', 'HANG SAN XUAT', 'MANUFACTURER'],
    desc: 'Tên công ty / cơ sở sản xuất'
  },
  {
    key: 'NUOC_SX',
    label: 'Nước Sản Xuất',
    required: false,
    aliases: ['NUOC SX', 'NUOC_SX', 'NUOCSX', 'NUOC SAN XUAT', 'XUAT XU', 'COUNTRY'],
    desc: 'Việt Nam, Pháp, Đức, Ấn Độ, Hàn Quốc...'
  },
  {
    key: 'NHA_THAU',
    label: 'Nhà Thầu Cung Ứng',
    required: false,
    aliases: ['NHA THAU', 'NHA_THAU', 'NHATHAU', 'DON VI CUNG UNG', 'CONG TY CUNG UNG', 'DISTRIBUTOR'],
    desc: 'Tên đơn vị trúng thầu cung cấp thuốc'
  },
  {
    key: 'TT_THAU',
    label: 'Thông Tin Thầu',
    required: false,
    aliases: ['TT THAU', 'TT_THAU', 'TTTHAU', 'THONG TIN THAU', 'GOI THAU', 'QUYET DINH THAU'],
    desc: 'QĐ trúng thầu theo quy định của BYT'
  },
  {
    key: 'TU_NGAY_HD',
    label: 'Từ Ngày Hợp Đồng (YYYYMMDD)',
    required: false,
    aliases: ['TU NGAY HD', 'TU_NGAY_HD', 'TUNGAYHD', 'NGAY HD BAT DAU', 'HIEU LUC HD TU'],
    desc: 'Thời điểm có hiệu lực hợp đồng cung ứng (YYYYMMDD)'
  },
  {
    key: 'DEN_NGAY_HD',
    label: 'Đến Ngày Hợp Đồng (YYYYMMDD)',
    required: false,
    aliases: ['DEN NGAY HD', 'DEN_NGAY_HD', 'DENNGAYHD', 'NGAY HD KET THUC', 'HET HAN HD'],
    desc: 'Thời điểm hết hiệu lực hợp đồng cung ứng (YYYYMMDD)'
  },
  {
    key: 'MA_CSKCB',
    label: 'Mã Cơ Sở KCB (*)',
    required: true,
    aliases: ['MA CSKCB', 'MA_CSKCB', 'MACSKCB', 'MA CO SO KCB', 'MA BENH VIEN', 'MA PHONG KHAM'],
    desc: 'Mã 5 ký tự của CSKCB theo chuẩn Bộ Y Tế (vd: 48001)'
  },
  {
    key: 'LOAI_THUOC',
    label: 'Loại Thuốc (*)',
    required: true,
    aliases: ['LOAI THUOC', 'LOAI_THUOC', 'LOAITHUOC', 'PHAN LOAI THUOC'],
    desc: '1: Tân dược, 2: Chế phẩm, 3: Vị thuốc, 4: Phóng xạ, 5: Tân dược tự BC, 6: Chế phẩm tự BC, 7: Dược liệu, 8: Vị thuốc tự BC, 9: Máu, 10: Chế phẩm máu'
  },
  {
    key: 'LOAI_THAU',
    label: 'Loại Thầu',
    required: false,
    aliases: ['LOAI THAU', 'LOAI_THAU', 'LOAITHAU'],
    desc: '1: Tập trung, 2: Thầu riêng, 3: Tự bào chế, 4: Mua sắm NĐ 188, 5: Mua sắm NĐ 214, 6: Tùy chọn, 7: Điều chuyển'
  },
  {
    key: 'HT_THAU',
    label: 'Hình Thức Thầu',
    required: false,
    aliases: ['HT THAU', 'HT_THAU', 'HTTHAU', 'HINH THUC THAU'],
    desc: '1: Đấu thầu rộng rãi, 2: Đấu thầu hạn chế, 3: Chỉ định thầu, 4: Chào hàng cạnh tranh, 5: Mua sắm trực tiếp...'
  },
  {
    key: 'MA_DVKT',
    label: 'Mã DVKT (Phóng xạ)',
    required: false,
    aliases: ['MA DVKT', 'MA_DVKT', 'MADVKT'],
    desc: 'Mã DVKT sử dụng thuốc phóng xạ'
  },
  {
    key: 'TCCL',
    label: 'Tiêu Chuẩn Chất Lượng',
    required: false,
    aliases: ['TCCL', 'TIEU CHUAN CHAT LUONG'],
    desc: 'Tiêu chuẩn chất lượng Dược điển hoặc số công bố'
  },
  {
    key: 'BO_PHAN_VT',
    label: 'Bộ Phận Vị Thuốc',
    required: false,
    aliases: ['BO PHAN VT', 'BO_PHAN_VT', 'BOPHANVT', 'BO PHAN DUNG'],
    desc: '1: Rễ, 2: Thân rễ, 3: Quả, 4: Hạt, 5: Vỏ, 6: Khác'
  },
  {
    key: 'TEN_KHOA_HOC',
    label: 'Tên Khoa Học Dược Liệu',
    required: false,
    aliases: ['TEN KHOA HOC', 'TEN_KHOA_HOC', 'TENKHOAHOC', 'SCIENTIFIC NAME'],
    desc: 'Tên khoa học quốc tế của dược liệu / thảo dược'
  },
  {
    key: 'NGUON_GOC',
    label: 'Nguồn Gốc Dược Liệu',
    required: false,
    aliases: ['NGUON GOC', 'NGUON_GOC', 'NGUONGOC', 'ORIGIN'],
    desc: 'Nuôi trồng, Thu hái tự nhiên, Nhập khẩu...'
  },
  {
    key: 'PP_CHEBIEN',
    label: 'Phương Pháp Chế Biến',
    required: false,
    aliases: ['PP CHEBIEN', 'PP_CHEBIEN', 'PPCHEBIEN', 'PHUONG PHAP CHE BIEN'],
    desc: 'Mã phương pháp chế biến YHCT theo QĐ Bộ Y Tế'
  },
  {
    key: 'MA_DL_NHAP',
    label: 'Mã Dược Liệu Nhập',
    required: false,
    aliases: ['MA DL NHAP', 'MA_DL_NHAP', 'MADLNHAP'],
    desc: 'Tình trạng vị thuốc/dược liệu khi mua sắm'
  },
  {
    key: 'MA_DL_CB',
    label: 'Mã Dược Liệu Chế Biến',
    required: false,
    aliases: ['MA DL CB', 'MA_DL_CB', 'MADLCB'],
    desc: 'Mã dược liệu được cơ sở trực tiếp chế biến'
  },
  {
    key: 'TLHH_CB',
    label: 'Tỷ Lệ Hao Hụt Chế Biến (%)',
    required: false,
    aliases: ['TLHH CB', 'TLHH_CB', 'TLHHCB', 'HAO HUT CHE BIEN'],
    desc: 'Tỷ lệ hao hụt trong quá trình chế biến vị thuốc'
  },
  {
    key: 'TLHH_BQ',
    label: 'Tỷ Lệ Hao Hụt Bảo Quản (%)',
    required: false,
    aliases: ['TLHH BQ', 'TLHH_BQ', 'TLHHBQ', 'HAO HUT BQ'],
    desc: 'Tỷ lệ hao hụt do bảo quản, cân chia'
  },
  {
    key: 'MA_CSKCB_THUOC',
    label: 'Mã CSKCB Nơi Chuyển Đến',
    required: false,
    aliases: ['MA CSKCB THUOC', 'MA_CSKCB_THUOC', 'MACSKCBTHUOC', 'MA DIEU CHUYEN'],
    desc: 'C.XXXXX (Mã CSKCB nơi chuyển thuốc đi nếu nhận điều chuyển)'
  },
  {
    key: 'TU_NGAY',
    label: 'Từ Ngày Áp Dụng (YYYYMMDD) (*)',
    required: true,
    aliases: ['TU NGAY', 'TU_NGAY', 'TUNGAY', 'NGAY BAT DAU', 'NGAY AP DUNG', 'HIEU LUC TU', 'VALID FROM'],
    desc: 'Ngày thuốc bắt đầu có hiệu lực áp dụng thanh toán BHYT (YYYYMMDD)'
  },
  {
    key: 'DEN_NGAY',
    label: 'Đến Ngày (YYYYMMDD)',
    required: false,
    aliases: ['DEN NGAY', 'DEN_NGAY', 'DENNGAY', 'NGAY KET THUC', 'NGAY HET HAN', 'HIEU LUC DEN', 'VALID TO'],
    desc: 'Ngày ngừng áp dụng thuốc (YYYYMMDD - để trống nếu đang áp dụng)'
  }
];

export const THUOC_EXCEL_TEMPLATE_HEADERS = THUOC_SCHEMA_FIELDS.map((f) => f.key);
export const THUOC_EXCEL_TEMPLATE_LABELS = THUOC_SCHEMA_FIELDS.map((f) => f.label);

export const THUOC_EXCEL_TEMPLATE_COLS = [
  { wch: 6 }, // STT
  { wch: 16 }, // MA_THUOC
  { wch: 28 }, // TEN_HOAT_CHAT
  { wch: 32 }, // TEN_THUOC
  { wch: 12 }, // DON_VI_TINH
  { wch: 18 }, // HAM_LUONG
  { wch: 14 }, // DUONG_DUNG
  { wch: 14 }, // MA_DUONG_DUNG
  { wch: 20 }, // DANG_BAO_CHE
  { wch: 18 }, // SO_DANG_KY
  { wch: 12 }, // SO_LUONG
  { wch: 14 }, // DON_GIA
  { wch: 14 }, // DON_GIA_BH
  { wch: 22 }, // QUY_CACH
  { wch: 28 }, // NHA_SX
  { wch: 16 }, // NUOC_SX
  { wch: 28 }, // NHA_THAU
  { wch: 18 }, // TT_THAU
  { wch: 12 }, // TU_NGAY_HD
  { wch: 12 }, // DEN_NGAY_HD
  { wch: 12 }, // MA_CSKCB
  { wch: 12 }, // LOAI_THUOC
  { wch: 12 }, // LOAI_THAU
  { wch: 12 }, // HT_THAU
  { wch: 12 }, // MA_DVKT
  { wch: 12 }, // TCCL
  { wch: 12 }, // BO_PHAN_VT
  { wch: 18 }, // TEN_KHOA_HOC
  { wch: 16 }, // NGUON_GOC
  { wch: 16 }, // PP_CHEBIEN
  { wch: 14 }, // MA_DL_NHAP
  { wch: 14 }, // MA_DL_CB
  { wch: 12 }, // TLHH_CB
  { wch: 12 }, // TLHH_BQ
  { wch: 16 }, // MA_CSKCB_THUOC
  { wch: 12 }, // TU_NGAY
  { wch: 12 }, // DEN_NGAY
];

export const THUOC_EXCEL_TEMPLATE_SAMPLES: (string | number)[][] = [
  [
    1,
    '40.123',
    'Paracetamol',
    'Panadol Extra 500mg/65mg',
    'Viên nén',
    '500mg + 65mg',
    'Uống',
    '1.01',
    'Viên nén bao phim',
    'VN-22134-19',
    10000,
    1200,
    1200,
    'Hộp 15 vỉ x 10 viên',
    'Công ty TNHH Sanofi-Aventis Việt Nam',
    'Việt Nam',
    'Công ty CP Dược liệu TW 2',
    `01/${new Date().getFullYear()}/QĐ-SYT`,
    getCurrentYearStartYmd(),
    `${new Date().getFullYear()}1231`,
    '48001',
    1,
    1,
    1,
    '',
    '',
    0,
    '',
    '',
    '',
    '',
    '',
    0,
    0,
    '',
    getCurrentYearStartYmd(),
    ''
  ],
  [
    2,
    '40.456',
    'Amoxicillin + Acid clavulanic',
    'Augmentin 1g',
    'Viên nén',
    '875mg + 125mg',
    'Uống',
    '1.01',
    'Viên nén bao phim',
    'VN-18456-14',
    5000,
    18500,
    18500,
    'Hộp 2 vỉ x 7 viên',
    'Glaxo Operations UK Limited',
    'Vương Quốc Anh',
    'Công ty TNHH Dược phẩm Mega Lifesciences',
    `01/${new Date().getFullYear()}/QĐ-SYT`,
    getCurrentYearStartYmd(),
    `${new Date().getFullYear()}1231`,
    '48001',
    1,
    1,
    1,
    '',
    '',
    0,
    '',
    '',
    '',
    '',
    '',
    0,
    0,
    '',
    getCurrentYearStartYmd(),
    ''
  ],
  [
    3,
    '40.789',
    'Cefuroxim axetil',
    'Zinnat Tablets 500mg',
    'Viên nén',
    '500mg',
    'Uống',
    '1.01',
    'Viên nén bao phim',
    'VN-20188-16',
    8000,
    24200,
    24200,
    'Hộp 1 vỉ x 10 viên',
    'GlaxoSmithKline Pharmaceuticals S.A.',
    'Ba Lan',
    'Công ty TNHH DKSH Việt Nam',
    `01/${new Date().getFullYear()}/QĐ-SYT`,
    getCurrentYearStartYmd(),
    `${new Date().getFullYear()}1231`,
    '48001',
    1,
    1,
    1,
    '',
    '',
    0,
    '',
    '',
    '',
    '',
    '',
    0,
    0,
    '',
    getCurrentYearStartYmd(),
    ''
  ],
  [
    4,
    '90.001',
    '',
    'Khối hồng cầu đậm đặc có lọc bạch cầu 250ml',
    'Túi',
    '250ml',
    'Truyền tĩnh mạch',
    '2.03',
    'Dung dịch truyền',
    'KHC-250ML-01',
    200,
    650000,
    650000,
    'Túi máu tiêu chuẩn 250ml',
    'Viện Huyết học - Truyền máu Trung ương',
    'Việt Nam',
    'Trung tâm Máu Quốc gia',
    `HĐ-MAU-${new Date().getFullYear()}`,
    getCurrentYearStartYmd(),
    `${new Date().getFullYear()}1231`,
    '48001',
    10,
    2,
    5,
    '',
    '',
    0,
    '',
    '',
    '',
    '',
    '',
    0,
    0,
    '',
    getCurrentYearStartYmd(),
    ''
  ]
];

export const THUOC_FIELD_HEURISTICS: Array<[RegExp | string, string]> = [
  [/STT|SO_TT/, 'STT'],
  [/MATHUOC|MAHOATCHAT/, 'MA_THUOC'],
  [/TENHOATCHAT|HOATCHAT/, 'TEN_HOAT_CHAT'],
  [/TENTHUOC|BIETDUOC/, 'TEN_THUOC'],
  [/DONVITINH|DVT/, 'DON_VI_TINH'],
  [/HAMLUONG|NONGDO/, 'HAM_LUONG'],
  [/MADUONGDUNG/, 'MA_DUONG_DUNG'],
  [/DUONGDUNG/, 'DUONG_DUNG'],
  [/DANGBAOCHE|DANGTHUOC/, 'DANG_BAO_CHE'],
  [/SODANGKY|GPNK|SDK/, 'SO_DANG_KY'],
  [/SOLUONG/, 'SO_LUONG'],
  [/DONGIABH|GIABHYT/, 'DON_GIA_BH'],
  [/DONGIA|GIAMUA/, 'DON_GIA'],
  [/QUYCACH|DONGGOI/, 'QUY_CACH'],
  [/NHASX|HANGSX/, 'NHA_SX'],
  [/NUOCSX|XUATXU/, 'NUOC_SX'],
  [/NHATHAU|DONVICUNGUNG/, 'NHA_THAU'],
  [/TTTHAU|GOITHAU/, 'TT_THAU'],
  [/TUNGAYHD/, 'TU_NGAY_HD'],
  [/DENNGAYHD/, 'DEN_NGAY_HD'],
  [/MACSKCBTHUOC/, 'MA_CSKCB_THUOC'],
  [/MACSKCB/, 'MA_CSKCB'],
  [/LOAITHUOC/, 'LOAI_THUOC'],
  [/LOAITHAU/, 'LOAI_THAU'],
  [/HTTHAU|HINHTHUCTHAU/, 'HT_THAU'],
  [/MADVKT/, 'MA_DVKT'],
  [/TCCL/, 'TCCL'],
  [/BOPHANVT/, 'BO_PHAN_VT'],
  [/TENKHOAHOC/, 'TEN_KHOA_HOC'],
  [/NGUONGOC/, 'NGUON_GOC'],
  [/PPCHEBIEN/, 'PP_CHEBIEN'],
  [/MADLNHAP/, 'MA_DL_NHAP'],
  [/MADLCB/, 'MA_DL_CB'],
  [/TLHHCB/, 'TLHH_CB'],
  [/TLHHBQ/, 'TLHH_BQ'],
  [/TUNGAY|BATDAU|APDUNG/, 'TU_NGAY'],
  [/DENNGAY|KETTHUC|HETHAN/, 'DEN_NGAY']
];

export const LOAI_THUOC_LOOKUP: Array<[RegExp, number]> = [
  [/che pham mau|chế phẩm máu/i, 10],
  [/che pham|chế phẩm/i, 2],
  [/vi thuoc|vị thuốc/i, 3],
  [/phong xa|phóng xạ/i, 4],
  [/duoc lieu|dược liệu/i, 7],
  [/mau|máu/i, 9],
  [/tan duoc|tân dược/i, 1],
];
