import type { DichVuSchemaField } from '../types/dichVuTypes';

export const DICHVU_SCHEMA_FIELDS: DichVuSchemaField[] = [
  {
    key: 'STT',
    label: 'Số thứ tự',
    type: 'number',
    required: true,
    desc: 'Số thứ tự bản ghi (1, 2, 3...)',
    aliases: ['STT', 'SO_THU_TU', 'SỐ THỨ TỰ', 'SOTHUTU', 'NO', 'ORDER', 'TT', 'STT.', 'SO TT', 'SỐ TT', 'NUM'],
    example: '1'
  },
  {
    key: 'MA_DICH_VU',
    label: 'Mã dịch vụ KBCB',
    type: 'string',
    required: true,
    desc: 'Mã dịch vụ khám bệnh, chữa bệnh theo Quyết định số 3176/QĐ-BYT',
    aliases: [
      'MA_DICH_VU', 'MADICHVU', 'MÃ DỊCH VỤ', 'MA_DVKT', 'MADVKT', 'MÃ DVKT',
      'MÃ DỊCH VỤ KỸ THUẬT', 'MA_DV', 'MADV', 'MÃ DV', 'MÃ DANH MỤC DÙNG CHUNG'
    ],
    example: '01.0001.0001'
  },
  {
    key: 'TEN_DICH_VU',
    label: 'Tên dịch vụ kỹ thuật',
    type: 'string',
    required: true,
    desc: 'Tên DVKT được phê duyệt hoặc tên giường bệnh, khám bệnh theo DM dùng chung do Bộ Y tế ban hành',
    aliases: [
      'TEN_DICH_VU', 'TENDICHVU', 'TÊN DỊCH VỤ', 'TEN_DVKT', 'TENDVKT', 'TÊN DVKT',
      'TÊN DỊCH VỤ KỸ THUẬT', 'TÊN DỊCH VỤ BYT', 'TEN_DICH_VU_BYT'
    ],
    example: 'Khám bệnh chuyên khoa Nội'
  },
  {
    key: 'TEN_DVKT_GIA',
    label: 'Tên DV phê duyệt giá',
    type: 'string',
    required: true,
    desc: 'Tên dịch vụ phê duyệt giá tại QĐ/Nghị quyết (chứa mô tả chi tiết [ ] hoặc [gây tê])',
    aliases: [
      'TEN_DVKT_GIA', 'TENDVKTGIA', 'TÊN DVKT GIÁ', 'TÊN DỊCH VỤ PHÊ DUYỆT GIÁ',
      'TÊN DV PHÊ DUYỆT GIÁ', 'TEN_DV_PHE_DUYET_GIA', 'TÊN GIÁ', 'TEN_GIA'
    ],
    example: 'Khám bệnh chuyên khoa Nội [khám theo yêu cầu]'
  },
  {
    key: 'DON_GIA',
    label: 'Đơn giá dịch vụ',
    type: 'number',
    required: true,
    desc: 'Đơn giá dịch vụ KBCB thanh toán BHYT chưa bao gồm chi phí thuốc phóng xạ và chất đánh dấu',
    aliases: [
      'DON_GIA', 'DONGIA', 'ĐƠN GIÁ', 'ĐƠN GIÁ DỊCH VỤ', 'GIA_DV', 'GIÁ DỊCH VỤ',
      'ĐƠN GIÁ BHYT', 'DON_GIA_BHYT', 'DON_GIA_CHUA_PX'
    ],
    example: '42100'
  },
  {
    key: 'QUY_TRINH',
    label: 'Quy trình kỹ thuật (YYYYMMDD_Z)',
    type: 'string',
    required: true,
    desc: 'Ngày và số, ký hiệu QĐ ban hành Quy trình CMKT của CSKCB hoặc Bộ Y tế (định dạng YYYYMMDD_Z)',
    aliases: [
      'QUY_TRINH', 'QUYTRINH', 'QUY TRÌNH', 'QUY TRÌNH KỸ THUẬT', 'QUY_TRINH_KT',
      'QD_QUY_TRINH', 'QĐ QUY TRÌNH', 'QUY TRÌNH CMKT', 'QUY_TRINH_CMKT'
    ],
    example: '20240115_123/QĐ-BV'
  },
  {
    key: 'SO_LUONG_CGKT',
    label: 'Số lượng chuyển giao KT',
    type: 'number',
    required: false,
    desc: 'Số lượng dịch vụ thực hiện theo hợp đồng chuyển giao kỹ thuật',
    aliases: [
      'SO_LUONG_CGKT', 'SOLUONGCGKT', 'SỐ LƯỢNG CGKT', 'SỐ LƯỢNG CHUYỂN GIAO KỸ THUẬT',
      'SO_LUONG_CHUYEN_GIAO', 'SL_CGKT'
    ],
    example: '100'
  },
  {
    key: 'CSKCB_CGKT',
    label: 'Mã CSKCB chuyển giao KT',
    type: 'string',
    required: false,
    desc: 'Mã CSKCB chuyển giao DVKT (nếu có, nhận chuyển giao từ CSKCB khác)',
    aliases: [
      'CSKCB_CGKT', 'CSKCBCGKT', 'MÃ CSKCB CGKT', 'MÃ CSKCB CHUYỂN GIAO', 'MA_CSKCB_CGKT',
      'CO_SO_CHUYEN_GIAO', 'CSKCB CHUYỂN GIAO'
    ],
    example: '01001'
  },
  {
    key: 'CSKCB_CLS',
    label: 'Mã CSKCB cận lâm sàng',
    type: 'string',
    required: false,
    desc: 'Mã CSKCB thực hiện dịch vụ cận lâm sàng (nếu chuyển dịch vụ CLS sang cơ sở khác)',
    aliases: [
      'CSKCB_CLS', 'CSKCBCLS', 'MÃ CSKCB CLS', 'MÃ CSKCB CẬN LÂM SÀNG', 'MA_CSKCB_CLS',
      'CO_SO_CLS', 'CSKCB THỰC HIỆN CLS'
    ],
    example: '01002'
  },
  {
    key: 'QD_DVKT',
    label: 'QĐ phê duyệt DVKT (YYYYMMDD_Z)',
    type: 'string',
    required: true,
    desc: 'Ngày và số, ký hiệu QĐ phê duyệt DMKT tại CSKCB của cấp có thẩm quyền (YYYYMMDD_Z)',
    aliases: [
      'QD_DVKT', 'QDDVKT', 'QĐ DVKT', 'QĐ PHÊ DUYỆT DVKT', 'QD_PHE_DUYET_DVKT',
      'QUYẾT ĐỊNH DVKT', 'QUYET_DINH_DVKT', 'QĐ DANH MỤC KT'
    ],
    example: '20240201_456/QĐ-SYT'
  },
  {
    key: 'QD_PD_GIA',
    label: 'QĐ phê duyệt giá (YYYYMMDD_Z)',
    type: 'string',
    required: true,
    desc: 'Ngày và số, ký hiệu QĐ/Nghị quyết phê duyệt giá thực hiện tại CSKCB (YYYYMMDD_Z)',
    aliases: [
      'QD_PD_GIA', 'QDPDGIA', 'QĐ PHÊ DUYỆT GIÁ', 'QD_PHE_DUYET_GIA', 'QĐ GIÁ',
      'QUYẾT ĐỊNH GIÁ', 'QUYET_DINH_GIA', 'QD_GIA'
    ],
    example: '20240301_789/QĐ-UBND'
  },
  {
    key: 'GHI_CHU',
    label: 'Ghi chú',
    type: 'string',
    required: false,
    desc: 'Ghi chú theo văn bản phê duyệt giá',
    aliases: ['GHI_CHU', 'GHICHU', 'GHI CHÚ', 'NOTE', 'REMARK', 'GHI_CHU_GIA'],
    example: 'Áp dụng theo mức giá hạng II'
  },
  {
    key: 'GIA_THANH_TOAN',
    label: 'Giá thanh toán BHYT',
    type: 'number',
    required: true,
    desc: 'Giá TT BHYT (= DON_GIA nếu không dùng thuốc PX; = DON_GIA + THANH_TIEN_THUOC nếu có thuốc PX/chất đánh dấu)',
    aliases: [
      'GIA_THANH_TOAN', 'GIATHANHTOAN', 'GIÁ THANH TOÁN', 'GIÁ TT BHYT', 'GIA_TT_BHYT',
      'GIÁ THANH TOÁN BHYT', 'TONG_GIA_TT', 'TỔNG GIÁ THANH TOÁN'
    ],
    example: '42100'
  },
  {
    key: 'TU_NGAY',
    label: 'Ngày bắt đầu áp dụng',
    type: 'date',
    required: true,
    desc: 'Thời điểm bắt đầu áp dụng danh mục (định dạng YYYYMMDD)',
    aliases: [
      'TU_NGAY', 'TUNGAY', 'TỪ NGÀY', 'NGÀY HIỆU LỰC', 'NGAY_HIEU_LUC', 'NGÀY BẮT ĐẦU',
      'NGAY_BAT_DAU', 'HIỆU LỰC TỪ', 'HIEU_LUC_TU'
    ],
    example: '20260101'
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
  },
  {
    key: 'MA_CSKCB',
    label: 'Mã CSKCB',
    type: 'string',
    required: true,
    desc: 'Mã cơ sở khám bệnh, chữa bệnh (gồm 5 ký tự số, vd 01929)',
    aliases: [
      'MA_CSKCB', 'MACSKCB', 'MÃ CSKCB', 'MÃ CƠ SỞ KCB', 'MA_CO_SO_KCB', 'MA_CS', 'MA_BV',
      'MÃ BỆNH VIỆN', 'MA_DON_VI', 'MÃ ĐƠN VỊ'
    ],
    example: '01929'
  }
];

