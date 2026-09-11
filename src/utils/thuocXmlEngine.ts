import * as XLSX from "xlsx";
import type {
  DmThuocItem,
  ParseThuocExcelResult,
  SendThuocGatewayResult,
} from "./types/thuocTypes";
import {
  THUOC_SCHEMA_FIELDS,
  THUOC_EXCEL_TEMPLATE_HEADERS,
  THUOC_EXCEL_TEMPLATE_LABELS,
  THUOC_EXCEL_TEMPLATE_SAMPLES,
} from "./constants/thuocConstants";
import {
  createSchemaKeyMatcher,
  parseYmdDate,
  formatToYmdString,
  parseNumberCell,
  readExcelFile,
  findBestSheetName,
  detectHeaderRow,
  escapeXml,
  generateUUID,
  buildSignatureBlock,
  buildHsDanhMucDocument,
  xmlToBase64,
  downloadXmlFile,
  mockSendDanhMucToBhxhGateway,
} from "./shared";
import { validateThuocData } from "./validators";

export { formatToYmdString, xmlToBase64 };

export const matchThuocSchemaKey = createSchemaKeyMatcher(THUOC_SCHEMA_FIELDS, [
  [/MATHUOC|MAHOATCHAT/, "MA_THUOC"],
  [/TENHOATCHAT|HOATCHAT/, "TEN_HOAT_CHAT"],
  [/TENTHUOC|BIETDUOC/, "TEN_THUOC"],
  [/DONVITINH|DVT/, "DON_VI_TINH"],
  [/HAMLUONG|NONGDO/, "HAM_LUONG"],
  [/MADUONGDUNG/, "MA_DUONG_DUNG"],
  [/DUONGDUNG/, "DUONG_DUNG"],
  [/DANGBAOCHE|DANGTHUOC/, "DANG_BAO_CHE"],
  [/SODANGKY|GPNK|SDK/, "SO_DANG_KY"],
  [/SOLUONG/, "SO_LUONG"],
  [/DONGIABH|GIABHYT/, "DON_GIA_BH"],
  [/DONGIA|GIAMUA/, "DON_GIA"],
  [/QUYCACH|DONGGOI/, "QUY_CACH"],
  [/NHASX|HANGSX/, "NHA_SX"],
  [/NUOCSX|XUATXU/, "NUOC_SX"],
  [/NHATHAU|DONVICUNGUNG/, "NHA_THAU"],
  [/TTTHAU|GOITHAU/, "TT_THAU"],
  [/TUNGAYHD/, "TU_NGAY_HD"],
  [/DENNGAYHD/, "DEN_NGAY_HD"],
  [/MACSKCBTHUOC/, "MA_CSKCB_THUOC"],
  [/MACSKCB/, "MA_CSKCB"],
  [/LOAITHUOC/, "LOAI_THUOC"],
  [/LOAITHAU/, "LOAI_THAU"],
  [/HTTHAU|HINHTHUCTHAU/, "HT_THAU"],
  [/MADVKT/, "MA_DVKT"],
  [/TCCL/, "TCCL"],
  [/BOPHANVT/, "BO_PHAN_VT"],
  [/TENKHOAHOC/, "TEN_KHOA_HOC"],
  [/NGUONGOC/, "NGUON_GOC"],
  [/PPCHEBIEN/, "PP_CHEBIEN"],
  [/MADLNHAP/, "MA_DL_NHAP"],
  [/MADLCB/, "MA_DL_CB"],
  [/TLHHCB/, "TLHH_CB"],
  [/TLHHBQ/, "TLHH_BQ"],
  [/TUNGAY|BATDAU|APDUNG/, "TU_NGAY"],
  [/DENNGAY|KETTHUC|HETHAN/, "DEN_NGAY"],
]);

export function findMatchingThuocSchemaKey(colHeader: string): string | null {
  return matchThuocSchemaKey(colHeader);
}

/**
 * Parse một Worksheet Excel thuốc thành danh sách DmThuocItem
 */
