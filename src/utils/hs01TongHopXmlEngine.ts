import * as XLSX from "xlsx";
import type {
  Hs01TongHopItem,
  ParseHs01ExcelResult,
  SendHs01GatewayResult,
} from "./types/hs01TongHopTypes";
import {
  HS01_SCHEMA_FIELDS,
  HS01_FIELD_HEURISTICS,
  HS01_EXCEL_TEMPLATE_HEADERS,
  HS01_EXCEL_TEMPLATE_COLS,
  HS01_EXCEL_TEMPLATE_SAMPLES,
} from "./constants/hs01TongHopConstants";
import {
  createSchemaKeyMatcher,
  parseYmdHmDate,
  isValidYmdHmDate,
  formatCurrencyDecimals,
  readExcelFile,
  pickBestSheetName,
  detectHeaderRow,
  generateUUID,
  buildSignatureBlock,
  xmlToBase64,
  downloadXmlFile,
  getThoiGianTiepNhan,
  DEFAULT_MA_CSKCB,
} from "./shared/excelXmlShared";
import { validateHs01Data } from "./validators/hs01Validator";
import {
  parseHs01Row,
  renderHs01ItemXml,
} from "./parsers/hs01TongHopRowParser";

export {
  xmlToBase64,
  downloadXmlFile,
  parseYmdHmDate,
  isValidYmdHmDate,
  formatCurrencyDecimals,
  validateHs01Data,
};

export const matchHs01SchemaKey = createSchemaKeyMatcher(
  HS01_SCHEMA_FIELDS,
  HS01_FIELD_HEURISTICS,
);

/**
 * Parse một sheet Excel thành danh sách Hs01TongHopItem
 */
export function parseHs01Worksheet(
  worksheet: XLSX.WorkSheet,
  sheetName: string,
  availableSheets: string[],
  fileName: string,
  workbook?: XLSX.WorkBook,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): ParseHs01ExcelResult {
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
      missingRequiredFields: HS01_SCHEMA_FIELDS.filter((f) => f.required).map(
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
    matchHs01SchemaKey,
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
        const key = matchHs01SchemaKey(String(cell ?? "").trim());
        if (key && !Object.values(effectiveColMapping).includes(key)) {
          effectiveColMapping[idx] = key;
        }
      });
    }
  }

  const detectedHeaders = effectiveColMapping;
  const matchedFieldKeys = new Set(Object.values(effectiveColMapping));
  const missingRequiredFields = HS01_SCHEMA_FIELDS.filter(
    (f) => f.required && !matchedFieldKeys.has(f.key),
  ).map((f) => f.key);

  const items: Hs01TongHopItem[] = [];
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

    const item = parseHs01Row(rowObj, r, items.length + 1, defaultMaCskcb);

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
 * Đọc file Excel tải đúng sheet nếu trong file nhiều sheet
 */
export async function parseHs01ExcelFile(
  file: File,
  selectedSheetName?: string,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): Promise<ParseHs01ExcelResult> {
  const workbook = await readExcelFile(file);
  const availableSheets = workbook.SheetNames;

  const hintKeywords = ["HSTH01", "01BH", "TongHop", "Mẫu 01", "Hồ sơ"];

  let sheetName = selectedSheetName;
  if (!sheetName || !availableSheets.includes(sheetName)) {
    sheetName = pickBestSheetName(workbook, matchHs01SchemaKey, hintKeywords);
  }

  const worksheet = workbook.Sheets[sheetName];
  return parseHs01Worksheet(
    worksheet,
    sheetName,
    availableSheets,
    file.name,
    workbook,
    defaultMaCskcb,
  );
}

/**
 * Sinh cấu trúc XML chuẩn <HSTH01BH> cho Mẫu 01/BH (Loại HS 5)
 */
export function generateHs01Xml(
  items: Hs01TongHopItem[],
  maCskcb = DEFAULT_MA_CSKCB,
): string {
  const containerGuid = `Id-${generateUUID()}`;
  const rowsXml = items
    .map((item) => renderHs01ItemXml(item, maCskcb))
    .join("\n");

  const datasetXml = `  <DS_CHITIET Id="${containerGuid}">
${rowsXml}
  </DS_CHITIET>`;

  const signatureXml = buildSignatureBlock();

  return `<?xml version="1.0" encoding="utf-8"?>
<HSTH01BH>
${datasetXml}
${signatureXml}
</HSTH01BH>`;
}

/**
 * Tải file XML Mẫu 01/BH xuống máy
 */
export function downloadHs01XmlFile(
  items: Hs01TongHopItem[],
  maCskcb = DEFAULT_MA_CSKCB,
  customFileName?: string,
): void {
  const xml = generateHs01Xml(items, maCskcb);
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const fileName =
    customFileName || `HSTH01BH_${maCskcb}_${ymd}_${items.length}HS.xml`;
  downloadXmlFile(xml, fileName);
}

/**
 * Tạo & Tải file Excel Mẫu 01/BH chuẩn 20 cột
 */
export function downloadHs01ExcelTemplate(): void {
  const ws = XLSX.utils.aoa_to_sheet([
    HS01_EXCEL_TEMPLATE_HEADERS,
    ...HS01_EXCEL_TEMPLATE_SAMPLES,
  ]);
  ws["!cols"] = HS01_EXCEL_TEMPLATE_COLS;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "HSTH01BH");
  XLSX.writeFile(wb, "Mau_01BH_HoSoTongHop_Chuan_20Cot.xlsx");
}

/**
 * Gửi hồ sơ tổng hợp Mẫu 01/BH lên Cổng tiếp nhận Giám định BHYT (Sandbox)
 */
export async function sendHs01ToBhxhGateway(
  items: Hs01TongHopItem[],
  credentials: {
    maCskcb: string;
    username: string;
    passwordHash: string;
    accessToken: string;
    tokenId: string;
    maTinh: string;
    kyQT: string;
  },
  delayMs = 1000,
): Promise<SendHs01GatewayResult> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  const maGiaoDich = `HS01BH_${credentials.maCskcb}_${credentials.kyQT}_${Date.now().toString().slice(-6)}`;

  return {
    maKetQua: "200",
    maGiaoDich,
    thongDiep: `[Mô phỏng Sandbox] Tiếp nhận thành công ${items.length} hồ sơ tổng hợp Mẫu 01/BH vào Hệ thống Giám định BHYT`,
    thoiGianTiepNhan: getThoiGianTiepNhan(),
    totalRecords: items.length,
    kyQT: credentials.kyQT,
    loaiHs: "5",
  };
}