export const DICHVU_FIELD_HEURISTICS: Array<[RegExp | string, string]> = [
  [/^STT$|^TT$|^NO$|^ORDER$/i, 'STT'],
  [/MA.*DICH.*VU|MA.*DVKT|MA.*DV/i, 'MA_DICH_VU'],
  [/TEN.*DV.*GIA|TEN.*DVKT.*GIA|PHE.*DUYET.*GIA/i, 'TEN_DVKT_GIA'],
  [/TEN.*DICH.*VU|TEN.*DVKT|TEN.*DV/i, 'TEN_DICH_VU'],
  [/GIA.*THANH.*TOAN|GIA.*TT.*BH|TONG.*GIA/i, 'GIA_THANH_TOAN'],
  [/DON.*GIA.*DV|DON.*GIA|GIA.*DV/i, 'DON_GIA'],
  [/QUY.*TRINH.*KT|QUY.*TRINH.*CM|QUY.*TRINH/i, 'QUY_TRINH'],
  [/SO.*LUONG.*CGKT|SL.*CGKT|SO.*LUONG.*CHUYEN.*GIAO/i, 'SO_LUONG_CGKT'],
  [/CSKCB.*CGKT|MA.*CSKCB.*CGKT|CS.*CHUYEN.*GIAO/i, 'CSKCB_CGKT'],
  [/CSKCB.*CLS|MA.*CSKCB.*CLS|CS.*CAN.*LAM.*SANG/i, 'CSKCB_CLS'],
  [/QD.*DVKT|QD.*PHE.*DUYET.*DVKT|QUYET.*DINH.*DVKT|QD.*DANH.*MUC/i, 'QD_DVKT'],
  [/QD.*PD.*GIA|QD.*GIA|QUYET.*DINH.*GIA|QD.*PHE.*DUYET.*GIA/i, 'QD_PD_GIA'],
  [/GHI.*CHU|NOTE|REMARK/i, 'GHI_CHU'],
  [/TU.*NGAY|NGAY.*HIEU.*LUC|NGAY.*BAT.*DAU/i, 'TU_NGAY'],
  [/DEN.*NGAY|NGAY.*HET.*HIEU.*LUC|NGAY.*KET.*THUC/i, 'DEN_NGAY'],
  [/MA.*CSKCB|MA.*CO.*SO.*KCB|MA.*BV/i, 'MA_CSKCB']
];
