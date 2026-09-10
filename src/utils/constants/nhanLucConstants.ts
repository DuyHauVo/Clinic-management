import type { NhanLucSchemaField } from '../types/nhanLucTypes';

export const CHUC_DANH_DICT: Record<string, string> = {
  '1': 'Bác sỹ',
  '2': 'Y sỹ',
  '3': 'Điều dưỡng',
  '4': 'Hộ sinh',
  '5': 'Kỹ thuật y',
  '6': 'Cử nhân tâm lý LS',
  '7': 'Lương y',
  '8': 'Dược sỹ',
  '9': 'Khác'
};

export const VI_TRI_DICT: Record<string, string> = {
  '1': 'Người chịu TN chuyên môn',
  '2': 'Trưởng khoa / Trưởng đơn nguyên',
  '3': 'Chịu TN chuyên môn kiêm Trưởng khoa',
  '4': 'Người đứng đầu / Ủy quyền ký giấy tờ',
  '5': 'Phụ trách khoa (chưa có Trưởng khoa)',
  '6': 'Ủy quyền theo NĐ 96/2023'
};

export const GIOI_TINH_DICT: Record<number, string> = {
  1: 'Nam',
  2: 'Nữ',
  3: 'Chưa xác định'
};

export const THOI_GIAN_DK_DICT: Record<number, string> = {
  1: 'Toàn thời gian',
  2: 'Không toàn thời gian (Bán thời gian)'
};

