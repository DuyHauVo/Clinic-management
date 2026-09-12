import type { DmDichVuItem } from "../types/dichVuTypes";
import {
  parseNumberCell,
  parseYmdDate,
  DEFAULT_MA_CSKCB,
  escapeXml,
  getTodayYmd,
} from "../shared";
import { validateDichVuData } from "../validators";

/**
 * Chuyển đổi một dòng thô Excel thành đối tượng DmDichVuItem
 * Trả về null nếu dòng hoàn toàn không có MA_DICH_VU lẫn TEN_DICH_VU
 */
export function parseDichVuRow(
  rowObj: Record<string, unknown>,
  rowIndex: number,
  autoStt: number,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): DmDichVuItem | null {
  const maDichVu = String(rowObj["MA_DICH_VU"] ?? "").trim();
  const tenDichVu = String(rowObj["TEN_DICH_VU"] ?? "").trim();

  if (!maDichVu && !tenDichVu) {
    return null;
  }

  const stt = parseNumberCell(rowObj["STT"], autoStt);
  const tenDvktGia = String(rowObj["TEN_DVKT_GIA"] ?? "").trim() || tenDichVu;
  const donGia = parseNumberCell(rowObj["DON_GIA"], 0);
  const quyTrinh =
    String(rowObj["QUY_TRINH"] ?? "20240101_01/QĐ-BV").trim() ||
    "20240101_01/QĐ-BV";
  const soLuongCgktRaw = rowObj["SO_LUONG_CGKT"];
  const soLuongCgkt =
    soLuongCgktRaw !== undefined && soLuongCgktRaw !== ""
      ? parseNumberCell(soLuongCgktRaw, 0)
      : undefined;
  const cskcbCgkt = String(rowObj["CSKCB_CGKT"] ?? "").trim() || undefined;
  const cskcbCls = String(rowObj["CSKCB_CLS"] ?? "").trim() || undefined;
  const qdDvkt =
    String(rowObj["QD_DVKT"] ?? "20240101_01/QĐ-SYT").trim() ||
    "20240101_01/QĐ-SYT";
  const qdPdGia =
    String(rowObj["QD_PD_GIA"] ?? "20240101_01/QĐ-UBND").trim() ||
    "20240101_01/QĐ-UBND";
  const ghiChu = String(rowObj["GHI_CHU"] ?? "").trim() || undefined;

  const giaThanhToanRaw = rowObj["GIA_THANH_TOAN"];
  const giaThanhToan =
    giaThanhToanRaw !== undefined && giaThanhToanRaw !== ""
      ? parseNumberCell(giaThanhToanRaw, donGia)
      : donGia;

  const rawTuNgay = rowObj["TU_NGAY"];
  const parsedTuNgay = parseYmdDate(rawTuNgay);
  const tuNgay = parsedTuNgay || getTodayYmd();
  const denNgay = parseYmdDate(rowObj["DEN_NGAY"]);

  const maCskcb =
    String(rowObj["MA_CSKCB"] ?? defaultMaCskcb).trim() || defaultMaCskcb;

  // Validation
  const errors = validateDichVuData({
    maDichVu,
    tenDichVu,
    donGia,
    parsedTuNgay,
  });

  const isValid = errors.length === 0;

  return {
    id: `dv-${Date.now()}-${rowIndex}-${Math.random().toString(36).substring(2, 6)}`,
    stt,
    maDichVu,
    tenDichVu,
    tenDvktGia,
    donGia,
    quyTrinh,
    soLuongCgkt,
    cskcbCgkt,
    cskcbCls,
    qdDvkt,
    qdPdGia,
    ghiChu,
    giaThanhToan,
    tuNgay,
    denNgay: denNgay || undefined,
    maCskcb,
    dsThuocPx: [],
    isValid,
    errors,
  };
}

/**
 * Render 1 item DmDichVuItem thành khối XML <DMDICHVUKBCB>
 */
export function renderDichVuItemXml(
  item: DmDichVuItem,
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

  // Danh sách thuốc phóng xạ / chất đánh dấu (Lọc bỏ các dòng rỗng)
  const validThuocPx = (item.dsThuocPx || []).filter(
    (px) => px.maThuoc?.trim() || px.tenThuoc?.trim(),
  );

  let dsThuocPxXml = "      <DS_THUOCPX/>";
  if (validThuocPx.length > 0) {
    const thuocPxItemsXml = validThuocPx
      .map((px, pIdx) => {
        const pxStt = px.stt || pIdx + 1;
        return `        <TT_THUOCPX>
          <STT>${pxStt}</STT>
          <MA_THUOC>${escapeXml(px.maThuoc.trim())}</MA_THUOC>
          <TEN_THUOC>${escapeXml(px.tenThuoc.trim())}</TEN_THUOC>
${tagOrEmpty("SO_DANG_KY", px.soDangKy)}
${tagOrEmpty("DON_VI_TINH", px.donViTinh)}
${tagOrEmpty("TT_THAU", px.ttThau)}
          <DON_GIA_THUOC>${px.donGiaThuoc || 0}</DON_GIA_THUOC>
${tagOrEmpty("DM_NSX_CDD", px.dmNsxCdD)}
${tagOrEmpty("DM_THUCTE_CDD", px.dmThucTeCdD)}
${tagOrEmpty("LIEU_BQ_PX", px.lieuBqPx)}
${tagOrEmpty("TL_THUCTE_BQ_PX", px.tlThucTeBqPx)}
          <THANH_TIEN_THUOC>${px.thanhTienThuoc || 0}</THANH_TIEN_THUOC>
        </TT_THUOCPX>`;
      })
      .join("\n");

    dsThuocPxXml = `      <DS_THUOCPX>\n${thuocPxItemsXml}\n      </DS_THUOCPX>`;
  }

  return `    <DMDICHVUKBCB>
      <STT>${item.stt}</STT>
      <MA_DICH_VU>${escapeXml(item.maDichVu)}</MA_DICH_VU>
      <TEN_DICH_VU>${escapeXml(item.tenDichVu)}</TEN_DICH_VU>
      <TEN_DVKT_GIA>${escapeXml(item.tenDvktGia || item.tenDichVu)}</TEN_DVKT_GIA>
      <DON_GIA>${item.donGia}</DON_GIA>
      <QUY_TRINH>${escapeXml(item.quyTrinh || "20240101_01/QĐ-BV")}</QUY_TRINH>
${tagOrEmpty("SO_LUONG_CGKT", item.soLuongCgkt)}
${tagOrEmpty("CSKCB_CGKT", item.cskcbCgkt)}
${tagOrEmpty("CSKCB_CLS", item.cskcbCls)}
      <QD_DVKT>${escapeXml(item.qdDvkt || "20240101_01/QĐ-SYT")}</QD_DVKT>
      <QD_PD_GIA>${escapeXml(item.qdPdGia || "20240101_01/QĐ-UBND")}</QD_PD_GIA>
${tagOrEmpty("GHI_CHU", item.ghiChu)}
      <TU_NGAY>${escapeXml(item.tuNgay || getTodayYmd())}</TU_NGAY>
${tagOrEmpty("DEN_NGAY", item.denNgay)}
      <MA_CSKCB>${escapeXml(cskcb)}</MA_CSKCB>
      <GIA_THANH_TOAN>${item.giaThanhToan || item.donGia}</GIA_THANH_TOAN>
${dsThuocPxXml}
    </DMDICHVUKBCB>`;
}
