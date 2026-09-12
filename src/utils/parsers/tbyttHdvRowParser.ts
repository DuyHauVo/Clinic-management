import type { DmTbytThdvItem } from "../types/tbyttHdvTypes";
import {
  parseNumberCell,
  parseYmdDate,
  DEFAULT_MA_CSKCB,
  escapeXml,
  getTodayYmd,
} from "../shared";
import { validateTbytThdvData } from "../validators";

/**
 * Chuyển đổi một dòng thô Excel thành đối tượng DmTbytThdvItem
 * Trả về null nếu dòng hoàn toàn không có TEN_TB lẫn MA_MAY
 */
export function parseTbytThdvRow(
  rowObj: Record<string, unknown>,
  rowIndex: number,
  autoStt: number,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): DmTbytThdvItem | null {
  const tenTb = String(rowObj["TEN_TB"] ?? "").trim();
  const maMay = String(rowObj["MA_MAY"] ?? "").trim();

  // Bỏ qua dòng trống không có mã máy hoặc tên thiết bị
  if (!tenTb && !maMay) {
    return null;
  }

  const stt = parseNumberCell(rowObj["STT"], autoStt);
  const kyHieu = String(rowObj["KY_HIEU"] ?? "").trim() || undefined;
  const congTySx = String(rowObj["CONGTY_SX"] ?? "").trim() || undefined;
  const nuocSx = String(rowObj["NUOC_SX"] ?? "").trim() || undefined;

  const parseYear = (val: unknown): number | undefined => {
    if (val === undefined || val === null || val === "") return undefined;
    const parsed = parseNumberCell(val, 0);
    return parsed > 0 ? parsed : undefined;
  };

  const namSx = parseYear(rowObj["NAM_SX"]);
  const namSd = parseYear(rowObj["NAM_SD"]);

  const soLuuHanh = String(rowObj["SO_LUU_HANH"] ?? "").trim() || undefined;
  const hdTu = parseYmdDate(rowObj["HD_TU"]);
  const hdDen = parseYmdDate(rowObj["HD_DEN"]);

  const rawTuNgay = rowObj["TU_NGAY"];
  const parsedTuNgay = parseYmdDate(rawTuNgay);
  const tuNgay = parsedTuNgay || getTodayYmd();
  const denNgay = parseYmdDate(rowObj["DEN_NGAY"]);

  const maCskcb =
    String(rowObj["MA_CSKCB"] ?? defaultMaCskcb).trim() || defaultMaCskcb;

  // Validation
  const errors = validateTbytThdvData({
    tenTb,
    maMay,
    parsedTuNgay,
  });

  return {
    id: `tbthdv-${Date.now()}-${rowIndex}-${Math.random().toString(36).substring(2, 6)}`,
    stt,
    tenTb,
    kyHieu,
    congTySx,
    nuocSx,
    namSx,
    namSd,
    maMay,
    soLuuHanh,
    hdTu,
    hdDen,
    tuNgay,
    denNgay,
    maCskcb,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Render 1 item DmTbytThdvItem thành khối XML <DM_TBYTTHDV>
 */
export function renderTbytThdvItemXml(
  item: DmTbytThdvItem,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): string {
  const cskcb = item.maCskcb || defaultMaCskcb;

  const tagOrEmpty = (
    tag: string,
    val: string | number | undefined | null,
  ) => {
    if (val === undefined || val === null || val === "") {
      return `      <${tag}/>`;
    }
    return `      <${tag}>${escapeXml(val)}</${tag}>`;
  };

  return `    <DM_TBYTTHDV>
      <STT>${item.stt}</STT>
      <TEN_TB>${escapeXml(item.tenTb)}</TEN_TB>
${tagOrEmpty("KY_HIEU", item.kyHieu)}
${tagOrEmpty("CONGTY_SX", item.congTySx)}
${tagOrEmpty("NUOC_SX", item.nuocSx)}
${tagOrEmpty("NAM_SX", item.namSx)}
${tagOrEmpty("NAM_SD", item.namSd)}
      <MA_MAY>${escapeXml(item.maMay)}</MA_MAY>
${tagOrEmpty("SO_LUU_HANH", item.soLuuHanh)}
${tagOrEmpty("HD_TU", item.hdTu)}
${tagOrEmpty("HD_DEN", item.hdDen)}
      <TU_NGAY>${escapeXml(item.tuNgay || getTodayYmd())}</TU_NGAY>
${tagOrEmpty("DEN_NGAY", item.denNgay)}
      <MA_CSKCB>${escapeXml(cskcb)}</MA_CSKCB>
    </DM_TBYTTHDV>`;
}
