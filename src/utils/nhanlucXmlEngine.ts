import * as XLSX from "xlsx";
import type { DmNhanLucItem } from "../types";
import type {
  ParseNhanLucExcelResult,
  SendNhanLucGatewayResult,
} from "./types/nhanLucTypes";
import {
  NHANLUC_SCHEMA_FIELDS,
  NHANLUC_EXCEL_TEMPLATE_HEADERS,
  NHANLUC_EXCEL_TEMPLATE_LABELS,
  NHANLUC_EXCEL_TEMPLATE_COLS,
  NHANLUC_EXCEL_TEMPLATE_SAMPLES,
  NHANLUC_FIELD_HEURISTICS,
} from "./constants/nhanLucConstants";
import {
  parseNhanLucRow,
  renderNhanLucItemXml,
  parseGioiTinh,
  parseChucDanhNn,
  parseThoiGianDk,
} from "./parsers";
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

// Re-export để giữ nguyên API công khai cũ
export {
  xmlToBase64,
  downloadXmlFile,
  parseNhanLucRow,
  renderNhanLucItemXml,
  parseGioiTinh,
  parseChucDanhNn,
  parseThoiGianDk,
};

const matchNhanLucSchemaKey = createSchemaKeyMatcher(
  NHANLUC_SCHEMA_FIELDS,
  NHANLUC_FIELD_HEURISTICS,
);

export function findMatchingSchemaKey(colHeader: string): string | null {
  return matchNhanLucSchemaKey(colHeader);
}

// Parse Worksheet
export function parseNhanLucWorksheet(
  ws: XLSX.WorkSheet,
  sheetName: string,
  allSheets: string[],
  fileName = "",
  wb?: XLSX.WorkBook,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): ParseNhanLucExcelResult {
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
  });

  if (!rawData || rawData.length === 0) {
    return {
      sheetName,
      fileName,
      availableSheets: allSheets,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      items: [],
      missingRequiredColumns: NHANLUC_SCHEMA_FIELDS.filter(
        (f) => f.required,
      ).map((f) => f.key),
      recognizedColumns: [],
      isMultiSheet: allSheets.length > 1,
      workbook: wb,
      selectedSheet: sheetName,
    };
  }

  const { headerRowIndex: headerRowIdx, colMapping: bestColMapping } =
    detectHeaderRow(rawData, matchNhanLucSchemaKey, 1, 25, "best");

  const recognizedColumns = Object.entries(bestColMapping).map(
    ([cIdx, key]) => ({
      key,
      colName: String(rawData[headerRowIdx]?.[Number(cIdx)] || key),
    }),
  );

  const recognizedKeysSet = new Set(Object.values(bestColMapping));
  const missingRequired = NHANLUC_SCHEMA_FIELDS.filter(
    (f) => f.required && !recognizedKeysSet.has(f.key),
  ).map((f) => f.key);

  const items: DmNhanLucItem[] = [];

  for (let r = headerRowIdx + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (
      !row ||
      row.every((c: unknown) => c === "" || c === null || c === undefined)
    ) {
      continue;
    }

    const rowObj: Record<string, unknown> = {};
    for (const [colIdx, key] of Object.entries(bestColMapping)) {
      rowObj[key] = row[Number(colIdx)];
    }

    const item = parseNhanLucRow(rowObj, r, items.length + 1, defaultMaCskcb);
    if (item) {
      items.push(item);
    }
  }

  const validRows = items.filter((i) => i.isValid).length;
  const invalidRows = items.length - validRows;

  const sheetsMeta = wb
    ? allSheets.map((sName) => {
        const s = wb.Sheets[sName];
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
    sheetName,
    fileName,
    availableSheets: allSheets,
    totalRows: items.length,
    validRows,
    invalidRows,
    items,
    missingRequiredColumns: missingRequired,
    recognizedColumns,
    isMultiSheet: allSheets.length > 1,
    workbook: wb,
    sheets: sheetsMeta,
    selectedSheet: sheetName,
  };
}

// Parse Excel File
export async function parseNhanLucExcelFile(
  file: File,
  selectedSheetName?: string,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): Promise<ParseNhanLucExcelResult> {
  try {
    const workbook = await readExcelFile(file);
    const allSheets = workbook.SheetNames;

    const hintKeywords = [
      "02",
      "NHANLUC",
      "CANBO",
      "BACSI",
      "NHAN_LUC",
    ];

    const targetSheetName =
      selectedSheetName && allSheets.includes(selectedSheetName)
        ? selectedSheetName
        : pickBestSheetName(workbook, matchNhanLucSchemaKey, hintKeywords);

    const ws = workbook.Sheets[targetSheetName];
    return parseNhanLucWorksheet(
      ws,
      targetSheetName,
      allSheets,
      file.name,
      workbook,
      defaultMaCskcb,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi định dạng";
    throw new Error(`Không thể đọc file Excel: ${msg}`);
  }
}

// Tạo chuỗi XML chuẩn 02/DM
export function generateNhanLucXml(
  items: DmNhanLucItem[],
  maCskcb = DEFAULT_MA_CSKCB,
): string {
  const containerGuid = `Id-${generateUUID()}`;
  const rowsXml = items
    .map((item) => renderNhanLucItemXml(item, maCskcb))
    .join("\n");

  const containerXml = `  <DANHSACH_DMNHANLUCKBCB Id="${containerGuid}">
${rowsXml}
  </DANHSACH_DMNHANLUCKBCB>`;

  const signature = buildSignatureBlock();
  return buildHsDanhMucDocument(containerXml, signature);
}

// Tải file XML xuống máy
export function downloadNhanLucXmlFile(
  xmlContent: string,
  fileName = `DanhMuc02_NHANLUCKBCB_${DEFAULT_MA_CSKCB}.xml`,
): void {
  downloadXmlFile(xmlContent, fileName);
}

// Tải template Excel mẫu 02/DM
export function downloadNhanLucExcelTemplate(): void {
  const wsData = [
    NHANLUC_EXCEL_TEMPLATE_LABELS,
    NHANLUC_EXCEL_TEMPLATE_HEADERS,
    ...NHANLUC_EXCEL_TEMPLATE_SAMPLES,
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws["!cols"] = NHANLUC_EXCEL_TEMPLATE_COLS;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "02_DM_NHANLUC");
  XLSX.writeFile(wb, "Mau_02_DM_NhanLuc_KCB_BHYT.xlsx");
}

/**
 * Gửi dữ liệu Mẫu 02/DM lên Cổng tiếp nhận BHXH Việt Nam (mô phỏng sandbox)
 */
export async function sendNhanLucToBhxhGateway(
  items: DmNhanLucItem[],
  maCskcb: string = DEFAULT_MA_CSKCB,
  maTinh: string = DEFAULT_MA_TINH,
): Promise<SendNhanLucGatewayResult> {
  return mockSendDanhMucToBhxhGateway(
    "DANHMUC02",
    items.length,
    "Danh mục Nhân Lực KCB (Loại 71)",
    maCskcb,
    maTinh,
  );
}
