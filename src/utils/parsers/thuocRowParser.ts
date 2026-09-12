import type { DmThuocItem } from "../types/thuocTypes";
import { LOAI_THUOC_LOOKUP } from "../constants/thuocConstants";
import {
  parseNumberCell,
  parseYmdDate,
  DEFAULT_MA_CSKCB,
  escapeXml,
  getCurrentYearStartYmd,
} from "../shared";
import { validateThuocData } from "../validators";

/**
 * Phân tích loại thuốc (1..10) từ mã số hoặc văn bản tiếng Việt
 */
export function parseLoaiThuoc(val: unknown): number {
  const num = parseNumberCell(val, 0);
  if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(num)) return num;

  const str = String(val ?? "");
  const match = LOAI_THUOC_LOOKUP.find(([reg]) => reg.test(str));
  return match ? match[1] : 1;
}

/**
 * Chuyển đổi một dòng dữ liệu thô (rowObj) thành DmThuocItem chuẩn và thực hiện validate
 */
export function parseThuocRow(
  rowObj: Record<string, unknown>,
  rowIndex: number,
  autoStt: number,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): DmThuocItem {
  const stt = parseNumberCell(rowObj["STT"], autoStt);
  const maThuoc = String(rowObj["MA_THUOC"] ?? "").trim();
  const tenHoatChat = rowObj["TEN_HOAT_CHAT"]
    ? String(rowObj["TEN_HOAT_CHAT"]).trim()
    : undefined;
  const tenThuoc = String(rowObj["TEN_THUOC"] ?? "").trim();
  const donViTinh = String(rowObj["DON_VI_TINH"] ?? "").trim();
  const hamLuong = rowObj["HAM_LUONG"]
    ? String(rowObj["HAM_LUONG"]).trim()
    : undefined;
  const duongDung = String(rowObj["DUONG_DUNG"] ?? "").trim();
  const maDuongDung = String(rowObj["MA_DUONG_DUNG"] ?? "").trim();
  const dangBaoChe = rowObj["DANG_BAO_CHE"]
    ? String(rowObj["DANG_BAO_CHE"]).trim()
    : undefined;
  const soDangKy = String(rowObj["SO_DANG_KY"] ?? "").trim();
  const soLuong =
    rowObj["SO_LUONG"] !== undefined && rowObj["SO_LUONG"] !== ""
      ? parseNumberCell(rowObj["SO_LUONG"])
      : undefined;
  const donGia = parseNumberCell(rowObj["DON_GIA"]);
  const donGiaBh =
    rowObj["DON_GIA_BH"] !== undefined && rowObj["DON_GIA_BH"] !== ""
      ? parseNumberCell(rowObj["DON_GIA_BH"])
      : donGia;
  const quyCach = rowObj["QUY_CACH"]
    ? String(rowObj["QUY_CACH"]).trim()
    : undefined;
  const nhaSx = rowObj["NHA_SX"]
    ? String(rowObj["NHA_SX"]).trim()
    : undefined;
  const nuocSx = rowObj["NUOC_SX"]
    ? String(rowObj["NUOC_SX"]).trim()
    : undefined;
  const nhaThau = rowObj["NHA_THAU"]
    ? String(rowObj["NHA_THAU"]).trim()
    : undefined;
  const ttThau = rowObj["TT_THAU"]
    ? String(rowObj["TT_THAU"]).trim()
    : undefined;
  const tuNgayHd = parseYmdDate(rowObj["TU_NGAY_HD"]);
  const denNgayHd = parseYmdDate(rowObj["DEN_NGAY_HD"]);
  const maCskcb =
    String(rowObj["MA_CSKCB"] ?? defaultMaCskcb).trim() || defaultMaCskcb;

  const loaiThuoc = parseLoaiThuoc(rowObj["LOAI_THUOC"]);

  const loaiThau =
    rowObj["LOAI_THAU"] !== undefined && rowObj["LOAI_THAU"] !== ""
      ? parseNumberCell(rowObj["LOAI_THAU"])
      : undefined;
  const htThau =
    rowObj["HT_THAU"] !== undefined && rowObj["HT_THAU"] !== ""
      ? parseNumberCell(rowObj["HT_THAU"])
      : undefined;
  const maDvkt = rowObj["MA_DVKT"]
    ? String(rowObj["MA_DVKT"]).trim()
    : undefined;
  const tccl = rowObj["TCCL"] ? String(rowObj["TCCL"]).trim() : undefined;
  const boPhanVt =
    rowObj["BO_PHAN_VT"] !== undefined && rowObj["BO_PHAN_VT"] !== ""
      ? parseNumberCell(rowObj["BO_PHAN_VT"])
      : undefined;
  const tenKhoaHoc = rowObj["TEN_KHOA_HOC"]
    ? String(rowObj["TEN_KHOA_HOC"]).trim()
    : undefined;
  const nguonGoc = rowObj["NGUON_GOC"]
    ? String(rowObj["NGUON_GOC"]).trim()
    : undefined;
  const ppChebien = rowObj["PP_CHEBIEN"]
    ? String(rowObj["PP_CHEBIEN"]).trim()
    : undefined;
  const maDlNhap = rowObj["MA_DL_NHAP"]
    ? String(rowObj["MA_DL_NHAP"]).trim()
    : undefined;
  const maDlCb = rowObj["MA_DL_CB"]
    ? String(rowObj["MA_DL_CB"]).trim()
    : undefined;
  const tlhhCb =
    rowObj["TLHH_CB"] !== undefined && rowObj["TLHH_CB"] !== ""
      ? parseNumberCell(rowObj["TLHH_CB"])
      : undefined;
  const tlhhBq =
    rowObj["TLHH_BQ"] !== undefined && rowObj["TLHH_BQ"] !== ""
      ? parseNumberCell(rowObj["TLHH_BQ"])
      : undefined;
  const maCskcbThuoc = rowObj["MA_CSKCB_THUOC"]
    ? String(rowObj["MA_CSKCB_THUOC"]).trim()
    : undefined;

  const tuNgay = parseYmdDate(rowObj["TU_NGAY"]) || getCurrentYearStartYmd();
  const denNgay = parseYmdDate(rowObj["DEN_NGAY"]);

  // Validate
  const errors = validateThuocData({
    maThuoc,
    tenThuoc,
    donViTinh,
    soDangKy,
    donGia,
    tuNgay,
    rawDenNgay: rowObj["DEN_NGAY"],
    denNgay,
  });

  return {
    id: `thuoc-${Date.now()}-${rowIndex}-${Math.random().toString(36).substring(2, 6)}`,
    stt,
    maThuoc,
    tenHoatChat,
    tenThuoc,
    donViTinh,
    hamLuong,
    duongDung,
    maDuongDung,
    dangBaoChe,
    soDangKy,
    soLuong,
    donGia,
    donGiaBh,
    quyCach,
    nhaSx,
    nuocSx,
    nhaThau,
    ttThau,
    tuNgayHd,
    denNgayHd,
    maCskcb,
    loaiThuoc,
    loaiThau,
    htThau,
    maDvkt,
    tccl,
    boPhanVt,
    tenKhoaHoc,
    nguonGoc,
    ppChebien,
    maDlNhap,
    maDlCb,
    tlhhCb,
    tlhhBq,
    maCskcbThuoc,
    tuNgay,
    denNgay,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Render 1 item DmThuocItem thành khối XML <DMTHUOCMAUCHEPHAMMAU>
 */
export function renderThuocItemXml(item: DmThuocItem): string {
  return `    <DMTHUOCMAUCHEPHAMMAU>
      <STT>${item.stt}</STT>
      <MA_THUOC>${escapeXml(item.maThuoc)}</MA_THUOC>
      <TEN_HOAT_CHAT>${escapeXml(item.tenHoatChat || "")}</TEN_HOAT_CHAT>
      <TEN_THUOC>${escapeXml(item.tenThuoc)}</TEN_THUOC>
      <DON_VI_TINH>${escapeXml(item.donViTinh)}</DON_VI_TINH>
      <HAM_LUONG>${escapeXml(item.hamLuong || "")}</HAM_LUONG>
      <DUONG_DUNG>${escapeXml(item.duongDung || "")}</DUONG_DUNG>
      <MA_DUONG_DUNG>${escapeXml(item.maDuongDung)}</MA_DUONG_DUNG>
      <DANG_BAO_CHE>${escapeXml(item.dangBaoChe || "")}</DANG_BAO_CHE>
      <SO_DANG_KY>${escapeXml(item.soDangKy)}</SO_DANG_KY>
      <SO_LUONG>${item.soLuong !== undefined ? item.soLuong : ""}</SO_LUONG>
      <DON_GIA>${item.donGia}</DON_GIA>
      <DON_GIA_BH>${item.donGiaBh}</DON_GIA_BH>
      <QUY_CACH>${escapeXml(item.quyCach || "")}</QUY_CACH>
      <NHA_SX>${escapeXml(item.nhaSx || "")}</NHA_SX>
      <NUOC_SX>${escapeXml(item.nuocSx || "")}</NUOC_SX>
      <NHA_THAU>${escapeXml(item.nhaThau || "")}</NHA_THAU>
      <TT_THAU>${escapeXml(item.ttThau || "")}</TT_THAU>
      <TU_NGAY_HD>${escapeXml(item.tuNgayHd || "")}</TU_NGAY_HD>
      <DEN_NGAY_HD>${escapeXml(item.denNgayHd || "")}</DEN_NGAY_HD>
      <MA_CSKCB>${escapeXml(item.maCskcb)}</MA_CSKCB>
      <LOAI_THUOC>${item.loaiThuoc}</LOAI_THUOC>
      <LOAI_THAU>${item.loaiThau !== undefined ? item.loaiThau : ""}</LOAI_THAU>
      <HT_THAU>${item.htThau !== undefined ? item.htThau : ""}</HT_THAU>
      <MA_DVKT>${escapeXml(item.maDvkt || "")}</MA_DVKT>
      <TCCL>${escapeXml(item.tccl || "")}</TCCL>
      <BO_PHAN_VT>${item.boPhanVt !== undefined ? item.boPhanVt : ""}</BO_PHAN_VT>
      <TEN_KHOA_HOC>${escapeXml(item.tenKhoaHoc || "")}</TEN_KHOA_HOC>
      <NGUON_GOC>${escapeXml(item.nguonGoc || "")}</NGUON_GOC>
      <PP_CHEBIEN>${escapeXml(item.ppChebien || "")}</PP_CHEBIEN>
      <MA_DL_NHAP>${escapeXml(item.maDlNhap || "")}</MA_DL_NHAP>
      <MA_DL_CB>${escapeXml(item.maDlCb || "")}</MA_DL_CB>
      <TLHH_CB>${item.tlhhCb !== undefined ? item.tlhhCb : ""}</TLHH_CB>
      <TLHH_BQ>${item.tlhhBq !== undefined ? item.tlhhBq : ""}</TLHH_BQ>
      <MA_CSKCB_THUOC>${escapeXml(item.maCskcbThuoc || "")}</MA_CSKCB_THUOC>
      <TU_NGAY>${escapeXml(item.tuNgay)}</TU_NGAY>
      <DEN_NGAY>${escapeXml(item.denNgay || "")}</DEN_NGAY>
    </DMTHUOCMAUCHEPHAMMAU>`;
}
