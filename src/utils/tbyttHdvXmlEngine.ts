import * as XLSX from "xlsx";
import type {
  DmTbytThdvItem,
  ParseTbytThdvExcelResult,
  SendTbytThdvGatewayResult,
} from "./types/tbyttHdvTypes";
import {
  TBYTTHDV_SCHEMA_FIELDS,
  TBYTTHDV_FIELD_HEURISTICS,
} from "./constants/tbyttHdvConstants";
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
  DEFAULT_MA_CSKCB,
} from "./shared/excelXmlShared";
import { validateTbytThdvData } from "./validators";

export { xmlToBase64, downloadXmlFile };

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

    const tenTb = String(rowObj["TEN_TB"] ?? "").trim();
    const maMay = String(rowObj["MA_MAY"] ?? "").trim();

    if (!tenTb && !maMay) {
      continue;
    }

    const stt = parseNumberCell(rowObj["STT"], items.length + 1);
    const kyHieu = String(rowObj["KY_HIEU"] ?? "").trim() || undefined;
    const congTySx = String(rowObj["CONGTY_SX"] ?? "").trim() || undefined;
    const nuocSx = String(rowObj["NUOC_SX"] ?? "").trim() || undefined;

    const parseYear = (val: unknown): number | undefined => {
      if (val === undefined || val === null || val === "") return undefined;
      const parsed = parseNumberCell(val, 0);
      return parsed > 0 ? parsed : undefined;
    };

    const namSx = parseYear(rowObj["NAM_SX"]);
    const namSd = parseYear(rowObj["NAM_SD"]);

    const soLuuHanh = String(rowObj["SO_LUU_HANH"] ?? "").trim() || undefined;
    const hdTu = parseYmdDate(rowObj["HD_TU"]);
    const hdDen = parseYmdDate(rowObj["HD_DEN"]);

    const rawTuNgay = rowObj["TU_NGAY"];
    const parsedTuNgay = parseYmdDate(rawTuNgay);
    const todayYmd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const tuNgay = parsedTuNgay || todayYmd;
    const denNgay = parseYmdDate(rowObj["DEN_NGAY"]);

    const maCskcb =
      String(rowObj["MA_CSKCB"] ?? defaultMaCskcb).trim() || defaultMaCskcb;

    // Validation
    const errors = validateTbytThdvData({
      tenTb,
      maMay,
      parsedTuNgay
    });

    const isValid = errors.length === 0;
    if (isValid) validRows++;
    else invalidRows++;

    items.push({
      id: `tbthdv-${generateUUID()}`,
      stt,
      tenTb,
      kyHieu,
      congTySx,
      nuocSx,
      namSx,
      namSd,
      maMay,
      soLuuHanh,
      hdTu,
      hdDen,
      tuNgay,
      denNgay,
      maCskcb,
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
    const fallbackSheet = findBestSheetName(workbook, matchTbytThdvSchemaKey);
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
  maCskcb = "01929",
): string {
  const datasetId = `Id-${generateUUID()}`;
  const todayYmd = new Date().toISOString().slice(0, 10).replace(/-/g, "");

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

      return `    <DM_TBYTTHDV>
      <STT>${stt}</STT>
      <TEN_TB>${escapeXml(item.tenTb)}</TEN_TB>
${tagOrEmpty("KY_HIEU", item.kyHieu)}
${tagOrEmpty("CONGTY_SX", item.congTySx)}
${tagOrEmpty("NUOC_SX", item.nuocSx)}
${tagOrEmpty("NAM_SX", item.namSx)}
${tagOrEmpty("NAM_SD", item.namSd)}
      <MA_MAY>${escapeXml(item.maMay)}</MA_MAY>
${tagOrEmpty("SO_LUU_HANH", item.soLuuHanh)}
${tagOrEmpty("HD_TU", item.hdTu)}
${tagOrEmpty("HD_DEN", item.hdDen)}
      <TU_NGAY>${escapeXml(item.tuNgay || todayYmd)}</TU_NGAY>
${tagOrEmpty("DEN_NGAY", item.denNgay)}
      <MA_CSKCB>${escapeXml(cskcb)}</MA_CSKCB>
    </DM_TBYTTHDV>`;
    })
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
  maCskcb = "01929",
): string {
  const xml = generateTbytThdvXml(items, maCskcb);
  return xmlToBase64(xml);
}

