import * as XLSX from "xlsx";
import type { DmBpcmItem } from "../types";
import type { SheetInfo, ParseExcelResult } from "./types/bpcmTypes";
import {
  BPCM_SCHEMA_FIELDS,
  BPCM_EXCEL_TEMPLATE_HEADERS,
  BPCM_EXCEL_TEMPLATE_LABELS,
  BPCM_EXCEL_TEMPLATE_COLS,
  BPCM_EXCEL_TEMPLATE_SAMPLES,
  BPCM_FIELD_HEURISTICS,
} from "./constants/bpcmConstants";
import { parseBpcmRow, renderBpcmItemXml } from "./parsers";
import {
  normalizeHeaderKey,
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
  type GatewaySendResult,
  DEFAULT_MA_CSKCB,
  DEFAULT_MA_TINH,
} from "./shared";

// Re-export để giữ nguyên API công khai cũ
export {
  normalizeHeaderKey,
  xmlToBase64,
  downloadXmlFile,
  parseBpcmRow,
  renderBpcmItemXml,
};

export const matchBpcmSchemaKey = createSchemaKeyMatcher(
  BPCM_SCHEMA_FIELDS,
  BPCM_FIELD_HEURISTICS,
);

export function findMatchingBpcmSchemaKey(colHeader: string): string | null {
  return matchBpcmSchemaKey(colHeader);
}

/**
 * Phân tích 1 sheet cụ thể trong Workbook
 */
export function parseWorksheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
  fileName: string,
  defaultMaCskcb: string = DEFAULT_MA_CSKCB,
): ParseExcelResult {
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" không tồn tại trong tệp!`);
  }

  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  // Thu thập thông tin tất cả các sheets trong workbook
  const sheetsInfo: SheetInfo[] = workbook.SheetNames.map((name) => {
    const ws = workbook.Sheets[name];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: "",
    });

    let matchedCount = 0;
    if (rows && rows.length > 0) {
      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const row = rows[r];
        if (!Array.isArray(row)) continue;
        let cCount = 0;
        row.forEach((cell) => {
          if (matchBpcmSchemaKey(String(cell ?? ""))) {
            cCount++;
          }
        });
        if (cCount > matchedCount) matchedCount = cCount;
      }
    }

    return {
      name,
      rowCount: rows.length > 0 ? rows.length - 1 : 0,
      matchedColumnCount: matchedCount,
    };
  });

  // Tìm dòng tiêu đề trong sheet được chọn
  const { headerRowIndex: detectedIdx, colMapping } = detectHeaderRow(
    rawRows,
    matchBpcmSchemaKey,
    3,
    15,
    "first",
  );

  let headerRowIndex = detectedIdx;
  const effectiveColMapping: { [colIdx: number]: string } = { ...colMapping };

  // Fallback nếu không phát hiện dòng tiêu đề
  if (headerRowIndex === -1 && rawRows.length > 0) {
    headerRowIndex = 0;
    rawRows[0].forEach((cellValue, colIndex) => {
      const matchedKey = matchBpcmSchemaKey(String(cellValue ?? ""));
      if (
        matchedKey &&
        !Object.values(effectiveColMapping).includes(matchedKey)
      ) {
        effectiveColMapping[colIndex] = matchedKey;
      }
    });
  }

  const matchedFieldKeys = new Set(Object.values(effectiveColMapping));
  const missingKeys = BPCM_SCHEMA_FIELDS.filter(
    (f) => f.required && !matchedFieldKeys.has(f.key),
  ).map((f) => f.key);

  const items: DmBpcmItem[] = [];

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.every((cell) => String(cell ?? "").trim() === "")) {
      continue;
    }

    const rowObj: Record<string, unknown> = {};
    for (const [colIdxStr, key] of Object.entries(effectiveColMapping)) {
      rowObj[key] = row[Number(colIdxStr)];
    }

    const item = parseBpcmRow(rowObj, r, items.length + 1, defaultMaCskcb);
    if (item) {
      items.push(item);
    }
  }

  const validRowsCount = items.filter((i) => i.isValid).length;
  const matchedColumnsMap: { [schemaKey: string]: string } = {};
  for (const [colIdxStr, schemaKey] of Object.entries(effectiveColMapping)) {
    const colIdx = Number(colIdxStr);
    matchedColumnsMap[schemaKey] = String(
      rawRows[headerRowIndex]?.[colIdx] || schemaKey,
    );
  }

  return {
    items,
    matchedFields: Array.from(matchedFieldKeys),
    missingFields: missingKeys,
    matchedColumnsMap,
    totalRows: items.length,
    validRows: validRowsCount,
    invalidRows: items.length - validRowsCount,
    fileName,
    sheets: sheetsInfo,
    selectedSheet: sheetName,
    workbook,
  };
}

