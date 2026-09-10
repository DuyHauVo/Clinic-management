import type { ThietBiSchemaField } from '../types/thietBiTypes';

export const THIETBI_SCHEMA_FIELDS: ThietBiSchemaField[] = [
  {
    key: 'STT',
    label: 'Số thứ tự',
    type: 'number',
    required: true,
    desc: 'Thứ tự bản ghi (1, 2, 3...), không trùng nhau',
    aliases: ['STT', 'SO_THU_TU', 'SỐ THỰC TỰ', 'SỐ THỨ TỰ', 'SOTHUTU', 'NO', 'ORDER', 'TT', 'STT.', 'SO TT', 'SỐ TT', 'NUM'],
    example: '1'
  },
  {
    key: 'MA_VAT_TU',
    label: 'Mã vật tư / TBYT',
    type: 'string',
    required: true,
    desc: 'Mã theo danh mục dùng chung Bộ Y tế ban hành (TT 04/2017 & TT 24/2025)',
    aliases: [
      'MA_VAT_TU', 'MAVATTU', 'MÃ VẬT TƯ', 'MA_VTYT', 'MAVTYT', 'MÃ VTYT',
      'MÃ THIẾT BỊ', 'MÃ TBYT', 'MA_TBYT', 'MATBYT', 'MÃ DANH MỤC DÙNG CHUNG',
      'MA_DMDC', 'MÃ VẬT TƯ Y TẾ', 'MA_VAT_TU_Y_TE', 'MA_VTYT_BYT'
    ],
    example: 'N04.01.001'
  },
  {
    key: 'NHOM_VAT_TU',
    label: 'Nhóm vật tư / TBYT',
    type: 'string',
    required: true,
    desc: 'Tên nhóm thiết bị y tế theo quy định tại TT 04/2017/TT-BYT và TT 24/2025/TT-BYT',
    aliases: [
      'NHOM_VAT_TU', 'NHOMVATTU', 'NHÓM VẬT TƯ', 'TÊN NHÓM VẬT TƯ', 'NHOM_VTYT', 'NHÓM VTYT',
      'NHÓM THIẾT BỊ Y TẾ', 'NHOM_TBYT', 'NHÓM TBYT', 'TEN_NHOM_VAT_TU', 'TÊN NHÓM'
    ],
    example: 'Kim tiêm'
  },
  {
    key: 'TEN_VAT_TU',
    label: 'Tên thương mại vật tư / TBYT',
    type: 'string',
    required: true,
    desc: 'Tên thương mại ghi theo quyết định trúng thầu hoặc hình thức mua sắm khác',
    aliases: [
      'TEN_VAT_TU', 'TENVATTU', 'TÊN VẬT TƯ', 'TÊN THƯƠNG MẠI', 'TEN_THUONG_MAI',
      'TÊN THIẾT BỊ', 'TEN_TBYT', 'TENTBYT', 'TÊN VẬT TƯ Y TẾ', 'TÊN VTYT', 'TEN_VTYT'
    ],
    example: 'Kim dùng cho buồng tiêm 20G x 25mm'
  },
  {
    key: 'MA_HIEU',
    label: 'Mã hiệu',
    type: 'string',
    required: false,
    desc: 'Mã hiệu ghi theo hướng dẫn tại Quyết định số 3176/QĐ-BYT',
    aliases: ['MA_HIEU', 'MAHIEU', 'MÃ HIỆU', 'MODEL', 'MÃ HIỆU TBYT', 'KY_HIEU', 'KÝ HIỆU'],
    example: 'MH-KT-2024'
  },
  {
    key: 'SO_LUU_HANH',
    label: 'Số lưu hành',
    type: 'string',
    required: false,
    desc: 'Số lưu hành của TBYT theo quy định tại Nghị định số 07/2025/NĐ-CP',
    aliases: [
      'SO_LUU_HANH', 'SOLUUHANH', 'SỐ LƯU HÀNH', 'SỐ ĐĂNG KÝ LƯU HÀNH', 'SO_DKLH', 'SODKLH',
      'SỐ ĐKLH', 'SỐ GIẤY PHÉP NHẬP KHẨU', 'SO_GPNK', 'GPNK', 'SỐ CÔNG BỐ'
    ],
    example: '2400012/ĐKLH/BYT'
  },
  {
    key: 'TINHNANG_KT',
    label: 'Tính năng kỹ thuật',
    type: 'string',
    required: false,
    desc: 'Cấu hình, tính năng kỹ thuật cơ bản của TBYT (kích thước, cấu tạo, vật liệu...)',
    aliases: [
      'TINHNANG_KT', 'TINHNANGKT', 'TÍNH NĂNG KỸ THUẬT', 'TÍNH NĂNG KT', 'TINH_NANG_KT',
      'CẤU HÌNH KỸ THUẬT', 'CAU_HINH_KT', 'CAUHINHKT', 'ĐẶC TÍNH KỸ THUẬT', 'DAC_TINH_KT'
    ],
    example: 'Thép không gỉ y tế 304, đầu vát Huber không lõi'
  },
  {
    key: 'QUY_CACH',
    label: 'Quy cách đóng gói',
    type: 'string',
    required: false,
    desc: 'Quy cách đóng gói của TBYT',
    aliases: ['QUY_CACH', 'QUYCACH', 'QUY CÁCH', 'QUY CÁCH ĐÓNG GÓI', 'DONG_GOI', 'ĐÓNG GÓI'],
    example: '1 bộ/túi (Hộp 50 túi)'
  },
  {
    key: 'HANG_SX',
    label: 'Hãng sản xuất',
    type: 'string',
    required: false,
    desc: 'Tên hãng sản xuất thiết bị y tế',
    aliases: [
      'HANG_SX', 'HANGSX', 'HÃNG SẢN XUẤT', 'HÃNG SX', 'NHA_SAN_XUAT', 'NHÀ SẢN XUẤT',
      'CONG_TY_SX', 'CÔNG TY SẢN XUẤT', 'MANUFACTURER'
    ],
    example: 'B. Braun Medical AG'
  },
  {
    key: 'NUOC_SX',
    label: 'Nước sản xuất',
    type: 'string',
    required: false,
    desc: 'Tên quốc gia / nước sản xuất',
    aliases: ['NUOC_SX', 'NUOCSX', 'NƯỚC SẢN XUẤT', 'NƯỚC SX', 'QUOC_GIA_SX', 'QUỐC GIA SX', 'XUẤT XỨ', 'COUNTRY'],
    example: 'Đức'
  },
  {
    key: 'DON_VI_TINH',
    label: 'Đơn vị tính',
    type: 'string',
    required: true,
    desc: 'Đơn vị tính (Cái, Bộ, Chiếc, Hộp, Túi...)',
    aliases: ['DON_VI_TINH', 'DONVITINH', 'ĐƠN VỊ TÍNH', 'ĐVT', 'DVT', 'DON_VI', 'ĐƠN VỊ'],
    example: 'Cái'
  },
  {
    key: 'DON_GIA',
    label: 'Đơn giá trúng thầu',
    type: 'number',
    required: true,
    desc: 'Đơn giá ghi theo kết quả trúng thầu hoặc mua sắm (tự sản xuất: giá phê duyệt)',
    aliases: [
      'DON_GIA', 'DONGIA', 'ĐƠN GIÁ', 'GIÁ TRÚNG THẦU', 'GIA_TRUNG_THAU', 'DON_GIA_TRUNG_THAU',
      'DONGIATRUNGTHAU', 'GIÁ MUA', 'GIA_MUA', 'ĐƠN GIÁ MUA'
    ],
    example: '15000'
  },
  {
    key: 'DON_GIA_BH',
    label: 'Đơn giá thanh toán BHYT',
    type: 'number',
    required: true,
    desc: 'Đơn giá thanh toán BHYT theo Quyết định số 3176/QĐ-BYT',
    aliases: [
      'DON_GIA_BH', 'DONGIABH', 'ĐƠN GIÁ BHYT', 'ĐƠN GIÁ BH', 'GIÁ BHYT', 'GIA_BHYT',
      'GIÁ THANH TOÁN BHYT', 'GIA_THANH_TOAN_BH', 'ĐƠN GIÁ THANH TOÁN BH'
    ],
    example: '15000'
  },
  {
    key: 'TYLE_TT_BH',
    label: 'Tỷ lệ TT BHYT (%)',
    type: 'number',
    required: true,
    desc: 'Tỷ lệ thanh toán BHYT (%), số nguyên dương. Vd: 80 hoặc 100',
    aliases: [
      'TYLE_TT_BH', 'TYLETTBH', 'TỶ LỆ TT BHYT', 'TỶ LỆ THANH TOÁN BHYT', 'TỶ LỆ BHYT',
      'TY_LE_TT_BH', 'TY_LE_BHYT', 'TYLE_BHYT', 'TỶ LỆ THANH TOÁN', 'TY_LE_THANH_TOAN', '% BHYT'
    ],
    example: '100'
  },
  {
    key: 'SO_LUONG',
    label: 'Số lượng trúng thầu',
    type: 'number',
    required: true,
    desc: 'Số lượng theo kết quả trúng thầu hoặc hình thức mua sắm khác',
    aliases: [
      'SO_LUONG', 'SOLUONG', 'SỐ LƯỢNG', 'SỐ LƯỢNG TRÚNG THẦU', 'SO_LUONG_TRUNG_THAU',
      'SO_LUONG_MUA', 'SỐ LƯỢNG MUA', 'QUANTITY'
    ],
    example: '5000'
  },
  {
    key: 'DINH_MUC',
    label: 'Định mức tái sử dụng',
    type: 'number',
    required: false,
    desc: 'Số lần sử dụng của thiết bị y tế tái sử dụng (nếu có, vd: 4)',
    aliases: [
      'DINH_MUC', 'DINHMUC', 'ĐỊNH MỨC', 'ĐỊNH MỨC SỬ DỤNG', 'SỐ LẦN TÁI SỬ DỤNG',
      'SO_LAN_SU_DUNG', 'SO_LAN_TAI_SU_DUNG', 'ĐỊNH MỨC TÁI SỬ DỤNG', 'DINH_MUC_TAI_SD'
    ],
    example: '1'
  },
  {
    key: 'NHA_THAU',
    label: 'Nhà thầu / Cung ứng',
    type: 'string',
    required: false,
    desc: 'Tên nhà thầu hoặc tên đơn vị cung ứng',
    aliases: [
      'NHA_THAU', 'NHATHAU', 'NHÀ THẦU', 'TÊN NHÀ THẦU', 'TEN_NHA_THAU',
      'ĐƠN VỊ CUNG ỨNG', 'DON_VI_CUNG_UNG', 'NHÀ CUNG CẤP', 'SUPPLIER'
    ],
    example: 'Công ty Cổ phần Dược Trang Thiết bị Y tế Hà Nội'
  },
  {
    key: 'TT_THAU',
    label: 'Thông tin thầu',
    type: 'string',
    required: false,
    desc: 'Thông tin thầu ghi theo hướng dẫn tại QĐ 3176/QĐ-BYT (vd: 456/XXXX;G1;N1;2023)',
    aliases: [
      'TT_THAU', 'TTTHAU', 'THÔNG TIN THẦU', 'THONG_TIN_THAU', 'QUYẾT ĐỊNH TRÚNG THẦU',
      'QD_TRUNG_THAU', 'SỐ QUYẾT ĐỊNH THẦU', 'GÓI THẦU', 'GOI_THAU'
    ],
    example: '128/QĐ-BV;G1;N1;2025'
  },
  {
    key: 'TU_NGAY_HD',
    label: 'Từ ngày hợp đồng',
    type: 'date',
    required: false,
    desc: 'Thời điểm có hiệu lực hợp đồng cung ứng (YYYYMMDD)',
    aliases: [
      'TU_NGAY_HD', 'TUNGAYHD', 'TỪ NGÀY HỢP ĐỒNG', 'TỪ NGÀY HĐ', 'TU_NGAY_HOP_DONG',
      'HIEU_LUC_HD_TU', 'HIỆU LỰC HĐ TỪ NGÀY', 'NGÀY KÝ HỢP ĐỒNG', 'NGAY_KY_HD'
    ],
    example: '20250101'
  },
  {
    key: 'DEN_NGAY_HD',
    label: 'Đến ngày hợp đồng',
    type: 'date',
    required: false,
    desc: 'Thời điểm hết hiệu lực hợp đồng cung ứng (YYYYMMDD)',
    aliases: [
      'DEN_NGAY_HD', 'DENNGAYHD', 'ĐẾN NGÀY HỢP ĐỒNG', 'ĐẾN NGÀY HĐ', 'DEN_NGAY_HOP_DONG',
      'HIEU_LUC_HD_DEN', 'HIỆU LỰC HĐ ĐẾN NGÀY', 'NGÀY HẾT HẠN HỢP ĐỒNG'
    ],
    example: '20261231'
  },
  {
    key: 'MA_CSKCB',
    label: 'Mã cơ sở KCB',
    type: 'string',
    required: true,
    desc: 'Mã cơ sở khám bệnh, chữa bệnh (5 ký tự)',
    aliases: [
      'MA_CSKCB', 'MACSKCB', 'MÃ CSKCB', 'MÃ CƠ SỞ KCB', 'MA_CO_SO_KCB', 'MÃ BV', 'MA_BV', 'MABV'
    ],
    example: '01929'
  },
  {
    key: 'LOAI_THAU',
    label: 'Loại thầu',
    type: 'number',
    required: true,
    desc: '1: Thầu TT; 2: Thầu riêng; 3: Tự SX; 4: NĐ 188; 5: NĐ 214; 6: Mua thêm; 7: Điều chuyển',
    aliases: [
      'LOAI_THAU', 'LOAITHAU', 'LOẠI THẦU', 'LOẠI HÌNH MUA SẮM', 'HÌNH THỨC GÓI THẦU',
      'LOAI_HINH_MUA_SAM', 'LOẠI ĐẤU THẦU'
    ],
    example: '1'
  },
  {
    key: 'HT_THAU',
    label: 'Hình thức thầu',
    type: 'number',
    required: false,
    desc: '1..9 (Đấu thầu rộng rãi, hạn chế, chỉ định, chào hàng...). Trống nếu LOAI_THAU in [3,4,5,7]',
    aliases: [
      'HT_THAU', 'HTTHAU', 'HÌNH THỨC THẦU', 'HÌNH THỨC ĐẤU THẦU', 'HINHTHUC_THAU',
      'HINH_THUC_THAU', 'PHƯƠNG THỨC THẦU'
    ],
    example: '1'
  },
  {
    key: 'MA_CSKCB_TBYT',
    label: 'Mã CSKCB chuyển TBYT',
    type: 'string',
    required: false,
    desc: 'Ghi C.XXXXX nếu là nhận điều chuyển TBYT từ CSKCB khác',
    aliases: [
      'MA_CSKCB_TBYT', 'MACSKCBTBYT', 'MÃ CSKCB TBYT', 'MÃ CSKCB ĐIỀU CHUYỂN',
      'CSKCB CHUYỂN ĐI', 'MA_CSKCB_CHUYEN'
    ],
    example: ''
  },
  {
    key: 'TU_NGAY',
    label: 'Ngày bắt đầu áp dụng',
    type: 'date',
    required: true,
    desc: 'Thời điểm bắt đầu áp dụng danh mục (YYYYMMDD)',
    aliases: [
      'TU_NGAY', 'TUNGAY', 'TỪ NGÀY', 'NGÀY HIỆU LỰC', 'NGAY_HIEU_LUC', 'NGÀY BẮT ĐẦU',
      'NGAY_BAT_DAU', 'HIỆU LỰC TỪ', 'HIEU_LUC_TU'
    ],
    example: '20250101'
  },
  {
    key: 'DEN_NGAY',
    label: 'Ngày ngừng áp dụng',
    type: 'date',
    required: false,
    desc: 'Thời điểm ngừng áp dụng (YYYYMMDD, để trống nếu đang hiệu lực)',
    aliases: [
      'DEN_NGAY', 'DENNGAY', 'ĐẾN NGÀY', 'NGÀY HẾT HIỆU LỰC', 'NGAY_HET_HIEU_LUC',
      'NGÀY KẾT THÚC', 'NGAY_KET_THUC', 'HIỆU LỰC ĐẾN', 'HIEU_LUC_DEN'
    ],
    example: ''
  }
];