/**
 * Tải file XML Mẫu 06/DM
 */
export function downloadTbytThdvXmlFile(
  xmlOrItems: string | DmTbytThdvItem[],
  fileName = "DM06_TBYTTHDV_LoaiHS72.xml",
  maCskcb = "01929",
): void {
  const xml =
    typeof xmlOrItems === "string"
      ? xmlOrItems
      : generateTbytThdvXml(xmlOrItems, maCskcb);
  downloadXmlFile(xml, fileName);
}

export function generateTbytThdvTemplate(): void {
  const vnLabels = [
    "STT (*)",
    "Tên thiết bị y tế (*)",
    "Model / Ký hiệu",
    "Công ty sản xuất",
    "Nước sản xuất",
    "Năm sản xuất",
    "Năm đưa vào sử dụng",
    "Mã máy theo QĐ 3176 (*)",
    "Số lưu hành (NĐ 07/2025)",
    "HĐ thuê/mượn từ ngày",
    "HĐ thuê/mượn đến ngày",
    "Từ ngày áp dụng (*)",
    "Đến ngày áp dụng",
    "Mã CSKCB (*)",
  ];

  const headers = [
    "STT",
    "TEN_TB",
    "KY_HIEU",
    "CONGTY_SX",
    "NUOC_SX",
    "NAM_SX",
    "NAM_SD",
    "MA_MAY",
    "SO_LUU_HANH",
    "HD_TU",
    "HD_DEN",
    "TU_NGAY",
    "DEN_NGAY",
    "MA_CSKCB",
  ];

  const sampleRows = [
    [
      1,
      "Máy thở đa năng kèm khí nén",
      "Servo-air",
      "Maquet Critical Care AB",
      "Thụy Điển",
      2020,
      2021,
      "79001.01.001",
      "2100123/ĐKLH/BYT-TB",
      "",
      "",
      "20240101",
      "",
      "01929",
    ],
    [
      2,
      "Máy chụp X-quang kỹ thuật số cao tần",
      "FDR Smart X",
      "Fujifilm Corporation",
      "Nhật Bản",
      2019,
      2020,
      "79001.02.005",
      "1900456/ĐKLH/BYT-TB",
      "20220101",
      "20271231",
      "20220101",
      "20271231",
      "01929",
    ],
    [
      3,
      "Máy siêu âm màu 4 đầu dò Doppler màu 4D",
      "Voluson E10",
      "GE Healthcare Austria GmbH & Co OG",
      "Áo",
      2021,
      2022,
      "79001.03.012",
      "2200789/ĐKLH/BYT-TB",
      "",
      "",
      "20240101",
      "",
      "01929",
    ],
  ];

  const wsData = [vnLabels, headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws["!cols"] = [
    { wch: 6 }, // STT
    { wch: 38 }, // TEN_TB
    { wch: 18 }, // KY_HIEU
    { wch: 28 }, // CONGTY_SX
    { wch: 16 }, // NUOC_SX
    { wch: 10 }, // NAM_SX
    { wch: 10 }, // NAM_SD
    { wch: 18 }, // MA_MAY
    { wch: 24 }, // SO_LUU_HANH
    { wch: 12 }, // HD_TU
    { wch: 12 }, // HD_DEN
    { wch: 12 }, // TU_NGAY
    { wch: 12 }, // DEN_NGAY
    { wch: 12 }, // MA_CSKCB
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "06_DM_TBYTTHDV");
  XLSX.writeFile(wb, "Mau_06_DM_ThietBiYTeThucHienDVKT_ChuanBHXH.xlsx");
}

/**
 * Gửi dữ liệu Danh mục 06 (Loại HS 72) lên Cổng tiếp nhận Giám định BHYT (Sandbox Mock)
 */
export async function sendTbytThdvToBhxhGateway(
  items: DmTbytThdvItem[],
  maCskcb = "01929",
  maTinh = "01",
): Promise<SendTbytThdvGatewayResult> {
  return mockSendDanhMucToBhxhGateway(
    "DANHMUC06",
    items.length,
    "TBYT thực hiện DVKT (Mẫu 06/DM - Loại HS 72)",
    maCskcb,
    maTinh,
  );
}

export const downloadTbytThdvExcelTemplate = generateTbytThdvTemplate;
