import type { DmThietBiItem } from "../types/thietBiTypes";
import {
  parseNumberCell,
  parseYmdDate,
  DEFAULT_MA_CSKCB,
  escapeXml,
  getTodayYmd,
} from "../shared";
import { validateThietBiData } from "../validators";

/**
 * Chuyển đổi một dòng thô Excel thành đối tượng DmThietBiItem
 * Trả về null nếu dòng hoàn toàn không có MA_VAT_TU lẫn TEN_VAT_TU
 */
export function parseThietBiRow(
  rowObj: Record<string, unknown>,
  rowIndex: number,
  autoStt: number,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): DmThietBiItem | null {
  const maVatTu = String(rowObj["MA_VAT_TU"] ?? "").trim();
  const tenVatTu = String(rowObj["TEN_VAT_TU"] ?? "").trim();
  const nhomVatTu = String(rowObj["NHOM_VAT_TU"] ?? "").trim();

  // Bỏ qua dòng trống không có mã hoặc tên
  if (!maVatTu && !tenVatTu) {
    return null;
  }

  const stt = parseNumberCell(rowObj["STT"], autoStt);
  const maHieu = String(rowObj["MA_HIEU"] ?? "").trim();
  const soLuuHanh = String(rowObj["SO_LUU_HANH"] ?? "").trim();
  const tinhnangKt = String(rowObj["TINHNANG_KT"] ?? "").trim();
  const quyCach = String(rowObj["QUY_CACH"] ?? "").trim();
  const hangSx = String(rowObj["HANG_SX"] ?? "").trim();
  const nuocSx = String(rowObj["NUOC_SX"] ?? "").trim();
  const donViTinh = String(rowObj["DON_VI_TINH"] ?? "Cái").trim();
  const donGia = parseNumberCell(rowObj["DON_GIA"], 0);
  const donGiaBh =
    rowObj["DON_GIA_BH"] !== undefined && rowObj["DON_GIA_BH"] !== ""
      ? parseNumberCell(rowObj["DON_GIA_BH"])
      : donGia;
  const tyleTtBhRaw = parseNumberCell(rowObj["TYLE_TT_BH"], 100);
  const tyleTtBh = tyleTtBhRaw > 0 ? tyleTtBhRaw : 100;
  const soLuong = parseNumberCell(rowObj["SO_LUONG"], 1);
  const dinhMucRaw = parseNumberCell(rowObj["DINH_MUC"], 0);
  const dinhMuc = dinhMucRaw > 0 ? dinhMucRaw : undefined;
  const nhaThau = String(rowObj["NHA_THAU"] ?? "").trim();
  const ttThau = String(rowObj["TT_THAU"] ?? "").trim();
  const tuNgayHd = parseYmdDate(rowObj["TU_NGAY_HD"]);
  const denNgayHd = parseYmdDate(rowObj["DEN_NGAY_HD"]);
  const maCskcb =
    String(rowObj["MA_CSKCB"] ?? defaultMaCskcb).trim() || defaultMaCskcb;
  const loaiThau = parseNumberCell(rowObj["LOAI_THAU"], 1);
  const htThauRaw = parseNumberCell(rowObj["HT_THAU"], 0);
  const htThau = [3, 4, 5, 7].includes(loaiThau)
    ? undefined
    : htThauRaw > 0
      ? htThauRaw
      : 1;
  const maCskcbTbyt = String(rowObj["MA_CSKCB_TBYT"] ?? "").trim();
  const rawTuNgay = rowObj["TU_NGAY"];
  const parsedTuNgay = parseYmdDate(rawTuNgay);
  const tuNgay = parsedTuNgay || getTodayYmd();
  const denNgay = parseYmdDate(rowObj["DEN_NGAY"]);

  const errors = validateThietBiData({
    maVatTu,
    nhomVatTu,
    tenVatTu,
    donViTinh,
    donGia,
    donGiaBh,
    rawTuNgay,
    parsedTuNgay,
  });

  return {
    id: `tb-${Date.now()}-${rowIndex}-${Math.random().toString(36).substring(2, 6)}`,
    stt,
    maVatTu,
    nhomVatTu,
    tenVatTu,
    maHieu: maHieu || undefined,
    soLuuHanh: soLuuHanh || undefined,
    tinhnangKt: tinhnangKt || undefined,
    quyCach: quyCach || undefined,
    hangSx: hangSx || undefined,
    nuocSx: nuocSx || undefined,
    donViTinh,
    donGia,
    donGiaBh,
    tyleTtBh,
    soLuong,
    dinhMuc,
    nhaThau: nhaThau || undefined,
    ttThau: ttThau || undefined,
    tuNgayHd: tuNgayHd || undefined,
    denNgayHd: denNgayHd || undefined,
    maCskcb,
    loaiThau: loaiThau >= 1 && loaiThau <= 7 ? loaiThau : 1,
    htThau,
    maCskcbTbyt: maCskcbTbyt || undefined,
    tuNgay,
    denNgay: denNgay || undefined,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Render 1 item DmThietBiItem thành khối XML <DM_TBYT>
 */
export function renderThietBiItemXml(
  item: DmThietBiItem,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): string {
  const cskcb = item.maCskcb || defaultMaCskcb;

  const tagOrEmpty = (tag: string, val: string | number | undefined | null) => {
    if (val === undefined || val === null || val === "") {
      return `      <${tag}/>`;
    }
    return `      <${tag}>${escapeXml(val)}</${tag}>`;
  };

  return `    <DM_TBYT>
      <STT>${item.stt}</STT>
      <MA_VAT_TU>${escapeXml(item.maVatTu)}</MA_VAT_TU>
      <NHOM_VAT_TU>${escapeXml(item.nhomVatTu)}</NHOM_VAT_TU>
      <TEN_VAT_TU>${escapeXml(item.tenVatTu)}</TEN_VAT_TU>
${tagOrEmpty("MA_HIEU", item.maHieu)}
${tagOrEmpty("SO_LUU_HANH", item.soLuuHanh)}
${tagOrEmpty("TINHNANG_KT", item.tinhnangKt)}
${tagOrEmpty("QUY_CACH", item.quyCach)}
${tagOrEmpty("HANG_SX", item.hangSx)}
${tagOrEmpty("NUOC_SX", item.nuocSx)}
      <DON_VI_TINH>${escapeXml(item.donViTinh)}</DON_VI_TINH>
      <DON_GIA>${item.donGia}</DON_GIA>
      <DON_GIA_BH>${item.donGiaBh}</DON_GIA_BH>
      <TYLE_TT_BH>${item.tyleTtBh ?? 100}</TYLE_TT_BH>
      <SO_LUONG>${item.soLuong}</SO_LUONG>
${tagOrEmpty("DINH_MUC", item.dinhMuc)}
${tagOrEmpty("NHA_THAU", item.nhaThau)}
${tagOrEmpty("TT_THAU", item.ttThau)}
${tagOrEmpty("TU_NGAY_HD", item.tuNgayHd)}
${tagOrEmpty("DEN_NGAY_HD", item.denNgayHd)}
      <MA_CSKCB>${escapeXml(cskcb)}</MA_CSKCB>
      <LOAI_THAU>${item.loaiThau ?? 1}</LOAI_THAU>
${tagOrEmpty("HT_THAU", [3, 4, 5, 7].includes(item.loaiThau) ? "" : item.htThau)}
${tagOrEmpty("MA_CSKCB_TBYT", item.maCskcbTbyt)}
      <TU_NGAY>${escapeXml(item.tuNgay)}</TU_NGAY>
${tagOrEmpty("DEN_NGAY", item.denNgay)}
    </DM_TBYT>`;
}
