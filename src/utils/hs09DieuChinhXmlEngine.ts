import * as XLSX from "xlsx";
import type {
  HoSoDieuChinh09Item,
  ParseHs09ExcelResult,
  SendHs09GatewayResult,
  Hs09GatewayCredentials,
} from "./types/hs09DieuChinhTypes";
import {
  HS09_SCHEMA_FIELDS,
  HS09_FIELD_HEURISTICS,
  HS09_EXCEL_TEMPLATE_HEADERS,
  HS09_EXCEL_TEMPLATE_COLS,
  HS09_EXCEL_TEMPLATE_SAMPLES,
} from "./constants/hs09DieuChinhConstants";
import {
  createSchemaKeyMatcher,
  readExcelFile,
  pickBestSheetName,
  detectHeaderRow,
  buildSignatureBlock,
  xmlToBase64,
  downloadXmlFile,
  getThoiGianTiepNhan,
  getTodayYmd,
  DEFAULT_MA_CSKCB,
} from "./shared/excelXmlShared";
import { parseHs09Row, renderHs09ItemXml } from "./parsers/hs09RowParser";

export { xmlToBase64, downloadXmlFile };

export const matchHs09SchemaKey = createSchemaKeyMatcher(
  HS09_SCHEMA_FIELDS,
  HS09_FIELD_HEURISTICS,
);

/**
 * Parse một sheet Excel thành danh sách HoSoDieuChinh09Item
 */
export function parseHs09Worksheet(
  worksheet: XLSX.WorkSheet,
  sheetName: string,
  availableSheets: string[],
  fileName: string,
  workbook?: XLSX.WorkBook,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): ParseHs09ExcelResult {
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
      missingRequiredFields: HS09_SCHEMA_FIELDS.filter((f) => f.required).map(
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
    matchHs09SchemaKey,
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
        const key = matchHs09SchemaKey(String(cell ?? "").trim());
        if (key && !Object.values(effectiveColMapping).includes(key)) {
          effectiveColMapping[idx] = key;
        }
      });
    }
  }

  const detectedHeaders = effectiveColMapping;

  const matchedFieldKeys = new Set(Object.values(effectiveColMapping));
  const missingRequiredFields = HS09_SCHEMA_FIELDS.filter(
    (f) => f.required && !matchedFieldKeys.has(f.key),
  ).map((f) => f.key);

  const items: HoSoDieuChinh09Item[] = [];
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

    const item = parseHs09Row(rowObj, r, items.length + 1, defaultMaCskcb);

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
export async function parseHs09ExcelFile(
  file: File,
  selectedSheetName?: string,
  defaultMaCskcb = DEFAULT_MA_CSKCB,
): Promise<ParseHs09ExcelResult> {
  const workbook = await readExcelFile(file);
  const availableSheets = workbook.SheetNames;

  const hintKeywords = [
    "HSDC09",
    "09BH",
    "DieuChinh",
    "XuatToan",
    "Mẫu 09",
    "HS09",
  ];

  let sheetName = selectedSheetName;
  if (!sheetName || !availableSheets.includes(sheetName)) {
    sheetName = pickBestSheetName(workbook, matchHs09SchemaKey, hintKeywords);
  }

  const worksheet = workbook.Sheets[sheetName];
  return parseHs09Worksheet(
    worksheet,
    sheetName,
    availableSheets,
    file.name,
    workbook,
    defaultMaCskcb,
  );
}

/**
 * Sinh cấu trúc XML chuẩn <HOSO_DIEUCHINH_GD> cho Mẫu 09/BH (Loại HS 73)
 */
export function generateHs09Xml(
  items: HoSoDieuChinh09Item[],
  maCskcb = DEFAULT_MA_CSKCB,
): string {
  const recordsXml = items
    .map((item) => renderHs09ItemXml(item, maCskcb))
    .join("\n");

  const signatureXml = buildSignatureBlock();

  return `<?xml version="1.0" encoding="utf-8"?>
<HOSO_DIEUCHINH_GD>
${recordsXml}
${signatureXml}
</HOSO_DIEUCHINH_GD>`;
}

/**
 * Tạo Base64 từ danh sách HoSoDieuChinh09Item
 */
export function generateHs09Base64(
  items: HoSoDieuChinh09Item[],
  maCskcb = DEFAULT_MA_CSKCB,
): string {
  const xml = generateHs09Xml(items, maCskcb);
  return xmlToBase64(xml);
}

/**
 * Tải file XML Mẫu 09/BH xuống máy
 */
export function downloadHs09XmlFile(
  itemsOrXml: HoSoDieuChinh09Item[] | string,
  maCskcb = DEFAULT_MA_CSKCB,
  customFileName?: string,
): void {
  const xml =
    typeof itemsOrXml === "string"
      ? itemsOrXml
      : generateHs09Xml(itemsOrXml, maCskcb);
  const fileName =
    customFileName ||
    `HSDC09BH_${maCskcb}_${getTodayYmd()}_${Date.now().toString().slice(-4)}.xml`;
  downloadXmlFile(xml, fileName);
}

/**
 * Tạo & Tải file Excel Mẫu 09/BH chuẩn 22 cột
 */
export function downloadHs09ExcelTemplate(): void {
  const ws = XLSX.utils.aoa_to_sheet([
    HS09_EXCEL_TEMPLATE_HEADERS,
    ...HS09_EXCEL_TEMPLATE_SAMPLES,
  ]);
  ws["!cols"] = HS09_EXCEL_TEMPLATE_COLS;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "HSDC09BH");
  XLSX.writeFile(wb, "Mau_09BH_HoSoDieuChinh_Chuan_22Cot.xlsx");
}

/**
 * Gửi hồ sơ điều chỉnh Mẫu 09/BH lên Cổng tiếp nhận Giám định BHYT (Sandbox)
 * Endpoint: https://egw.baohiemxahoi.gov.vn/api/HSDCTT12/GuiHoSoDieuChinh09BH (Loại HS 73)
 */
export async function sendHs09ToBhxhGateway(
  items: HoSoDieuChinh09Item[],
  credentials?: Partial<Hs09GatewayCredentials>,
  delayMs = 1000,
): Promise<SendHs09GatewayResult> {
  const maCskcb =
    credentials?.maCskcb || items[0]?.ttMau?.maCskcb || DEFAULT_MA_CSKCB;
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  const maGiaoDich = `HSDC09BH_${maCskcb}_${getTodayYmd()}_${Date.now().toString().slice(-6)}`;

  return {
    maKetQua: "200",
    maGiaoDich,
    thongDiep: `[Mô phỏng Sandbox] Tiếp nhận thành công ${items.length} hồ sơ điều chỉnh Mẫu 09/BH vào Hệ thống Giám định BHYT`,
    thoiGianTiepNhan: getThoiGianTiepNhan(),
    totalRecords: items.length,
    loaiHs: "73",
  };
}
