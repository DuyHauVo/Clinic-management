import * as XLSX from "xlsx";
import type {
  DmThietBiItem,
  ParseThietBiExcelResult,
  SendThietBiGatewayResult,
} from "./types/thietBiTypes";
import {
  THIETBI_SCHEMA_FIELDS,
  THIETBI_FIELD_HEURISTICS,
} from "./constants/thietBiConstants";
import {
  createSchemaKeyMatcher,
  parseNumberCell,
  parseYmdDate,
  readExcelFile,
  findBestSheetName,
  pickBestSheetName,
  detectHeaderRow,
  escapeXml,
  generateUUID,
  buildSignatureBlock,
  buildHsDanhMucDocument,
  xmlToBase64,
  downloadXmlFile,
  mockSendDanhMucToBhxhGateway,
} from "./shared";
import { validateThietBiData } from "./validators";
import {
  DEFAULT_MA_CSKCB,
} from "./shared/excelXmlShared";

export { xmlToBase64, downloadXmlFile };

export const matchThietBiSchemaKey = createSchemaKeyMatcher(
  THIETBI_SCHEMA_FIELDS,
  THIETBI_FIELD_HEURISTICS,
);

export function findMatchingThietBiSchemaKey(colHeader: string): string | null {
  return matchThietBiSchemaKey(colHeader);
}

/**
 * Parse một sheet cụ thể thành danh sách DmThietBiItem
 */
export function parseThietBiWorksheet(
  worksheet: XLSX.WorkSheet,
  sheetName: string,
  availableSheets: string[],
  fileName: string,
  workbook?: XLSX.WorkBook,
  defaultMaCskcb = "01929",
): ParseThietBiExcelResult {
  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  if (!rawRows || rawRows.length === 0) {
    return {
      items: [],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      detectedHeaders: {},
      missingRequiredFields: THIETBI_SCHEMA_FIELDS.filter(
        (f) => f.required,
      ).map((f) => f.key),
      availableSheets,
      selectedSheet: sheetName,
      fileName,
      workbook,
    };
  }

  // Tìm dòng header (khớp nhiều cột schema nhất)
  const { headerRowIndex, colMapping } = detectHeaderRow(
    rawRows,
    matchThietBiSchemaKey,
    3,
    25,
    "best",
  );

  let effectiveHeaderRow = headerRowIndex;
  let effectiveColMapping: { [colIdx: number]: string } = { ...colMapping };

  // Fallback: nếu không phát hiện dòng header, dùng dòng 0
  if (effectiveHeaderRow === -1 && rawRows.length > 0) {
    effectiveHeaderRow = 0;
    const row0 = rawRows[0];
    if (Array.isArray(row0)) {
      row0.forEach((cell, idx) => {
        const key = matchThietBiSchemaKey(String(cell ?? "").trim());
        if (key && !Object.values(effectiveColMapping).includes(key)) {
          effectiveColMapping[idx] = key;
        }
      });
    }
  }

  const detectedHeaders = effectiveColMapping;
  const matchedFieldKeys = new Set(Object.values(effectiveColMapping));
  const missingRequiredFields = THIETBI_SCHEMA_FIELDS.filter(
    (f) => f.required && !matchedFieldKeys.has(f.key),
  ).map((f) => f.key);

  const items: DmThietBiItem[] = [];
  let validRows = 0;
  let invalidRows = 0;

  for (let r = effectiveHeaderRow + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (
      !Array.isArray(row) ||
      row.every((c) => c === "" || c === null || c === undefined)
    ) {
      continue;
    }

    const rowObj: Record<string, unknown> = {};
    Object.entries(effectiveColMapping).forEach(([colIdx, key]) => {
      rowObj[key] = row[Number(colIdx)];
    });

    const maVatTu = String(rowObj["MA_VAT_TU"] ?? "").trim();
    const tenVatTu = String(rowObj["TEN_VAT_TU"] ?? "").trim();
    const nhomVatTu = String(rowObj["NHOM_VAT_TU"] ?? "").trim();

    // Bỏ qua dòng trống không có mã hoặc tên
    if (!maVatTu && !tenVatTu) {
      continue;
    }

    const stt = parseNumberCell(rowObj["STT"], items.length + 1);
    const maHieu = String(rowObj["MA_HIEU"] ?? "").trim();
    const soLuuHanh = String(rowObj["SO_LUU_HANH"] ?? "").trim();
    const tinhnangKt = String(rowObj["TINHNANG_KT"] ?? "").trim();
    const quyCach = String(rowObj["QUY_CACH"] ?? "").trim();
    const hangSx = String(rowObj["HANG_SX"] ?? "").trim();
    const nuocSx = String(rowObj["NUOC_SX"] ?? "").trim();
    const donViTinh = String(rowObj["DON_VI_TINH"] ?? "Cái").trim() || "Cái";
    const donGia = parseNumberCell(rowObj["DON_GIA"], 0);
    const donGiaBh = parseNumberCell(rowObj["DON_GIA_BH"], donGia);
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
    const todayYmd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const tuNgay = parsedTuNgay || todayYmd;
    const denNgay = parseYmdDate(rowObj["DEN_NGAY"]);

    const errors = validateThietBiData({
      maVatTu,
      nhomVatTu,
      tenVatTu,
      donViTinh,
      donGia,
      donGiaBh,
      rawTuNgay,
      parsedTuNgay
    });

    const isValid = errors.length === 0;
    if (isValid) validRows++;
    else invalidRows++;

    items.push({
      id: `tb-${generateUUID()}`,
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
      isValid,
      errors,
    });
  }

  return {
    items,
    totalRows: items.length,
    validRows,
    invalidRows,
    detectedHeaders,
    missingRequiredFields,
    availableSheets,
    selectedSheet: sheetName,
    fileName,
    workbook,
  };
}

