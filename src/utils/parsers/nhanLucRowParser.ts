import type { DmNhanLucItem } from "../../types";
import {
  parseYmdDate,
  parseGioiTinh,
  parseNumberCell,
  generateUUID,
  normalizeKey,
  DEFAULT_MA_CSKCB,
  escapeXml,
} from "../shared";
import { validateNhanLucData } from "../validators";

const CHUC_DANH_RULES: Array<[string, RegExp]> = [
  ["1", /bacsi|doctor|^bs/],
  ["2", /ys[iy]|^ys/],
  ["3", /dieuduong|nurse|^dd/],
  ["4", /hosinh|^nhs/],
  ["5", /kythuat|^kt[vy]/],
  ["6", /tamly/],
  ["7", /luongy|luongduoc/],
  ["8", /duoc|pharmacist|^ds/],
];

/**
 * Parse chức danh nghề nghiệp (1..9)
 */
export function parseChucDanhNn(val: unknown): string {
  const rawCd = String(val ?? "").trim();
  if (/^[1-9]$/.test(rawCd)) return rawCd;
  if (!rawCd) return "9";

  const norm = normalizeKey(rawCd);
  for (const [code, pattern] of CHUC_DANH_RULES) {
    if (pattern.test(norm)) return code;
  }
  return "9";
}

/**
 * Parse thời gian đăng ký: 1 (Toàn thời gian), 2 (Bán thời gian)
 */
export function parseThoiGianDk(val: unknown): number {
  const num = Number(val);
  if ([1, 2].includes(num)) return num;

  const tgStr = normalizeKey(String(val ?? ""));
  return tgStr.includes("ban") || tgStr.includes("part") ? 2 : 1;
}

/**
 * Chuyển đổi một dòng thô Excel thành đối tượng DmNhanLucItem
 * Trả về null nếu dòng hoàn toàn không có HO_TEN lẫn SO_DINH_DANH
 */
export function parseNhanLucRow(
  rowObj: Record<string, unknown>,
  _rowIndex: number,
  autoStt: number,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): DmNhanLucItem | null {
  const hoTen = String(rowObj["HO_TEN"] ?? "").trim();
  const soDinhDanh = String(rowObj["SO_DINH_DANH"] ?? "").trim();

  // Bỏ qua dòng trống không có họ tên hoặc số định danh
  if (!hoTen && !soDinhDanh) {
    return null;
  }

  const stt = parseNumberCell(rowObj["STT"], autoStt);
  const maKhoa = String(rowObj["MA_KHOA"] ?? "").trim();
  const tenKhoa = String(rowObj["TEN_KHOA"] ?? "").trim();
  const gioiTinh = parseGioiTinh(rowObj["GIOI_TINH"]);
  const chucDanhNn = parseChucDanhNn(rowObj["CHUCDANH_NN"]);

  const viTri = rowObj["VI_TRI"] ? String(rowObj["VI_TRI"]).trim() : undefined;
  const macchn = rowObj["MACCHN"] ? String(rowObj["MACCHN"]).trim() : undefined;
  const ngaycapCchn = parseYmdDate(rowObj["NGAYCAP_CCHN"]);
  const noicapCchn = rowObj["NOICAP_CCHN"] ? String(rowObj["NOICAP_CCHN"]).trim() : undefined;
  const phamviCm = rowObj["PHAMVI_CM"] ? String(rowObj["PHAMVI_CM"]).trim() : undefined;
  const phamviCmbs = rowObj["PHAMVI_CMBS"] ? String(rowObj["PHAMVI_CMBS"]).trim() : undefined;
  const dvktKhac = rowObj["DVKT_KHAC"] ? String(rowObj["DVKT_KHAC"]).trim() : undefined;
  const vbPhancong = rowObj["VB_PHANCONG"] ? String(rowObj["VB_PHANCONG"]).trim() : undefined;

  const thoigianDk = parseThoiGianDk(rowObj["THOIGIAN_DK"]);
  const thoigianNgay = rowObj["THOIGIAN_NGAY"] ? String(rowObj["THOIGIAN_NGAY"]).trim() : undefined;
  const thoigianTuan = rowObj["THOIGIAN_TUAN"] ? String(rowObj["THOIGIAN_TUAN"]).trim() : undefined;
  const cskcbKhac = rowObj["CSKCB_KHAC"] ? String(rowObj["CSKCB_KHAC"]).trim() : undefined;
  const cskcbCgkt = rowObj["CSKCB_CGKT"] ? String(rowObj["CSKCB_CGKT"]).trim() : undefined;
  const qdCgkt = rowObj["QD_CGKT"] ? String(rowObj["QD_CGKT"]).trim() : undefined;

  const tuNgay = parseYmdDate(rowObj["TU_NGAY"]) || "";
  const denNgay = parseYmdDate(rowObj["DEN_NGAY"]);
  const maCskcb = String(rowObj["MA_CSKCB"] || defaultMaCskcb).trim() || defaultMaCskcb;

  const rowErrors = validateNhanLucData({
    maKhoa,
    tenKhoa,
    hoTen,
    soDinhDanh,
    chucDanhNn,
    tuNgay,
  });

  return {
    id: `nl_${generateUUID()}`,
    stt,
    maKhoa,
    tenKhoa,
    hoTen,
    gioiTinh,
    soDinhDanh,
    chucDanhNn,
    viTri,
    macchn,
    ngaycapCchn: ngaycapCchn || undefined,
    noicapCchn,
    phamviCm,
    phamviCmbs,
    dvktKhac,
    vbPhancong,
    thoigianDk,
    thoigianNgay,
    thoigianTuan,
    cskcbKhac,
    cskcbCgkt,
    qdCgkt,
    tuNgay,
    denNgay: denNgay || undefined,
    maCskcb,
    isValid: rowErrors.length === 0,
    errors: rowErrors,
  };
}