export const NHANLUC_SCHEMA_FIELDS: NhanLucSchemaField[] = [
  {
    key: 'STT',
    label: 'Số thứ tự',
    type: 'number',
    required: true,
    desc: 'Số thứ tự bản ghi (1, 2, 3...)',
    aliases: ['STT', 'SO_THU_TU', 'SỐ THỨ TỰ', 'SOTHUTU', 'NO', 'TT', 'STT.', 'SO TT', 'SỐ TT', 'NUM']
  },
  {
    key: 'MA_KHOA',
    label: 'Mã khoa / Bàn khám',
    type: 'string',
    required: true,
    desc: 'Mã khoa/bàn khám theo DM BYT (ngăn cách bằng dấu ; nếu nhiều nơi)',
    aliases: ['MA_KHOA', 'MAKHOA', 'MÃ KHOA', 'MÃ KHOA / BÀN KHÁM', 'MÃ KHOA/BÀN KHÁM', 'MA KHOA', 'MÃ KHOA PHÒNG', 'MA_KP', 'MÃ KP']
  },
  {
    key: 'TEN_KHOA',
    label: 'Tên khoa / Bàn khám',
    type: 'string',
    required: true,
    desc: 'Tên khoa/chuyên khoa tương ứng (ngăn cách bằng dấu ; nếu nhiều nơi)',
    aliases: ['TEN_KHOA', 'TENKHOA', 'TÊN KHOA', 'TÊN KHOA / BÀN KHÁM', 'TÊN KHOA/BÀN KHÁM', 'TEN KHOA', 'TÊN KHOA PHÒNG']
  },
  {
    key: 'HO_TEN',
    label: 'Họ và tên',
    type: 'string',
    required: true,
    desc: 'Họ và tên nhân lực y tế (tối đa 250 ký tự)',
    aliases: ['HO_TEN', 'HOTEN', 'HỌ VÀ TÊN', 'HỌ TÊN', 'HO VA TEN', 'HỌ VÀ TÊN NHÂN LỰC', 'TEN_NHAN_VIEN', 'HỌ TÊN BÁC SỸ', 'TÊN BÁC SĨ']
  },
  {
    key: 'GIOI_TINH',
    label: 'Giới tính',
    type: 'number',
    required: true,
    desc: '1: Nam, 2: Nữ, 3: Chưa xác định',
    aliases: ['GIOI_TINH', 'GIOITINH', 'GIỚI TÍNH', 'GIOI TINH', 'PHÁI', 'SEX', 'GENDER']
  },
  {
    key: 'SO_DINH_DANH',
    label: 'Số định danh / CCCD',
    type: 'string',
    required: true,
    desc: 'Số thẻ CCCD hoặc số định danh cá nhân (15 ký tự)',
    aliases: ['SO_DINH_DANH', 'SODINHDANH', 'SỐ ĐỊNH DANH', 'CCCD', 'CMND', 'SỐ CCCD', 'SO CCCD', 'CĂN CƯỚC', 'SO_CCCD', 'MÃ ĐỊNH DANH']
  },
  {
    key: 'CHUCDANH_NN',
    label: 'Chức danh nghề nghiệp',
    type: 'string',
    required: true,
    desc: '1: Bác sỹ, 2: Y sỹ, 3: Điều dưỡng, 4: Hộ sinh, 5: Kỹ thuật y, 6: Cử nhân tâm lý LS, 7: Lương y, 8: Dược sỹ, 9: Khác',
    aliases: ['CHUCDANH_NN', 'CHUCDANHNN', 'CHỨC DANH NGHỀ NGHIỆP', 'CHỨC DANH', 'CHUC_DANH', 'CHUC DANH', 'CHỨC DANH NN', 'CHUCDANH']
  },
  {
    key: 'VI_TRI',
    label: 'Vị trí chuyên môn',
    type: 'string',
    required: false,
    desc: '1: PTCM, 2: Trưởng khoa, 3: PTCM kiêm TK, 4: Người đứng đầu/Ủy quyền ký giấy tờ, 5: Phụ trách khoa, 6: Ủy quyền NĐ 96',
    aliases: ['VI_TRI', 'VITRI', 'VỊ TRÍ', 'VI TRI', 'VỊ TRÍ CÔNG TÁC', 'VỊ TRÍ CHUYÊN MÔN', 'CHỨC VỤ', 'CHUC_VU']
  },
  {
    key: 'MACCHN',
    label: 'Số CCHN / Giấy phép hành nghề',
    type: 'string',
    required: false,
    desc: 'Số, ký hiệu chứng chỉ / giấy phép hành nghề',
    aliases: ['MACCHN', 'MÃ CCHN', 'MA_CCHN', 'SO_CCHN', 'SỐ CCHN', 'SỐ CHỨNG CHỈ HÀNH NGHỀ', 'SO CHUNG CHI HANH NGHE', 'GIẤY PHÉP HÀNH NGHỀ', 'GPHN', 'SO_GPHN']
  },
  {
    key: 'NGAYCAP_CCHN',
    label: 'Ngày cấp CCHN',
    type: 'string',
    required: false,
    desc: 'Định dạng 8 ký tự YYYYMMDD (ví dụ: 20200515)',
    aliases: ['NGAYCAP_CCHN', 'NGÀY CẤP CCHN', 'NGAY_CAP_CCHN', 'NGÀY CẤP', 'NGAY_CAP', 'NGAYCAP', 'NGÀY CẤP GPHN']
  },
  {
    key: 'NOICAP_CCHN',
    label: 'Nơi cấp CCHN',
    type: 'string',
    required: false,
    desc: 'Cơ quan cấp CCHN (Bộ Y tế, Sở Y tế Hà Nội...)',
    aliases: ['NOICAP_CCHN', 'NƠI CẤP CCHN', 'NOI_CAP_CCHN', 'NƠI CẤP', 'NOI_CAP', 'NOICAP', 'CƠ QUAN CẤP', 'NƠI CẤP GPHN']
  },
  {
    key: 'PHAMVI_CM',
    label: 'Phạm vi chuyên môn',
    type: 'string',
    required: false,
    desc: 'Phạm vi hành nghề theo GPHN (cách nhau bởi dấu ; nếu nhiều chuyên khoa)',
    aliases: ['PHAMVI_CM', 'PHẠM VI CHUYÊN MÔN', 'PHAM_VI_CM', 'PHAMVICM', 'PHẠM VI HÀNH NGHỀ', 'CHUYÊN KHOA HÀNH NGHỀ', 'PHAM VI CM']
  },
  {
    key: 'PHAMVI_CMBS',
    label: 'QĐ bổ sung phạm vi CM',
    type: 'string',
    required: false,
    desc: 'Định dạng YYYYMMDD_Z (cách nhau bằng dấu ; nếu nhiều QĐ)',
    aliases: ['PHAMVI_CMBS', 'PHẠM VI CM BỔ SUNG', 'PHAM_VI_CMBS', 'PHAMVICMBS', 'BỔ SUNG PHẠM VI CM', 'QĐ BỔ SUNG PHẠM VI']
  },
  {
    key: 'DVKT_KHAC',
    label: 'Mã DVKT ngoài phạm vi',
    type: 'string',
    required: false,
    desc: '7 ký tự đầu của mã DVKT phân công ngoài phạm vi (cách nhau bằng ;)',
    aliases: ['DVKT_KHAC', 'DỊCH VỤ KỸ THUẬT KHÁC', 'DVKT KHÁC', 'DVKT_KHAC', 'MA_DVKT_KHAC', 'DVKT NGOÀI PHẠM VI']
  },
  {
    key: 'VB_PHANCONG',
    label: 'Văn bản phân công DVKT',
    type: 'string',
    required: false,
    desc: 'Định dạng YYYYMMDD_Z (cách nhau bằng dấu ;)',
    aliases: ['VB_PHANCONG', 'VĂN BẢN PHÂN CÔNG', 'VB PHÂN CÔNG', 'VBPHANCONG', 'VĂN BẢN PHÂN CÔNG THỰC HIỆN']
  },
  {
    key: 'THOIGIAN_DK',
    label: 'Thời gian đăng ký',
    type: 'number',
    required: true,
    desc: '1: Toàn thời gian; 2: Không toàn thời gian (Bán thời gian)',
    aliases: ['THOIGIAN_DK', 'THỜI GIAN ĐĂNG KÝ', 'THOI_GIAN_DK', 'THOIGIANDK', 'HÌNH THỨC LÀM VIỆC', 'LOẠI THỜI GIAN ĐK']
  },
  {
    key: 'THOIGIAN_NGAY',
    label: 'Thời gian làm việc trong ngày',
    type: 'string',
    required: false,
    desc: 'Định dạng HHMM-HHMM hoặc T20800-1500;T30700-1100 (không ghi giờ trực)',
    aliases: ['THOIGIAN_NGAY', 'THỜI GIAN LÀM VIỆC TRONG NGÀY', 'THOI_GIAN_NGAY', 'GIỜ LÀM VIỆC', 'KHUNG GIỜ LÀM VIỆC']
  },
  {
    key: 'THOIGIAN_TUAN',
    label: 'Ngày làm việc trong tuần',
    type: 'string',
    required: false,
    desc: 'Định dạng T2T3T4T5T6, CN...',
    aliases: ['THOIGIAN_TUAN', 'NGÀY LÀM VIỆC TRONG TUẦN', 'THOI_GIAN_TUAN', 'NGÀY LÀM VIỆC', 'CÁC NGÀY TRONG TUẦN']
  },
  {
    key: 'CSKCB_KHAC',
    label: 'Mã CSKCB khác',
    type: 'string',
    required: false,
    desc: 'Mã cơ sở KCB khác nơi người hành nghề đăng ký làm việc (cách nhau bởi ;)',
    aliases: ['CSKCB_KHAC', 'CƠ SỞ KCB KHÁC', 'CSKCB KHÁC', 'MA_CSKCB_KHAC', 'NƠI LÀM VIỆC KHÁC']
  },
  {
    key: 'CSKCB_CGKT',
    label: 'Mã CSKCB chuyển giao KT',
    type: 'string',
    required: false,
    desc: 'Mã CSKCB chuyển giao kỹ thuật (5 ký tự)',
    aliases: ['CSKCB_CGKT', 'CƠ SỞ KCB CGKT', 'CSKCB CHUYỂN GIAO KT', 'MA_CSKCB_CGKT', 'CSKCB_CHUYEN_GIAO']
  },
  {
    key: 'QD_CGKT',
    label: 'QĐ chuyển giao kỹ thuật',
    type: 'string',
    required: false,
    desc: 'Định dạng YYYYMMDDZ',
    aliases: ['QD_CGKT', 'QUYẾT ĐỊNH CGKT', 'QD CGKT', 'QUYẾT ĐỊNH CHUYỂN GIAO KT', 'QĐ CHUYỂN GIAO']
  },
  {
    key: 'TU_NGAY',
    label: 'Từ ngày (Hiệu lực)',
    type: 'string',
    required: true,
    desc: 'Ngày bắt đầu áp dụng định dạng 8 ký tự YYYYMMDD (ví dụ: 20260101)',
    aliases: ['TU_NGAY', 'TỪ NGÀY', 'TU NGAY', 'NGAY_BAT_DAU', 'NGÀY BẮT ĐẦU', 'HIỆU LỰC TỪ', 'NGAY_HIEU_LUC', 'TUNGAY']
  },
  {
    key: 'DEN_NGAY',
    label: 'Đến ngày (Hết hiệu lực)',
    type: 'string',
    required: false,
    desc: 'Ngày kết thúc áp dụng định dạng YYYYMMDD hoặc để trống nếu vô thời hạn',
    aliases: ['DEN_NGAY', 'ĐẾN NGÀY', 'DEN NGAY', 'NGAY_KET_THUC', 'NGÀY KẾT THÚC', 'HẾT HIỆU LỰC', 'DENNGAY']
  },
  {
    key: 'MA_CSKCB',
    label: 'Mã CSKCB',
    type: 'string',
    required: true,
    desc: 'Mã cơ sở khám chữa bệnh (5 ký tự, ví dụ: 01929, 79012)',
    aliases: ['MA_CSKCB', 'MA_CƠ SỞ KCB', 'MÃ CSKCB', 'MÃ CƠ SỞ KCB', 'MACSKCB', 'MÃ CS KCB', 'MÃ BỆNH VIỆN', 'MÃ ĐƠN VỊ']
  }
];