export function parseThuocWorksheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
  fileName = "",
  defaultMaCskcb = "01929",
): ParseThuocExcelResult {
  const ws = workbook.Sheets[sheetName];
  const allSheets = workbook.SheetNames;

  if (!ws) {
    return {
      fileName,
      selectedSheet: sheetName,
      availableSheets: allSheets,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      items: [],
      missingRequiredColumns: THUOC_SCHEMA_FIELDS.filter((f) => f.required).map(
        (f) => f.key,
      ),
      matchedFields: [],
      matchedColumnsMap: {},
      isMultiSheet: allSheets.length > 1,
      workbook,
    };
  }

  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
  });
  if (!rawRows || rawRows.length === 0) {
    return {
      fileName,
      selectedSheet: sheetName,
      availableSheets: allSheets,
      totalRows: 0,
      validRows: 0,
      items: [],
      invalidRows: 0,
      missingRequiredColumns: THUOC_SCHEMA_FIELDS.filter((f) => f.required).map(
        (f) => f.key,
      ),
      matchedFields: [],
      matchedColumnsMap: {},
      isMultiSheet: allSheets.length > 1,
      workbook,
    };
  }

  const { headerRowIndex, colMapping } = detectHeaderRow(
    rawRows,
    matchThuocSchemaKey,
    3,
    25,
    "best",
  );

  const matchedColumnsMap: { [schemaKey: string]: string } = {};
  const matchedFields: string[] = [];

  for (const [colIdxStr, schemaKey] of Object.entries(colMapping)) {
    const colIdx = Number(colIdxStr);
    const headerLabel =
      headerRowIndex >= 0
        ? String(rawRows[headerRowIndex]?.[colIdx] ?? "").trim()
        : "";
    matchedColumnsMap[schemaKey] = headerLabel || schemaKey;
    if (!matchedFields.includes(schemaKey)) {
      matchedFields.push(schemaKey);
    }
  }

  const requiredFields = THUOC_SCHEMA_FIELDS.filter((f) => f.required);
  const missingRequiredColumns = requiredFields
    .filter((f) => !matchedFields.includes(f.key))
    .map((f) => f.key);

  const items: DmThuocItem[] = [];
  const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 1;

  for (let r = startRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.every((c) => c === "" || c === null || c === undefined))
      continue;

    const rowObj: Record<string, unknown> = {};
    for (const [colIdxStr, key] of Object.entries(colMapping)) {
      rowObj[key] = row[Number(colIdxStr)];
    }

    const stt = parseNumberCell(rowObj["STT"], items.length + 1);
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
    const maDuongDung = String(rowObj["MA_DUONG_DUNG"] ?? "").trim() || "1.01";
    const dangBaoChe = rowObj["DANG_BAO_CHE"]
      ? String(rowObj["DANG_BAO_CHE"]).trim()
      : undefined;
    const soDangKy = String(rowObj["SO_DANG_KY"] ?? "").trim();
    const soLuong =
      rowObj["SO_LUONG"] !== undefined && rowObj["SO_LUONG"] !== ""
        ? parseNumberCell(rowObj["SO_LUONG"])
        : undefined;
    const donGia = parseNumberCell(rowObj["DON_GIA"]);
    const donGiaBh = parseNumberCell(rowObj["DON_GIA_BH"]) || donGia;
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

    let loaiThuoc = parseNumberCell(rowObj["LOAI_THUOC"], 1);
    if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(loaiThuoc)) {
      const ltStr = String(rowObj["LOAI_THUOC"] ?? "").toLowerCase();
      if (ltStr.includes("tân dược") || ltStr.includes("tan duoc"))
        loaiThuoc = 1;
      else if (ltStr.includes("chế phẩm máu") || ltStr.includes("che pham mau"))
        loaiThuoc = 10;
      else if (ltStr.includes("chế phẩm") || ltStr.includes("che pham"))
        loaiThuoc = 2;
      else if (ltStr.includes("vị thuốc") || ltStr.includes("vi thuoc"))
        loaiThuoc = 3;
      else if (ltStr.includes("phóng xạ") || ltStr.includes("phong xa"))
        loaiThuoc = 4;
      else if (ltStr.includes("dược liệu") || ltStr.includes("duoc lieu"))
        loaiThuoc = 7;
      else if (ltStr.includes("máu") || ltStr.includes("mau")) loaiThuoc = 9;
      else loaiThuoc = 1;
    }

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

    const tuNgay = parseYmdDate(rowObj["TU_NGAY"]) || "20260101";
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

    items.push({
      id: `thuoc-${Date.now()}-${r}-${Math.random().toString(36).substring(2, 6)}`,
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
    });
  }

  const validRows = items.filter((i) => i.isValid).length;

  const sheetsMeta = workbook
    ? allSheets.map((sName) => {
        const s = workbook.Sheets[sName];
        const sData: unknown[][] = s
          ? XLSX.utils.sheet_to_json(s, { header: 1, defval: "" })
          : [];
        return {
          name: sName,
          rowCount: Math.max(0, sData.length - 1),
          isBestMatch: sName === sheetName,
        };
      })
    : undefined;

  return {
    fileName,
    selectedSheet: sheetName,
    availableSheets: allSheets,
    sheets: sheetsMeta,
    totalRows: items.length,
    validRows,
    invalidRows: items.length - validRows,
    items,
    missingRequiredColumns,
    matchedFields,
    matchedColumnsMap,
    isMultiSheet: allSheets.length > 1,
    workbook,
  };
}

/**
 * Đọc file Excel từ người dùng và tự động chọn sheet phù hợp nhất cho Mẫu 03/DM
 */