/**
 * Render 1 item DmNhanLucItem thành khối XML <DMNHANLUCKBCB>
 */
export function renderNhanLucItemXml(
  item: DmNhanLucItem,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): string {
  const cskcb = item.maCskcb || defaultMaCskcb;

  return `    <DMNHANLUCKBCB>
      <STT>${item.stt}</STT>
      <MA_KHOA>${escapeXml(item.maKhoa)}</MA_KHOA>
      <TEN_KHOA>${escapeXml(item.tenKhoa)}</TEN_KHOA>
      <HO_TEN>${escapeXml(item.hoTen)}</HO_TEN>
      <GIOI_TINH>${item.gioiTinh}</GIOI_TINH>
      <SO_DINH_DANH>${escapeXml(item.soDinhDanh)}</SO_DINH_DANH>
      <CHUCDANH_NN>${escapeXml(item.chucDanhNn)}</CHUCDANH_NN>
      <VI_TRI>${escapeXml(item.viTri || "")}</VI_TRI>
      <MACCHN>${escapeXml(item.macchn || "")}</MACCHN>
      <NGAYCAP_CCHN>${escapeXml(item.ngaycapCchn || "")}</NGAYCAP_CCHN>
      <NOICAP_CCHN>${escapeXml(item.noicapCchn || "")}</NOICAP_CCHN>
      <PHAMVI_CM>${escapeXml(item.phamviCm || "")}</PHAMVI_CM>
      <PHAMVI_CMBS>${escapeXml(item.phamviCmbs || "")}</PHAMVI_CMBS>
      <DVKT_KHAC>${escapeXml(item.dvktKhac || "")}</DVKT_KHAC>
      <VB_PHANCONG>${escapeXml(item.vbPhancong || "")}</VB_PHANCONG>
      <THOIGIAN_DK>${item.thoigianDk}</THOIGIAN_DK>
      <THOIGIAN_NGAY>${escapeXml(item.thoigianNgay || "")}</THOIGIAN_NGAY>
      <THOIGIAN_TUAN>${escapeXml(item.thoigianTuan || "")}</THOIGIAN_TUAN>
      <CSKCB_KHAC>${escapeXml(item.cskcbKhac || "")}</CSKCB_KHAC>
      <CSKCB_CGKT>${escapeXml(item.cskcbCgkt || "")}</CSKCB_CGKT>
      <QD_CGKT>${escapeXml(item.qdCgkt || "")}</QD_CGKT>
      <TU_NGAY>${escapeXml(item.tuNgay || "")}</TU_NGAY>
      <DEN_NGAY>${escapeXml(item.denNgay || "")}</DEN_NGAY>
      <MA_CSKCB>${escapeXml(cskcb)}</MA_CSKCB>
    </DMNHANLUCKBCB>`;
}