/**
 * Đọc file Excel Thiết bị y tế (Mẫu 04/DM, Loại HS 11)
 */
export async function parseThietBiExcelFile(
  file: File,
  selectedSheetName?: string,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): Promise<ParseThietBiExcelResult> {
  const workbook = await readExcelFile(file);
  const availableSheets = workbook.SheetNames;

  const hintKeywords = [
    "MAU04",
    "MAU_04",
    "04_DM",
    "DM_TBYT",
    "TBYT",
    "VTYT",
    "THIETBI",
    "THIET_BI",
    "VATTU",
  ];

  const sheetName =
    selectedSheetName && availableSheets.includes(selectedSheetName)
      ? selectedSheetName
      : pickBestSheetName(workbook, matchThietBiSchemaKey, hintKeywords, 2);

  const worksheet = workbook.Sheets[sheetName];
  const result = parseThietBiWorksheet(
    worksheet,
    sheetName,
    availableSheets,
    file.name,
    workbook,
    defaultMaCskcb,
  );

  // Fallback: nếu sheet chọn ra 0 bản ghi nhưng workbook còn sheet khác thì tự động thử fallback sang findBestSheetName
  if (
    result.items.length === 0 &&
    availableSheets.length > 1 &&
    !selectedSheetName
  ) {
    const fallbackSheet = findBestSheetName(workbook, matchThietBiSchemaKey);
    if (fallbackSheet && fallbackSheet !== sheetName) {
      const fallbackWs = workbook.Sheets[fallbackSheet];
      const fallbackResult = parseThietBiWorksheet(
        fallbackWs,
        fallbackSheet,
        availableSheets,
        file.name,
        workbook,
        defaultMaCskcb,
      );
      if (fallbackResult.items.length > 0) {
        return fallbackResult;
      }
    }
  }

  return result;
}

/**
 * Tạo XML Mẫu 04/DM: Danh mục thiết bị y tế (Loại HS 11)
 */
export function generateThietBiXml(
  items: DmThietBiItem[],
  maCskcb = "01929",
): string {
  const datasetId = `Id-${generateUUID()}`;

  const rowsXml = items
    .map((item, idx) => {
      const stt = item.stt || idx + 1;
      const cskcb = item.maCskcb || maCskcb;

      const tagOrEmpty = (
        tag: string,
        val: string | number | undefined | null,
      ) => {
        if (val === undefined || val === null || val === "") {
          return `      <${tag}/>`;
        }
        return `      <${tag}>${escapeXml(val)}</${tag}>`;
      };

      return `    <DM_TBYT>
      <STT>${stt}</STT>
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
    })
    .join("\n");

  const datasetContainerXml = `  <DSACH_TBYT Id="${datasetId}">
${rowsXml}
  </DSACH_TBYT>`;

  const signatureBlock = buildSignatureBlock();
  return buildHsDanhMucDocument(datasetContainerXml, signatureBlock);
}

/**
 * Tải file XML Mẫu 04/DM xuống máy
 */
export function downloadThietBiXmlFile(
  xmlContent: string,
  fileName = "Mau_04_DM_ThietBiYTe.xml",
): void {
  downloadXmlFile(xmlContent, fileName);
}

/**
 * Xuất mẫu Excel chuẩn cho Danh mục Thiết bị y tế Mẫu 04/DM
 */
export function downloadThietBiExcelTemplate(): void {
  const vnLabels = THIETBI_SCHEMA_FIELDS.map((f) => f.label);
  const headers = THIETBI_SCHEMA_FIELDS.map((f) => f.key);
  const sampleRow = [
    1,
    "N04.01.001",
    "Kim tiêm",
    "Kim dùng cho buồng tiêm 20G x 25mm",
    "MH-KT-2024",
    "2400012/ĐKLH/BYT",
    "Thép không gỉ y tế 304, đầu vát Huber",
    "1 bộ/túi",
    "B. Braun Medical AG",
    "Đức",
    "Cái",
    15000,
    15000,
    80,
    770,
    1,
    "Công ty CP Dược & TBYT TW",
    "456/QĐ-BV;G1;N1;2024",
    "20250101",
    "20261231",
    "01929",
    1,
    1,
    "",
    "20250101",
    "",
  ];

  const ws = XLSX.utils.aoa_to_sheet([vnLabels, headers, sampleRow]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "04_DM_TBYT");
  XLSX.writeFile(wb, "Mau_04_DM_ThietBiYTe_Template.xlsx");
}

/**
 * Gửi Mẫu 04/DM lên Cổng EGW Giám định BHYT
 */
export async function sendThietBiToBhxhGateway(
  items: DmThietBiItem[],
  maCskcb = "01929",
  maTinh = "01",
): Promise<SendThietBiGatewayResult> {
  return mockSendDanhMucToBhxhGateway(
    "11",
    items.length,
    "Thiết bị y tế (Mẫu 04/DM)",
    maCskcb,
    maTinh,
  );
}