export const THIETBI_FIELD_HEURISTICS: Array<[RegExp | string, string]> = [
  [/^STT$|^TT$|^NO$|^ORDER$/i, 'STT'],
  [/MA.*VAT.*TU|MA.*TBYT|MA.*VTYT|MA.*DMDC/i, 'MA_VAT_TU'],
  [/NHOM.*VAT.*TU|NHOM.*TBYT|NHOM.*VTYT/i, 'NHOM_VAT_TU'],
  [/TEN.*VAT.*TU|TEN.*THUONG.*MAI|TEN.*TBYT|TEN.*VTYT/i, 'TEN_VAT_TU'],
  [/MA.*HIEU|MODEL|KY.*HIEU/i, 'MA_HIEU'],
  [/SO.*LUU.*HANH|SO.*DKLH|GPNK|GIAY.*PHEP.*NHAP.*KHAU/i, 'SO_LUU_HANH'],
  [/TINH.*NANG.*KT|CAU.*HINH|DAC.*TINH.*KT/i, 'TINHNANG_KT'],
  [/QUY.*CACH|DONG.*GOI/i, 'QUY_CACH'],
  [/HANG.*SX|NHA.*SAN.*XUAT|MANUFACTURER/i, 'HANG_SX'],
  [/NUOC.*SX|QUOC.*GIA.*SX|XUAT.*XU|COUNTRY/i, 'NUOC_SX'],
  [/DON.*VI.*TINH|DVT/i, 'DON_VI_TINH'],
  [/TY.*LE.*TT.*BH|TY.*LE.*BHYT|TY.*LE.*THANH.*TOAN|TY.*LE|%.*BHYT|%.*TT/i, 'TYLE_TT_BH'],
  [/DON.*GIA.*BH|DON.*GIA.*BHYT|GIA.*BHYT|GIA.*BH/i, 'DON_GIA_BH'],
  [/DON.*GIA|GIA.*TRUNG.*THAU|GIA.*MUA/i, 'DON_GIA'],
  [/SO.*LUONG.*TRUNG.*THAU|SO.*LUONG/i, 'SO_LUONG'],
  [/DINH.*MUC|SO.*LAN.*TAI.*SU.*DUNG|TAI.*SU.*DUNG/i, 'DINH_MUC'],
  [/NHA.*THAU|DON.*VI.*CUNG.*UNG|NHA.*CUNG.*CAP/i, 'NHA_THAU'],
  [/TT.*THAU|THONG.*TIN.*THAU|QUYET.*DINH.*THAU|GOI.*THAU/i, 'TT_THAU'],
  [/TU.*NGAY.*HD|TU.*NGAY.*HOP.*DONG|KY.*HD/i, 'TU_NGAY_HD'],
  [/DEN.*NGAY.*HD|DEN.*NGAY.*HOP.*DONG|HET.*HAN.*HD/i, 'DEN_NGAY_HD'],
  [/MA.*CSKCB.*TBYT|CSKCB.*DIEU.*CHUYEN|CSKCB.*CHUYEN/i, 'MA_CSKCB_TBYT'],
  [/MA.*CSKCB|MA.*CO.*SO.*KCB|MA.*BV/i, 'MA_CSKCB'],
  [/LOAI.*THAU|LOAI.*HINH.*MUA.*SAM/i, 'LOAI_THAU'],
  [/HT.*THAU|HINH.*THUC.*THAU|HINH.*THUC.*DAU.*THAU/i, 'HT_THAU'],
  [/TU.*NGAY|NGAY.*HIEU.*LUC|NGAY.*BAT.*DAU/i, 'TU_NGAY'],
  [/DEN.*NGAY|NGAY.*HET.*HIEU.*LUC|NGAY.*KET.*THUC/i, 'DEN_NGAY']
];

