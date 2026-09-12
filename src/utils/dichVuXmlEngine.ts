import * as XLSX from "xlsx";
import type {
  DmDichVuItem,
  ParseDichVuExcelResult,
  SendDichVuGatewayResult,
} from "./types/dichVuTypes";
import {
  DICHVU_SCHEMA_FIELDS,
  DICHVU_FIELD_HEURISTICS,
  DICHVU_EXCEL_TEMPLATE_HEADERS,
  DICHVU_EXCEL_TEMPLATE_LABELS,
  DICHVU_EXCEL_TEMPLATE_COLS,
  DICHVU_EXCEL_TEMPLATE_SAMPLES,
} from "./constants/dichVuConstants";
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
import { parseDichVuRow, renderDichVuItemXml } from "./parsers/dichVuRowParser";

export { xmlToBase64, downloadXmlFile };

export const matchDichVuSchemaKey = createSchemaKeyMatcher(
  DICHVU_SCHEMA_FIELDS,
  DICHVU_FIELD_HEURISTICS,
);

export function findMatchingDichVuSchemaKey(colHeader: string): string | null {
  return matchDichVuSchemaKey(colHeader);
}

/**
 * Parse một sheet cụ thể thành danh sách DmDichVuItem
 */
export function parseDichVuWorksheet(
  worksheet: XLSX.WorkSheet,
  sheetName: string,
  availableSheets: string[],
  fileName: string,
  workbook?: XLSX.WorkBook,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): ParseDichVuExcelResult {
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
      missingRequiredFields: DICHVU_SCHEMA_FIELDS.filter((f) => f.required).map(
        (f) => f.key,
      ),
      availableSheets,
      selectedSheet: sheetName,
      fileName,
      workbook,
    };
  }

  const { headerRowIndex, colMapping } = detectHeaderRow(
    rawRows,
    matchDichVuSchemaKey,
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
        const key = matchDichVuSchemaKey(String(cell ?? "").trim());
        if (key && !Object.values(effectiveColMapping).includes(key)) {
          effectiveColMapping[idx] = key;
        }
      });
    }
  }

  const detectedHeaders = effectiveColMapping;
  const matchedFieldKeys = new Set(Object.values(effectiveColMapping));
  const missingRequiredFields = DICHVU_SCHEMA_FIELDS.filter(
    (f) => f.required && !matchedFieldKeys.has(f.key),
  ).map((f) => f.key);

  const items: DmDichVuItem[] = [];
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

    const item = parseDichVuRow(
      rowObj,
      r,
      items.length + 1,
      defaultMaCskcb,
    );

    if (!item) {
      continue;
    }

    if (item.isValid) {
      validRows++;
    } else {
      invalidRows++;
    }

    items.push(item);
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
 * Đọc file Excel DVKT và phân tích tự động
 */
export async function parseDichVuExcelFile(
  file: File,
  selectedSheetName?: string,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): Promise<ParseDichVuExcelResult> {
  const workbook = await readExcelFile(file);
  const availableSheets = workbook.SheetNames;

  const hintKeywords = ["05", "DVKT", "DICHVU", "DICH_VU", "DV", "KBCB"];

  const sheetName =
    selectedSheetName && availableSheets.includes(selectedSheetName)
      ? selectedSheetName
      : pickBestSheetName(workbook, matchDichVuSchemaKey, hintKeywords, 2);

  const worksheet = workbook.Sheets[sheetName];
  const result = parseDichVuWorksheet(
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
    const fallbackSheet = pickBestSheetName(workbook, matchDichVuSchemaKey);
    if (fallbackSheet && fallbackSheet !== sheetName) {
      const fallbackWs = workbook.Sheets[fallbackSheet];
      const fallbackResult = parseDichVuWorksheet(
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
 * Tạo XML Mẫu 05/DM: Danh mục dịch vụ KBCB áp dụng trong thanh toán BHYT (Loại HS 12)
 */
export function generateDichVuXml(
  items: DmDichVuItem[],
  maCskcb = DEFAULT_MA_CSKCB,
): string {
  const datasetId = `Id-${generateUUID()}`;
  const rowsXml = items.map((item) => renderDichVuItemXml(item, maCskcb)).join("\n");
  const datasetXml = `  <DANHSACH_DMDICHVUKBCB Id="${datasetId}">\n${rowsXml}\n  </DANHSACH_DMDICHVUKBCB>`;
  const signatureXml = buildSignatureBlock();

  return buildHsDanhMucDocument(datasetXml, signatureXml);
}

/**
 * Tạo Base64 từ danh sách DmDichVuItem
 */
export function generateDichVuBase64(
  items: DmDichVuItem[],
  maCskcb = DEFAULT_MA_CSKCB,
): string {
  const xml = generateDichVuXml(items, maCskcb);
  return xmlToBase64(xml);
}

/**
 * Tải file XML Mẫu 05/DM
 */
export function downloadDichVuXmlFile(
  xmlOrItems: string | DmDichVuItem[],
  fileName = `DM05_DVKT_LoaiHS12_${DEFAULT_MA_CSKCB}.xml`,
  maCskcb = DEFAULT_MA_CSKCB,
): void {
  const xml =
    typeof xmlOrItems === "string"
      ? xmlOrItems
      : generateDichVuXml(xmlOrItems, maCskcb);
  downloadXmlFile(xml, fileName);
}

/**
 * Xuất file Excel mẫu chuẩn 16 cột Mẫu 05/DM
 */
export function generateDichVuTemplate(): void {
  const wsData = [
    DICHVU_EXCEL_TEMPLATE_LABELS,
    DICHVU_EXCEL_TEMPLATE_HEADERS,
    ...DICHVU_EXCEL_TEMPLATE_SAMPLES,
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = DICHVU_EXCEL_TEMPLATE_COLS;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "05_DM_DVKT");
  XLSX.writeFile(wb, "Mau_05_DM_DichVuKyThuat_ChuanBHXH.xlsx");
}

/**
 * Gửi dữ liệu Danh mục 05 (Loại HS 12) lên Cổng tiếp nhận Giám định BHYT (Sandbox Mock)
 */
export async function sendDichVuToBhxhGateway(
  items: DmDichVuItem[],
  maCskcb = DEFAULT_MA_CSKCB,
  maTinh = DEFAULT_MA_TINH,
): Promise<SendDichVuGatewayResult> {
  return mockSendDanhMucToBhxhGateway(
    "DANHMUC05",
    items.length,
    "Dịch vụ kỹ thuật KCB BHYT (Mẫu 05/DM - Loại HS 12)",
    maCskcb,
    maTinh,
  );
}
