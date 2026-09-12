import type { DmBpcmItem } from "../../types";
import {
  parseNumberCell,
  parseYmdDate,
  DEFAULT_MA_CSKCB,
  escapeXml,
  getCurrentYearStartYmd,
} from "../shared";
import { validateBpcmData } from "../validators";

/**
 * Chuyển đổi một dòng thô Excel thành đối tượng DmBpcmItem
 * Trả về null nếu dòng hoàn toàn không có MA_KHOA lẫn TEN_KHOA
 */
export function parseBpcmRow(
  rowObj: Record<string, unknown>,
  rowIndex: number,
  autoStt: number,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): DmBpcmItem | null {
  const maKhoa = String(rowObj["MA_KHOA"] ?? "").trim();
  const tenKhoa = String(rowObj["TEN_KHOA"] ?? "").trim();

  // Bỏ qua dòng trống không có mã khoa hoặc tên khoa
  if (!maKhoa && !tenKhoa) {
    return null;
  }

  const stt = parseNumberCell(rowObj["STT"], autoStt);
  const banKham = parseNumberCell(rowObj["BAN_KHAM"], 0);
  const giuongPd = parseNumberCell(rowObj["GIUONG_PD"], 0);
  const giuongTk = parseNumberCell(rowObj["GIUONG_TK"], 0);
  const giuongHstc = parseNumberCell(rowObj["GIUONG_HSTC"], 0);
  const giuongHscc = parseNumberCell(rowObj["GIUONG_HSCC"], 0);
  const tuNgay = parseYmdDate(rowObj["TU_NGAY"]) || getCurrentYearStartYmd();
  const denNgay = parseYmdDate(rowObj["DEN_NGAY"]);
  const rawDenNgay = rowObj["DEN_NGAY"];
  const maCskcb = String(rowObj["MA_CSKCB"] ?? "").trim() || defaultMaCskcb;

  const errors = validateBpcmData({
    maKhoa,
    tenKhoa,
    tuNgay,
    rawDenNgay,
    denNgay,
    maCskcb,
  });

  return {
    id: `bpcm-${Date.now()}-${rowIndex}-${Math.random().toString(36).substring(2, 6)}`,
    stt,
    maKhoa,
    tenKhoa,
    banKham,
    giuongPd,
    giuongTk,
    giuongHstc,
    giuongHscc,
    tuNgay,
    denNgay,
    maCskcb,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Render 1 item DmBpcmItem thành khối XML <DMBOPHANCHUYENMON>
 */
export function renderBpcmItemXml(
  item: DmBpcmItem,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): string {
  const cskcb = item.maCskcb || defaultMaCskcb;
  const denNgayTag = item.denNgay ? `<DEN_NGAY>${item.denNgay}</DEN_NGAY>` : "<DEN_NGAY/>";

  return `    <DMBOPHANCHUYENMON>
      <STT>${item.stt}</STT>
      <MA_KHOA>${escapeXml(item.maKhoa)}</MA_KHOA>
      <TEN_KHOA>${escapeXml(item.tenKhoa)}</TEN_KHOA>
      <BAN_KHAM>${item.banKham}</BAN_KHAM>
      <GIUONG_PD>${item.giuongPd}</GIUONG_PD>
      <GIUONG_TK>${item.giuongTk}</GIUONG_TK>
      <GIUONG_HSTC>${item.giuongHstc}</GIUONG_HSTC>
      <GIUONG_HSCC>${item.giuongHscc}</GIUONG_HSCC>
      <TU_NGAY>${item.tuNgay || getCurrentYearStartYmd()}</TU_NGAY>
      ${denNgayTag}
      <MA_CSKCB>${escapeXml(cskcb)}</MA_CSKCB>
    </DMBOPHANCHUYENMON>`;
}