/**
 * Đọc file Excel BPCM từ máy tính của người dùng
 */
export async function parseBpcmExcelFile(
  file: File,
  defaultMaCskcb: string = DEFAULT_MA_CSKCB,
  preferredSheet?: string,
): Promise<ParseExcelResult> {
  try {
    const workbook = await readExcelFile(file);

    const hintKeywords = ["01", "BPCM", "KHOA", "PHONG", "BANKHAM", "BO_PHAN"];

    const targetSheetName =
      preferredSheet && workbook.SheetNames.includes(preferredSheet)
        ? preferredSheet
        : pickBestSheetName(workbook, matchBpcmSchemaKey, hintKeywords);

    return parseWorksheet(workbook, targetSheetName, file.name, defaultMaCskcb);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Không hợp lệ";
    throw new Error(`Lỗi đọc file Excel: ${msg}`);
  }
}

/**
 * Tạo XML chuẩn Mẫu 01/DM
 */
export function generateBpcmXml(
  items: DmBpcmItem[],
  maCskcb = DEFAULT_MA_CSKCB,
): string {
  const datasetId = `Id-${generateUUID()}`;
  const rowsXml = items
    .map((item) => renderBpcmItemXml(item, maCskcb))
    .join("\n");

  const containerXml = `  <DANHSACH_DMBOPHANCHUYENMON Id="${datasetId}">
${rowsXml}
  </DANHSACH_DMBOPHANCHUYENMON>`;
  const signature = buildSignatureBlock();

  return buildHsDanhMucDocument(containerXml, signature);
}

/**
 * Tải file XML xuống máy tính của người dùng
 */
export function downloadBpcmXmlFile(
  xmlContent: string,
  fileName: string = `DanhMuc01_BPCMKBCB_${DEFAULT_MA_CSKCB}.xml`,
): void {
  downloadXmlFile(xmlContent, fileName);
}

/**
 * Xuất file Excel mẫu chuẩn Mẫu 01/DM (Loại 70) để người dùng điền
 */
export function downloadBpcmExcelTemplate(): void {
  const ws = XLSX.utils.aoa_to_sheet([
    BPCM_EXCEL_TEMPLATE_LABELS,
    BPCM_EXCEL_TEMPLATE_HEADERS,
    ...BPCM_EXCEL_TEMPLATE_SAMPLES,
  ]);

  ws["!cols"] = BPCM_EXCEL_TEMPLATE_COLS;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DM_BPCM_Loai70");
  XLSX.writeFile(wb, "Mau_01_DM_BoPhanChuyenMon_Loai70.xlsx");
}

/**
 * Gửi dữ liệu lên Cổng tiếp nhận BHXH Việt Nam (mô phỏng sandbox)
 */
export async function sendBpcmToBhxhGateway(
  items: DmBpcmItem[],
  maCskcb: string = DEFAULT_MA_CSKCB,
  maTinh: string = DEFAULT_MA_TINH,
): Promise<GatewaySendResult> {
  return mockSendDanhMucToBhxhGateway(
    "DANHMUC01",
    items.length,
    "Danh mục BPCM (Loại 70)",
    maCskcb,
    maTinh,
  );
}