export async function parseThuocExcelFile(
  file: File,
  selectedSheetName?: string,
  defaultMaCskcb = "01929",
): Promise<ParseThuocExcelResult> {
  const workbook = await readExcelFile(file);
  const allSheets = workbook.SheetNames;
  const bestSheet =
    selectedSheetName && allSheets.includes(selectedSheetName)
      ? selectedSheetName
      : findBestSheetName(workbook, matchThuocSchemaKey, 15, [
          "03",
          "THUOC",
          "DUOC",
          "MAU",
          "CHEPHAM",
          "CHE_PHAM",
        ]);
  return parseThuocWorksheet(workbook, bestSheet, file.name, defaultMaCskcb);
}

/**
 * Tạo tài liệu XML chuẩn Mẫu 03/DM (Loại hồ sơ 10)
 * Gói trong thẻ <HSDANHMUC> và <DANHSACH_DMTHUOCMAUCHEPHAMMAU>
 */
export function generateThuocXml(items: DmThuocItem[]): string {
  const containerGuid = `Id-${generateUUID()}`;

  const rowsXml = items
    .map(
      (item) => `    <DMTHUOCMAUCHEPHAMMAU>
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
    </DMTHUOCMAUCHEPHAMMAU>`,
    )
    .join("\n");

  const containerXml = `  <DANHSACH_DMTHUOCMAUCHEPHAMMAU Id="${containerGuid}">
${rowsXml}
  </DANHSACH_DMTHUOCMAUCHEPHAMMAU>`;

  const signature = buildSignatureBlock();
  return buildHsDanhMucDocument(containerXml, signature);
}

/**
 * Tải file XML xuống máy tính của người dùng
 */
export function downloadThuocXmlFile(
  xmlContent: string,
  fileName = "DanhMuc03_DMTHUOC_01929.xml",
): void {
  downloadXmlFile(xmlContent, fileName);
}

/**
 * Xuất file Excel mẫu chuẩn Mẫu 03/DM (Loại 10) để người dùng điền
 */
export function downloadThuocExcelTemplate(): void {
  const ws = XLSX.utils.aoa_to_sheet([
    THUOC_EXCEL_TEMPLATE_LABELS,
    THUOC_EXCEL_TEMPLATE_HEADERS,
    ...THUOC_EXCEL_TEMPLATE_SAMPLES,
  ]);

  ws["!cols"] = [
    { wch: 6 }, // STT
    { wch: 16 }, // MA_THUOC
    { wch: 28 }, // TEN_HOAT_CHAT
    { wch: 32 }, // TEN_THUOC
    { wch: 12 }, // DON_VI_TINH
    { wch: 18 }, // HAM_LUONG
    { wch: 14 }, // DUONG_DUNG
    { wch: 14 }, // MA_DUONG_DUNG
    { wch: 20 }, // DANG_BAO_CHE
    { wch: 18 }, // SO_DANG_KY
    { wch: 12 }, // SO_LUONG
    { wch: 14 }, // DON_GIA
    { wch: 14 }, // DON_GIA_BH
    { wch: 22 }, // QUY_CACH
    { wch: 28 }, // NHA_SX
    { wch: 16 }, // NUOC_SX
    { wch: 28 }, // NHA_THAU
    { wch: 18 }, // TT_THAU
    { wch: 12 }, // TU_NGAY_HD
    { wch: 12 }, // DEN_NGAY_HD
    { wch: 12 }, // MA_CSKCB
    { wch: 12 }, // LOAI_THUOC
    { wch: 12 }, // LOAI_THAU
    { wch: 12 }, // HT_THAU
    { wch: 12 }, // MA_DVKT
    { wch: 12 }, // TCCL
    { wch: 12 }, // BO_PHAN_VT
    { wch: 18 }, // TEN_KHOA_HOC
    { wch: 16 }, // NGUON_GOC
    { wch: 16 }, // PP_CHEBIEN
    { wch: 14 }, // MA_DL_NHAP
    { wch: 14 }, // MA_DL_CB
    { wch: 12 }, // TLHH_CB
    { wch: 12 }, // TLHH_BQ
    { wch: 16 }, // MA_CSKCB_THUOC
    { wch: 12 }, // TU_NGAY
    { wch: 12 }, // DEN_NGAY
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "03_DM_THUOC");
  XLSX.writeFile(wb, "Mau_03_DM_Thuoc_ChePhamMau_BHYT.xlsx");
}

/**
 * Gửi dữ liệu Mẫu 03/DM lên Cổng tiếp nhận BHXH Việt Nam (Mô phỏng sandbox)
 * API thật: https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc03_DMTHUOC
 */
export async function sendThuocToBhxhGateway(
  items: DmThuocItem[],
  maCskcb = "01929",
  maTinh = "01",
): Promise<SendThuocGatewayResult> {
  return mockSendDanhMucToBhxhGateway(
    "DANHMUC03",
    items.length,
    "Danh mục Thuốc, Máu & Chế phẩm máu (Loại 10)",
    maCskcb,
    maTinh,
  );
}
