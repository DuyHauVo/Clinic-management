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
  THUOC_EXCEL_TEMPLATE_COLS,
  THUOC_EXCEL_TEMPLATE_SAMPLES,
  THUOC_FIELD_HEURISTICS,
} from "./constants/thuocConstants";
import { parseThuocRow, parseLoaiThuoc, renderThuocItemXml } from "./parsers";
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

export { xmlToBase64, parseLoaiThuoc, parseThuocRow, renderThuocItemXml };

export const matchThuocSchemaKey = createSchemaKeyMatcher(
  THUOC_SCHEMA_FIELDS,
  THUOC_FIELD_HEURISTICS,
);

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
  defaultMaCskcb = DEFAULT_MA_CSKCB,
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
  const matchedFieldKeys = new Set(Object.values(colMapping));

  for (const [colIdxStr, schemaKey] of Object.entries(colMapping)) {
    const colIdx = Number(colIdxStr);
    const headerLabel =
      headerRowIndex >= 0
        ? String(rawRows[headerRowIndex]?.[colIdx] ?? "").trim()
        : "";
    matchedColumnsMap[schemaKey] = headerLabel || schemaKey;
  }

  const missingRequiredColumns = THUOC_SCHEMA_FIELDS.filter(
    (f) => f.required && !matchedFieldKeys.has(f.key),
  ).map((f) => f.key);

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

    const item = parseThuocRow(rowObj, r, items.length + 1, defaultMaCskcb);
    items.push(item);
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
    matchedFields: Array.from(matchedFieldKeys),
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
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): Promise<ParseThuocExcelResult> {
  const workbook = await readExcelFile(file);
  const allSheets = workbook.SheetNames;

  const hintKeywords = ["03", "THUOC", "DUOC", "MAU", "CHEPHAM", "CHE_PHAM"];

  const bestSheet =
    selectedSheetName && allSheets.includes(selectedSheetName)
      ? selectedSheetName
      : pickBestSheetName(workbook, matchThuocSchemaKey, hintKeywords);

  return parseThuocWorksheet(workbook, bestSheet, file.name, defaultMaCskcb);
}

/**
 * Tạo tài liệu XML chuẩn Mẫu 03/DM (Loại hồ sơ 10)
 * Gói trong thẻ <HSDANHMUC> và <DANHSACH_DMTHUOCMAUCHEPHAMMAU>
 */
export function generateThuocXml(items: DmThuocItem[]): string {
  const containerGuid = `Id-${generateUUID()}`;
  const rowsXml = items.map(renderThuocItemXml).join("\n");
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
  fileName = `DanhMuc03_DMTHUOC_${DEFAULT_MA_CSKCB}.xml`,
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

  ws["!cols"] = THUOC_EXCEL_TEMPLATE_COLS;

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
  maCskcb = DEFAULT_MA_CSKCB,
  maTinh = DEFAULT_MA_TINH,
): Promise<SendThuocGatewayResult> {
  return mockSendDanhMucToBhxhGateway(
    "DANHMUC03",
    items.length,
    "Danh mục Thuốc, Máu & Chế phẩm máu (Loại 10)",
    maCskcb,
    maTinh,
  );
}
