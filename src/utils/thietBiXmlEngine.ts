import * as XLSX from "xlsx";
import type {
  DmThietBiItem,
  ParseThietBiExcelResult,
  SendThietBiGatewayResult,
} from "./types/thietBiTypes";
import {
  THIETBI_SCHEMA_FIELDS,
  THIETBI_FIELD_HEURISTICS,
  THIETBI_EXCEL_TEMPLATE_HEADERS,
  THIETBI_EXCEL_TEMPLATE_LABELS,
  THIETBI_EXCEL_TEMPLATE_COLS,
  THIETBI_EXCEL_TEMPLATE_SAMPLES,
} from "./constants/thietBiConstants";
import { parseThietBiRow, renderThietBiItemXml } from "./parsers";
import {
  createSchemaKeyMatcher,
  readExcelFile,
  pickBestSheetName,
  detectHeaderRow,
  generateUUID,
  buildSignatureBlock,
  buildHsDanhMucDocument,
  xmlToBase64,
  downloadXmlFile,
  mockSendDanhMucToBhxhGateway,
  DEFAULT_MA_CSKCB,
  DEFAULT_MA_TINH,
} from "./shared";

export { xmlToBase64, downloadXmlFile, parseThietBiRow, renderThietBiItemXml };

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
  defaultMaCskcb = DEFAULT_MA_CSKCB,
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
  const effectiveColMapping: { [colIdx: number]: string } = { ...colMapping };

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

  for (let r = effectiveHeaderRow + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (
      !Array.isArray(row) ||
      row.every((c) => c === "" || c === null || c === undefined)
    ) {
      continue;
    }

    const rowObj: Record<string, unknown> = {};
    for (const [colIdxStr, key] of Object.entries(effectiveColMapping)) {
      rowObj[key] = row[Number(colIdxStr)];
    }

    const item = parseThietBiRow(rowObj, r, items.length + 1, defaultMaCskcb);
    if (item) {
      items.push(item);
    }
  }

  const validRows = items.filter((i) => i.isValid).length;

  return {
    items,
    totalRows: items.length,
    validRows,
    invalidRows: items.length - validRows,
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

  // Fallback: nếu sheet chọn ra 0 bản ghi nhưng workbook còn sheet khác
  if (
    result.items.length === 0 &&
    availableSheets.length > 1 &&
    !selectedSheetName
  ) {
    const fallbackSheet = pickBestSheetName(workbook, matchThietBiSchemaKey);
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
  maCskcb = DEFAULT_MA_CSKCB,
): string {
  const datasetId = `Id-${generateUUID()}`;
  const rowsXml = items
    .map((item) => renderThietBiItemXml(item, maCskcb))
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
  fileName = `Mau_04_DM_ThietBiYTe_${DEFAULT_MA_CSKCB}.xml`,
): void {
  downloadXmlFile(xmlContent, fileName);
}

/**
 * Xuất mẫu Excel chuẩn cho Danh mục Thiết bị y tế Mẫu 04/DM
 */
export function downloadThietBiExcelTemplate(): void {
  const ws = XLSX.utils.aoa_to_sheet([
    THIETBI_EXCEL_TEMPLATE_LABELS,
    THIETBI_EXCEL_TEMPLATE_HEADERS,
    ...THIETBI_EXCEL_TEMPLATE_SAMPLES,
  ]);

  ws["!cols"] = THIETBI_EXCEL_TEMPLATE_COLS;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "04_DM_TBYT");
  XLSX.writeFile(wb, "Mau_04_DM_ThietBiYTe_Template.xlsx");
}

/**
 * Gửi Mẫu 04/DM lên Cổng EGW Giám định BHYT
 */
export async function sendThietBiToBhxhGateway(
  items: DmThietBiItem[],
  maCskcb = DEFAULT_MA_CSKCB,
  maTinh = DEFAULT_MA_TINH,
): Promise<SendThietBiGatewayResult> {
  return mockSendDanhMucToBhxhGateway(
    "11",
    items.length,
    "Thiết bị y tế (Mẫu 04/DM)",
    maCskcb,
    maTinh,
  );
}
