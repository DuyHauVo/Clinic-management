import type { TbytThdvSchemaField } from '../types/tbyttHdvTypes';

export const TBYTTHDV_SCHEMA_FIELDS: TbytThdvSchemaField[] = [
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
    key: 'TEN_TB',
    label: 'Tên thiết bị y tế',
    type: 'string',
    required: true,
    desc: 'Tên thiết bị y tế thực hiện dịch vụ kỹ thuật',
    aliases: [
      'TEN_TB', 'TENTB', 'TÊN THIẾT BỊ', 'TEN_THIET_BI', 'TÊN THIẾT BỊ Y TẾ',
      'TENTHIETBI', 'TEN_TBYT', 'TÊN TBYT', 'TBYT', 'TÊN MÁY', 'TEN_MAY'
    ],
    example: 'Máy thở đa năng kèm khí nén'
  },
  {
    key: 'KY_HIEU',
    label: 'Model / Ký hiệu',
    type: 'string',
    required: false,
    desc: 'Model / Ký hiệu của thiết bị y tế do nhà sản xuất quy định',
    aliases: [
      'KY_HIEU', 'KYHIEU', 'KÝ HIỆU', 'MODEL', 'MÃ HIỆU', 'MA_HIEU',
      'MODEL_MAY', 'KÝ HIỆU THIẾT BỊ', 'KY_HIEU_TB'
    ],
    example: 'Servo-air'
  },
  {
    key: 'CONGTY_SX',
    label: 'Công ty sản xuất',
    type: 'string',
    required: false,
    desc: 'Tên công ty / hãng sản xuất thiết bị y tế',
    aliases: [
      'CONGTY_SX', 'CONGTYSX', 'CÔNG TY SẢN XUẤT', 'HÃNG SẢN XUẤT', 'HANG_SX',
      'HANGSX', 'NHÀ SẢN XUẤT', 'NHA_SX', 'CONG_TY_SX'
    ],
    example: 'Maquet Critical Care AB'
  },
  {
    key: 'NUOC_SX',
    label: 'Nước sản xuất',
    type: 'string',
    required: false,
    desc: 'Tên quốc gia sản xuất thiết bị y tế',
    aliases: [
      'NUOC_SX', 'NUOCSX', 'NƯỚC SẢN XUẤT', 'XUẤT XỨ', 'XUAT_XU',
      'QUỐC GIA SX', 'QUOC_GIA_SX', 'NƯỚC SX'
    ],
    example: 'Thụy Điển'
  },
  {
    key: 'NAM_SX',
    label: 'Năm sản xuất',
    type: 'number',
    required: false,
    desc: 'Năm sản xuất của thiết bị y tế (định dạng 4 chữ số: YYYY)',
    aliases: [
      'NAM_SX', 'NAMSX', 'NĂM SẢN XUẤT', 'NĂM SX', 'YEAR_MANUFACTURE'
    ],
    example: '2020'
  },
  {
    key: 'NAM_SD',
    label: 'Năm đưa vào sử dụng',
    type: 'number',
    required: false,
    desc: 'Năm bắt đầu đưa thiết bị y tế vào sử dụng tại CSKCB (YYYY)',
    aliases: [
      'NAM_SD', 'NAMSD', 'NĂM SỬ DỤNG', 'NĂM ĐƯA VÀO SỬ DỤNG', 'NĂM BẮT ĐẦU SỬ DỤNG',
      'NĂM SD', 'YEAR_USED'
    ],
    example: '2021'
  },
  {
    key: 'MA_MAY',
    label: 'Mã máy theo QĐ 3176',
    type: 'string',
    required: true,
    desc: 'Mã máy thực hiện dịch vụ cận lâm sàng, phẫu thuật, thủ thuật theo hướng dẫn QĐ số 3176/QĐ-BYT',
    aliases: [
      'MA_MAY', 'MAMAY', 'MÃ MÁY', 'MÃ THIẾT BỊ', 'MA_THIET_BI', 'MÃ MÁY CLS',
      'MA_MAY_CLS', 'MÃ MÁY THEO QĐ 3176', 'MA_MAY_3176'
    ],
    example: '79001.01.001'
  },
  {
    key: 'SO_LUU_HANH',
    label: 'Số lưu hành (NĐ 07/2025)',
    type: 'string',
    required: false,
    desc: 'Số lưu hành hoặc số GPNK của TBYT theo Nghị định số 07/2025/NĐ-CP',
    aliases: [
      'SO_LUU_HANH', 'SOLUUHANH', 'SỐ LƯU HÀNH', 'SỐ ĐK LƯU HÀNH', 'SO_DK_LUU_HANH',
      'SỐ ĐĂNG KÝ LƯU HÀNH', 'GPNK', 'SỐ GPNK', 'SO_GPNK'
    ],
    example: '2100123/ĐKLH/BYT-TB'
  },
  {
    key: 'HD_TU',
    label: 'Hiệu lực HĐ thuê/mượn từ ngày',
    type: 'date',
    required: false,
    desc: 'Thời điểm có hiệu lực trên hợp đồng thuê, mua trả chậm, trả dần hoặc mượn (YYYYMMDD)',
    aliases: [
      'HD_TU', 'HDTU', 'HỢP ĐỒNG TỪ', 'HỢP ĐỒNG TỪ NGÀY', 'HD_TU_NGAY',
      'NGÀY BẮT ĐẦU HỢP ĐỒNG', 'THỜI HẠN HĐ TỪ'
    ],
    example: '20220101'
  },
  {
    key: 'HD_DEN',
    label: 'Hiệu lực HĐ thuê/mượn đến ngày',
    type: 'date',
    required: false,
    desc: 'Thời điểm hết hiệu lực trên hợp đồng thuê, mua trả chậm, trả dần hoặc mượn (YYYYMMDD)',
    aliases: [
      'HD_DEN', 'HDDEN', 'HỢP ĐỒNG ĐẾN', 'HỢP ĐỒNG ĐẾN NGÀY', 'HD_DEN_NGAY',
      'NGÀY HẾT HẠN HỢP ĐỒNG', 'THỜI HẠN HĐ ĐẾN'
    ],
    example: '20261231'
  },
  {
    key: 'TU_NGAY',
    label: 'Từ ngày áp dụng (YYYYMMDD)',
    type: 'date',
    required: true,
    desc: 'Thời điểm bắt đầu đề nghị áp dụng thanh toán BHYT (định dạng YYYYMMDD)',
    aliases: [
      'TU_NGAY', 'TUNGAY', 'TỪ NGÀY', 'NGÀY BẮT ĐẦU', 'NGAY_BAT_DAU',
      'NGÀY ÁP DỤNG', 'NGAY_AP_DUNG', 'TỪ NGÀY ÁP DỤNG'
    ],
    example: '20240101'
  },
  {
    key: 'DEN_NGAY',
    label: 'Đến ngày áp dụng (YYYYMMDD)',
    type: 'date',
    required: false,
    desc: 'Thời điểm hết hiệu lực kiểm định hoặc ngừng áp dụng (YYYYMMDD). Để trống nếu đang áp dụng',
    aliases: [
      'DEN_NGAY', 'DENNGAY', 'ĐẾN NGÀY', 'NGÀY KẾT THÚC', 'NGAY_KET_THUC',
      'HẾT HẠN', 'NGÀY HẾT HẠN', 'ĐẾN NGÀY ÁP DỤNG'
    ],
    example: '20271231'
  },
  {
    key: 'MA_CSKCB',
    label: 'Mã cơ sở KCB',
    type: 'string',
    required: true,
    desc: 'Mã định danh cơ sở khám bệnh, chữa bệnh do BHXH Việt Nam cấp (5 chữ số)',
    aliases: [
      'MA_CSKCB', 'MACSKCB', 'MÃ CSKCB', 'MÃ CƠ SỞ KCB', 'MA_CO_SO_KCB',
      'MÃ CƠ SỞ KHÁM CHỮA BỆNH', 'MÃ BỆNH VIỆN', 'MA_BV', 'MABV'
    ],
    example: '01929'
  }
];

