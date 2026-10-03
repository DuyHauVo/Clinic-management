import type { Hs01TongHopItem } from "../../types/hs01TongHopTypes";
import {
  parseNumberCell,
  parseYmdHmDate,
  isValidYmdHmDate,
  parseGender,
  DEFAULT_MA_CSKCB,
  escapeXml,
} from "../shared";
import { validateHs01Data } from "../validators/hs01Validator";

/**
 * Chuyển đổi một dòng thô Excel thành đối tượng Hs01TongHopItem
 * Trả về null nếu dòng hoàn toàn không có HO_TEN lẫn MA_THE_BHYT
 */
export function parseHs01Row(
  rowObj: Record<string, unknown>,
  rowIndex: number,
  autoStt: number,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): Hs01TongHopItem | null {
  const hoTen = String(rowObj["HO_TEN"] ?? "").trim();
  const maTheBhyt = String(rowObj["MA_THE_BHYT"] ?? "").trim();

  if (!hoTen && !maTheBhyt) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

  const stt = parseNumberCell(rowObj["STT"], autoStt);
  const ngaySinh = parseYmdHmDate(rowObj["NGAY_SINH"], "0000");
  const gioiTinh = parseGender(rowObj["GIOI_TINH"], "3");

  const maBenhChinh = String(rowObj["MA_BENH_CHINH"] ?? "")
    .trim()
    .toUpperCase();
  const ngayVao = parseYmdHmDate(rowObj["NGAY_VAO"]);
  const ngayVaoNoiTru = rowObj["NGAY_VAO_NOI_TRU"]
    ? parseYmdHmDate(rowObj["NGAY_VAO_NOI_TRU"])
    : undefined;
  const ngayRa = parseYmdHmDate(rowObj["NGAY_RA"]);

  let maLoaiKcb = String(rowObj["MA_LOAI_KCB"] ?? "").trim();
  if (maLoaiKcb.length === 1) maLoaiKcb = `0${maLoaiKcb}`;

  let soNgayDtri = parseNumberCell(rowObj["SO_NGAY_DTRI"], 0);
  // Theo chuẩn Quyết định 130 và quy tắc kiểm tra Cổng BHXH:
  // MA_LOAI_KCB = "01" (Khám bệnh ngoại trú) thì số ngày điều trị bắt buộc là 0.
  if (maLoaiKcb === "01") {
    soNgayDtri = 0;
  } else if (
    soNgayDtri <= 0 &&
    isValidYmdHmDate(ngayVao) &&
    isValidYmdHmDate(ngayRa)
  ) {
    const dVao = new Date(
      Number(ngayVao.slice(0, 4)),
      Number(ngayVao.slice(4, 6)) - 1,
      Number(ngayVao.slice(6, 8)),
      Number(ngayVao.slice(8, 10)),
      Number(ngayVao.slice(10, 12)),
    );
    const dRa = new Date(
      Number(ngayRa.slice(0, 4)),
      Number(ngayRa.slice(4, 6)) - 1,
      Number(ngayRa.slice(6, 8)),
      Number(ngayRa.slice(8, 10)),
      Number(ngayRa.slice(10, 12)),
    );
    const diffTime = dRa.getTime() - dVao.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    soNgayDtri = Math.max(1, diffDays > 0 ? diffDays : 1);
  }

  const tTongchiBv = parseNumberCell(rowObj["T_TONGCHI_BV"], 0);
  const tTongchiBh = parseNumberCell(rowObj["T_TONGCHI_BH"], 0);
  const tBhtt = parseNumberCell(rowObj["T_BHTT"], 0);
  const tBncct = parseNumberCell(rowObj["T_BNCCT"], 0);
  const tBntt = parseNumberCell(rowObj["T_BNTT"], 0);
  const tNguonkhac = parseNumberCell(rowObj["T_NGUONKHAC"], 0);

  const maCskcb =
    String(rowObj["MA_CSKCB"] ?? defaultMaCskcb).trim() || defaultMaCskcb;
  const namQt = parseNumberCell(rowObj["NAM_QT"], currentYear);
  let thangQt = String(rowObj["THANG_QT"] ?? currentMonth).trim();
  if (thangQt.length === 1) thangQt = `0${thangQt}`;

  // Validation nghiêm ngặt (Strict Medical Validation)
  const errors = validateHs01Data({
    hoTen,
    maTheBhyt,
    gioiTinh,
    maBenhChinh,
    maLoaiKcb,
    ngaySinh,
    ngayVao,
    ngayRa,
    ngayVaoNoiTru,
    tTongchiBv,
  });

  const isValid = errors.length === 0;

  return {
    id: `hs01-${Date.now()}-${rowIndex}-${Math.random().toString(36).substring(2, 6)}`,
    stt,
    hoTen,
    ngaySinh,
    gioiTinh,
    maTheBhyt,
    maBenhChinh,
    ngayVao,
    ngayVaoNoiTru,
    ngayRa,
    soNgayDtri,
    maLoaiKcb,
    tTongchiBv,
    tTongchiBh,
    tBhtt,
    tBncct,
    tBntt,
    tNguonkhac,
    maCskcb,
    namQt,
    thangQt,
    trangThai: isValid ? "hop_le" : "canh_bao",
    isValid,
    errors,
  };
}

/**
 * Render 1 item Hs01TongHopItem thành khối XML <CHITIET_HS01BH>
 */
export function renderHs01ItemXml(
  item: Hs01TongHopItem,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): string {
  const cskcb = item.maCskcb || defaultMaCskcb;
  const fmtMoney = (val?: number) => Math.round(val || 0).toString();

  return `<CHITIET_HS01BH><STT>${item.stt}</STT><HO_TEN>${escapeXml(item.hoTen)}</HO_TEN><NGAY_SINH>${escapeXml(item.ngaySinh)}</NGAY_SINH><GIOI_TINH>${escapeXml(item.gioiTinh)}</GIOI_TINH><MA_THE_BHYT>${escapeXml(item.maTheBhyt)}</MA_THE_BHYT><MA_BENH_CHINH>${escapeXml(item.maBenhChinh)}</MA_BENH_CHINH><NGAY_VAO>${escapeXml(item.ngayVao)}</NGAY_VAO><NGAY_VAO_NOI_TRU>${escapeXml(item.ngayVaoNoiTru || "")}</NGAY_VAO_NOI_TRU><NGAY_RA>${escapeXml(item.ngayRa)}</NGAY_RA><SO_NGAY_DTRI>${item.soNgayDtri}</SO_NGAY_DTRI><MA_LOAI_KCB>${escapeXml(item.maLoaiKcb)}</MA_LOAI_KCB><T_TONGCHI_BV>${fmtMoney(item.tTongchiBv)}</T_TONGCHI_BV><T_TONGCHI_BH>${fmtMoney(item.tTongchiBh)}</T_TONGCHI_BH><T_BHTT>${fmtMoney(item.tBhtt)}</T_BHTT><T_BNCCT>${fmtMoney(item.tBncct)}</T_BNCCT><T_BNTT>${fmtMoney(item.tBntt)}</T_BNTT><T_NGUONKHAC>${fmtMoney(item.tNguonkhac || 0)}</T_NGUONKHAC><MA_CSKCB>${escapeXml(cskcb)}</MA_CSKCB><NAM_QT>${item.namQt}</NAM_QT><THANG_QT>${escapeXml(item.thangQt)}</THANG_QT></CHITIET_HS01BH>`;
}