export const NHANLUC_EXCEL_TEMPLATE_SAMPLES: (string | number)[][] = [
  [
    1, 'K01;K02', 'Khoa Khám Bệnh;Khoa Cấp Cứu', 'BS. CKII. Nguyễn Văn An', 1, '001088012345',
    '1', '1', '001234/BYT-CCHN', '20180515', 'Bộ Y Tế', 'Nội khoa; Cấp cứu', '', '', '',
    1, '0730-1630', 'T2T3T4T5T6', '', '', '', '20260101', '', '01929'
  ],
  [
    2, 'K0809', 'Khoa Hồi Sức Tích Cực & Chống Độc', 'ThS. BS. Trần Thị Mai', 2, '001192009876',
    '1', '2', '005678/SYT-CCHN', '20190820', 'Sở Y Tế Hà Nội', 'Hồi sức cấp cứu', '', '', '',
    1, '0730-1630', 'T2T3T4T5T6T7', '', '', '', '20260101', '', '01929'
  ],
  [
    3, 'K01', 'Khoa Khám Bệnh', 'CNĐD. Lê Hoàng Long', 1, '001095004321',
    '3', '', '009876/SYT-CCHN', '20210310', 'Sở Y Tế Hà Nội', 'Điều dưỡng đa khoa', '', '', '',
    1, '0730-1630', 'T2T3T4T5T6', '', '', '', '20260101', '', '01929'
  ]
];