export const TBYTTHDV_FIELD_HEURISTICS: Array<[RegExp | string, string]> = [
  [/^stt$|^tt$|^order$|^no$/i, 'STT'],
  [/ten[_\s]?tb|ten[_\s]?thiet[_\s]?bi|ten[_\s]?tbyt|ten[_\s]?may/i, 'TEN_TB'],
  [/ky[_\s]?hieu|model|ma[_\s]?hieu|model[_\s]?may/i, 'KY_HIEU'],
  [/cong[_\s]?ty[_\s]?sx|hang[_\s]?sx|nha[_\s]?sx|manufacturer/i, 'CONGTY_SX'],
  [/nuoc[_\s]?sx|xuat[_\s]?xu|quoc[_\s]?gia|origin|country/i, 'NUOC_SX'],
  [/nam[_\s]?sx|year[_\s]?manu/i, 'NAM_SX'],
  [/nam[_\s]?sd|nam[_\s]?su[_\s]?dung|nam[_\s]?bat[_\s]?dau/i, 'NAM_SD'],
  [/ma[_\s]?may|ma[_\s]?cls|3176/i, 'MA_MAY'],
  [/so[_\s]?luu[_\s]?hanh|luu[_\s]?hanh|gpnk|so[_\s]?dk|07\/2025/i, 'SO_LUU_HANH'],
  [/hd[_\s]?tu|hop[_\s]?dong[_\s]?tu|thue[_\s]?tu/i, 'HD_TU'],
  [/hd[_\s]?den|hop[_\s]?dong[_\s]?den|thue[_\s]?den/i, 'HD_DEN'],
  [/tu[_\s]?ngay|ngay[_\s]?bat[_\s]?dau|from[_\s]?date|start[_\s]?date/i, 'TU_NGAY'],
  [/den[_\s]?ngay|ngay[_\s]?ket[_\s]?thuc|to[_\s]?date|end[_\s]?date/i, 'DEN_NGAY'],
  [/ma[_\s]?cskcb|ma[_\s]?co[_\s]?so|ma[_\s]?bv|hospital[_\s]?code/i, 'MA_CSKCB']
];

