import * as XLSX from "xlsx";
import type {
  DmTbytThdvItem,
  ParseTbytThdvExcelResult,
  SendTbytThdvGatewayResult,
} from "./types/tbyttHdvTypes";
import {
  TBYTTHDV_SCHEMA_FIELDS,
  TBYTTHDV_FIELD_HEURISTICS,
  TBYTTHDV_EXCEL_TEMPLATE_HEADERS,
  TBYTTHDV_EXCEL_TEMPLATE_LABELS,
  TBYTTHDV_EXCEL_TEMPLATE_COLS,
  TBYTTHDV_EXCEL_TEMPLATE_SAMPLES,
} from "./constants/tbyttHdvConstants";
import { parseTbytThdvRow, renderTbytThdvItemXml } from "./parsers";
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
} from "./shared/excelXmlShared";

export {
  xmlToBase64,
  downloadXmlFile,
  parseTbytThdvRow,
  renderTbytThdvItemXml,
};

export const matchTbytThdvSchemaKey = createSchemaKeyMatcher(
  TBYTTHDV_SCHEMA_FIELDS,
  TBYTTHDV_FIELD_HEURISTICS,
);

export function findMatchingTbytThdvSchemaKey(
  colHeader: string,
): string | null {
  return matchTbytThdvSchemaKey(colHeader);
}

/**
 * Parse một sheet cụ thể thành danh sách DmTbytThdvItem
 */
export function parseTbytThdvWorksheet(
  worksheet: XLSX.WorkSheet,
  sheetName: string,
  availableSheets: string[],
  fileName: string,
  workbook?: XLSX.WorkBook,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): ParseTbytThdvExcelResult {
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
      missingRequiredFields: TBYTTHDV_SCHEMA_FIELDS.filter(
        (f) => f.required,
      ).map((f) => f.key),
      availableSheets,
      selectedSheet: sheetName,
      fileName,
      workbook,
    };
  }

  const { headerRowIndex, colMapping } = detectHeaderRow(
    rawRows,
    matchTbytThdvSchemaKey,
    3,
    25,
    "best",
  );

  let effectiveHeaderRow = headerRowIndex;
  const effectiveColMapping: { [colIdx: number]: string } = { ...colMapping };

  if (effectiveHeaderRow === -1 && rawRows.length > 0) {
    effectiveHeaderRow = 0;
    const row0 = rawRows[0];
    if (Array.isArray(row0)) {
      row0.forEach((cell, idx) => {
        const key = matchTbytThdvSchemaKey(String(cell ?? "").trim());
        if (key && !Object.values(effectiveColMapping).includes(key)) {
          effectiveColMapping[idx] = key;
        }
      });
    }
  }

  const detectedHeaders = effectiveColMapping;
  const matchedFieldKeys = new Set(Object.values(effectiveColMapping));
  const missingRequiredFields = TBYTTHDV_SCHEMA_FIELDS.filter(
    (f) => f.required && !matchedFieldKeys.has(f.key),
  ).map((f) => f.key);

  const items: DmTbytThdvItem[] = [];

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

    const item = parseTbytThdvRow(rowObj, r, items.length + 1, defaultMaCskcb);
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
 * Đọc file Excel TBYTTHDV và tự động chấm điểm chọn Sheet tốt nhất
 */