export const LOAI_THAU_OPTIONS = [
  { value: 1, label: '1 - Thầu tập trung' },
  { value: 2, label: '2 - Thầu riêng tại cơ sở KCB' },
  { value: 3, label: '3 - Tự sản xuất' },
  { value: 4, label: '4 - Mua sắm theo Điều 49 NĐ 188/2025/NĐ-CP' },
  { value: 5, label: '5 - Mua sắm theo khoản 4 Điều 80 NĐ 214/2025/NĐ-CP' },
  { value: 6, label: '6 - Tùy chọn mua thêm' },
  { value: 7, label: '7 - Nhận điều chuyển thiết bị y tế' }
];

export const HT_THAU_OPTIONS = [
  { value: 1, label: '1 - Đấu thầu rộng rãi' },
  { value: 2, label: '2 - Đấu thầu hạn chế' },
  { value: 3, label: '3 - Chỉ định thầu' },
  { value: 4, label: '4 - Chào hàng cạnh tranh' },
  { value: 5, label: '5 - Mua sắm trực tiếp' },
  { value: 6, label: '6 - TH đặc biệt' },
  { value: 7, label: '7 - Đàm phán giá' },
  { value: 8, label: '8 - Chào giá trực tuyến' },
  { value: 9, label: '9 - Mua sắm trực tuyến' }
];