export async function parseTbytThdvExcelFile(
  file: File,
  selectedSheetName?: string,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): Promise<ParseTbytThdvExcelResult> {
  const workbook = await readExcelFile(file);
  const availableSheets = workbook.SheetNames;

  const hintKeywords = [
    "06",
    "TBYT",
    "THIETBI",
    "THIET_BI",
    "MAY",
    "DVKT",
    "TBYTTHDV",
  ];

  const sheetName =
    selectedSheetName && availableSheets.includes(selectedSheetName)
      ? selectedSheetName
      : pickBestSheetName(workbook, matchTbytThdvSchemaKey, hintKeywords, 3);

  const worksheet = workbook.Sheets[sheetName];
  const result = parseTbytThdvWorksheet(
    worksheet,
    sheetName,
    availableSheets,
    file.name,
    workbook,
    defaultMaCskcb,
  );

  // Fallback nếu 0 bản ghi
  if (
    result.items.length === 0 &&
    availableSheets.length > 1 &&
    !selectedSheetName
  ) {
    const fallbackSheet = pickBestSheetName(workbook, matchTbytThdvSchemaKey);
    if (fallbackSheet && fallbackSheet !== sheetName) {
      const fallbackWs = workbook.Sheets[fallbackSheet];
      const fallbackResult = parseTbytThdvWorksheet(
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
 * Tạo XML Mẫu 06/DM: Danh mục thiết bị y tế để thực hiện DVKT (Loại HS 72)
 */
export function generateTbytThdvXml(
  items: DmTbytThdvItem[],
  maCskcb = DEFAULT_MA_CSKCB,
): string {
  const datasetId = `Id-${generateUUID()}`;
  const rowsXml = items
    .map((item) => renderTbytThdvItemXml(item, maCskcb))
    .join("\n");

  const datasetXml = `  <DSACH_TBYTTHDV Id="${datasetId}">\n${rowsXml}\n  </DSACH_TBYTTHDV>`;
  const signatureXml = buildSignatureBlock();

  return buildHsDanhMucDocument(datasetXml, signatureXml);
}

/**
 * Tạo Base64 từ danh sách DmTbytThdvItem
 */
export function generateTbytThdvBase64(
  items: DmTbytThdvItem[],
  maCskcb = DEFAULT_MA_CSKCB,
): string {
  const xml = generateTbytThdvXml(items, maCskcb);
  return xmlToBase64(xml);
}

/**
 * Tải file XML Mẫu 06/DM
 */
export function downloadTbytThdvXmlFile(
  xmlOrItems: string | DmTbytThdvItem[],
  fileName = `DM06_TBYTTHDV_LoaiHS72_${DEFAULT_MA_CSKCB}.xml`,
  maCskcb = DEFAULT_MA_CSKCB,
): void {
  const xml =
    typeof xmlOrItems === "string"
      ? xmlOrItems
      : generateTbytThdvXml(xmlOrItems, maCskcb);
  downloadXmlFile(xml, fileName);
}

/**
 * Xuất mẫu Excel chuẩn Mẫu 06/DM
 */
export function generateTbytThdvTemplate(): void {
  const ws = XLSX.utils.aoa_to_sheet([
    TBYTTHDV_EXCEL_TEMPLATE_LABELS,
    TBYTTHDV_EXCEL_TEMPLATE_HEADERS,
    ...TBYTTHDV_EXCEL_TEMPLATE_SAMPLES,
  ]);

  ws["!cols"] = TBYTTHDV_EXCEL_TEMPLATE_COLS;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "06_DM_TBYTTHDV");
  XLSX.writeFile(wb, "Mau_06_DM_ThietBiYTeThucHienDVKT_ChuanBHXH.xlsx");
}

export const downloadTbytThdvExcelTemplate = generateTbytThdvTemplate;

/**
 * Gửi dữ liệu Danh mục 06 (Loại HS 72) lên Cổng tiếp nhận Giám định BHYT (Sandbox Mock)
 */
export async function sendTbytThdvToBhxhGateway(
  items: DmTbytThdvItem[],
  maCskcb = DEFAULT_MA_CSKCB,
  maTinh = DEFAULT_MA_TINH,
): Promise<SendTbytThdvGatewayResult> {
  return mockSendDanhMucToBhxhGateway(
    "DANHMUC06",
    items.length,
    "TBYT thực hiện DVKT (Mẫu 06/DM - Loại HS 72)",
    maCskcb,
    maTinh,
  );
}
