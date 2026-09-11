import * as XLSX from "xlsx";
import type { DmBpcmItem } from "../types";
import type { SheetInfo, ParseExcelResult } from "./types/bpcmTypes";
import {
  BPCM_SCHEMA_FIELDS,
  BPCM_EXCEL_TEMPLATE_HEADERS,
  BPCM_EXCEL_TEMPLATE_SAMPLES,
} from "./constants/bpcmConstants";
import {
  normalizeHeaderKey,
  createSchemaKeyMatcher,
  parseNumberCell,
  parseYmdDate,
  readExcelFile,
  findBestSheetName,
  detectHeaderRow,
  escapeXml,
  generateUUID,
  buildSignatureBlock,
  buildHsDanhMucDocument,
  xmlToBase64,
  downloadXmlFile,
  mockSendDanhMucToBhxhGateway,
  type GatewaySendResult,
} from "./shared";
import { validateBpcmData } from "./validators";

// Re-export để giữ nguyên API công khai cũ
export { normalizeHeaderKey, xmlToBase64, downloadXmlFile };

const matchBpcmSchemaKey = createSchemaKeyMatcher(BPCM_SCHEMA_FIELDS, [
  ["TENKHOA", "TEN_KHOA"],
  ["TENBANKHAM", "TEN_KHOA"],
  ["TENBPCM", "TEN_KHOA"],
  ["MAKHOA", "MA_KHOA"],
  ["MABANKHAM", "MA_KHOA"],
  ["MAKP", "MA_KHOA"],
  ["BANKHAM", "BAN_KHAM"],
  ["SOBANKHAM", "BAN_KHAM"],
  [/GIUONGPD|GIUONGKH|GIUONGPHE/, "GIUONG_PD"],
  [/GIUONGTK|GIUONGTHUC/, "GIUONG_TK"],
  [/GIUONGHSTC|HSTC/, "GIUONG_HSTC"],
  [/GIUONGHSCC|HSCC/, "GIUONG_HSCC"],
  [/TUNGAY|BATDAU/, "TU_NGAY"],
  [/DENNGAY|KETTHUC/, "DEN_NGAY"],
  [/MACSKCB|CSKCB/, "MA_CSKCB"],
  [/^STT$|^TT$|^SOTHUTU$|^NO$/, "STT"],
]);

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
  defaultMaCskcb: string = "01929",
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

    // Đếm số cột khớp
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

  // Tìm dòng tiêu đề (Header row) trong sheet được chọn
  const { headerRowIndex: detectedIdx, colMapping } = detectHeaderRow(
    rawRows,
    matchBpcmSchemaKey,
    3,
    15,
    "first",
  );

  let headerRowIndex = detectedIdx;
  const matchedColumns: { [schemaKey: string]: number } = {};
  Object.entries(colMapping).forEach(([colIdx, key]) => {
    if (matchedColumns[key] === undefined) {
      matchedColumns[key] = Number(colIdx);
    }
  });

  // Fallback nếu không phát hiện dòng tiêu đề
  if (headerRowIndex === -1 && rawRows.length > 0) {
    headerRowIndex = 0;
    rawRows[0].forEach((cellValue, colIndex) => {
      const matchedKey = matchBpcmSchemaKey(String(cellValue ?? ""));
      if (matchedKey && matchedColumns[matchedKey] === undefined) {
        matchedColumns[matchedKey] = colIndex;
      }
    });
  }

  const matchedKeys = Object.keys(matchedColumns);
  const missingKeys = BPCM_SCHEMA_FIELDS.filter(
    (f) => f.required && matchedColumns[f.key] === undefined,
  ).map((f) => f.key);

  const items: DmBpcmItem[] = [];
  let validRowsCount = 0;
  let invalidRowsCount = 0;

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.every((cell) => String(cell ?? "").trim() === "")) {
      continue;
    }

    const getValue = (key: string): unknown => {
      const colIdx = matchedColumns[key];
      if (colIdx !== undefined && row[colIdx] !== undefined) {
        return row[colIdx];
      }
      return "";
    };

    const stt = parseNumberCell(getValue("STT"), items.length + 1);
    const maKhoa = String(getValue("MA_KHOA") ?? "").trim();
    const tenKhoa = String(getValue("TEN_KHOA") ?? "").trim();
    const banKham = parseNumberCell(getValue("BAN_KHAM"), 0);
    const giuongPd = parseNumberCell(getValue("GIUONG_PD"), 0);
    const giuongTk = parseNumberCell(getValue("GIUONG_TK"), 0);
    const giuongHstc = parseNumberCell(getValue("GIUONG_HSTC"), 0);
    const giuongHscc = parseNumberCell(getValue("GIUONG_HSCC"), 0);
    const tuNgay = parseYmdDate(getValue("TU_NGAY"));
    const denNgay = parseYmdDate(getValue("DEN_NGAY"));
    const rawDenNgay = getValue("DEN_NGAY");
    const maCskcb = String(getValue("MA_CSKCB") ?? "").trim() || defaultMaCskcb;

    const errors = validateBpcmData({
      maKhoa,
      tenKhoa,
      tuNgay,
      rawDenNgay,
      denNgay,
      maCskcb
    });

    const isValid = errors.length === 0;
    if (isValid) validRowsCount++;
    else invalidRowsCount++;

    items.push({
      id: `bpcm-${sheetName}-${r}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      stt,
      maKhoa,
      tenKhoa,
      banKham,
      giuongPd,
      giuongTk,
      giuongHstc,
      giuongHscc,
      tuNgay,
      denNgay,
      maCskcb,
      isValid,
      errors,
    });
  }

  const matchedColumnsMap: { [schemaKey: string]: string } = {};
  Object.entries(matchedColumns).forEach(([schemaKey, colIdx]) => {
    matchedColumnsMap[schemaKey] = String(
      rawRows[headerRowIndex]?.[colIdx] || schemaKey,
    );
  });

  return {
    items,
    matchedFields: matchedKeys,
    missingFields: missingKeys,
    matchedColumnsMap,
    totalRows: items.length,
    validRows: validRowsCount,
    invalidRows: invalidRowsCount,
    fileName,
    sheets: sheetsInfo,
    selectedSheet: sheetName,
    workbook,
  };
}

/**
 * Đọc file Excel từ máy tính của người dùng (tự động phát hiện sheet có dữ liệu khớp nhất)
 */
export async function parseBpcmExcelFile(
  file: File,
  defaultMaCskcb: string = "01929",
  preferredSheet?: string,
): Promise<ParseExcelResult> {
  try {
    const workbook = await readExcelFile(file);

    // Nếu người dùng chọn sheet cụ thể, dùng luôn; ngược lại quét tìm sheet khớp schema nhiều nhất
    const targetSheetName =
      preferredSheet && workbook.SheetNames.includes(preferredSheet)
        ? preferredSheet
        : findBestSheetName(workbook, matchBpcmSchemaKey, 15, [
            "01",
            "BPCM",
            "KHOA",
            "PHONG",
            "BANKHAM",
            "BO_PHAN",
          ]);

    return parseWorksheet(workbook, targetSheetName, file.name, defaultMaCskcb);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Không hợp lệ";
    throw new Error(`Lỗi đọc file Excel: ${msg}`);
  }
}

/**
 * Tạo XML chuẩn Mẫu 01/DM 100% TỪ DỮ LIỆU FILE EXCEL ĐÃ IMPORT
 * Tuyệt đối không mock, lấy chính xác từng dòng từ items
 */
export function generateBpcmXml(items: DmBpcmItem[]): string {
  const datasetId = `Id-${generateUUID()}`;

  const rowsXml = items
    .map(
      (item) => `
    <DMBOPHANCHUYENMON>
      <STT>${item.stt}</STT>
      <MA_KHOA>${escapeXml(item.maKhoa)}</MA_KHOA>
      <TEN_KHOA>${escapeXml(item.tenKhoa)}</TEN_KHOA>
      <BAN_KHAM>${item.banKham}</BAN_KHAM>
      <GIUONG_PD>${item.giuongPd}</GIUONG_PD>
      <GIUONG_TK>${item.giuongTk}</GIUONG_TK>
      <GIUONG_HSTC>${item.giuongHstc}</GIUONG_HSTC>
      <GIUONG_HSCC>${item.giuongHscc}</GIUONG_HSCC>
      <TU_NGAY>${item.tuNgay || "20260101"}</TU_NGAY>
      ${item.denNgay ? `<DEN_NGAY>${item.denNgay}</DEN_NGAY>` : "<DEN_NGAY/>"}
      <MA_CSKCB>${escapeXml(item.maCskcb || "01929")}</MA_CSKCB>
    </DMBOPHANCHUYENMON>`,
    )
    .join("");

  const containerXml = `  <DANHSACH_DMBOPHANCHUYENMON Id="${datasetId}">${rowsXml}
  </DANHSACH_DMBOPHANCHUYENMON>`;
  const signature = buildSignatureBlock();

  return buildHsDanhMucDocument(containerXml, signature);
}

/**
 * Xuất file Excel mẫu chuẩn Mẫu 01/DM (Loại 70) để người dùng điền
 */
export function downloadBpcmExcelTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    BPCM_EXCEL_TEMPLATE_HEADERS,
    ...BPCM_EXCEL_TEMPLATE_SAMPLES,
  ]);

  ws["!cols"] = [
    { wch: 6 }, // STT
    { wch: 14 }, // MA_KHOA
    { wch: 38 }, // TEN_KHOA
    { wch: 12 }, // BAN_KHAM
    { wch: 14 }, // GIUONG_PD
    { wch: 14 }, // GIUONG_TK
    { wch: 14 }, // GIUONG_HSTC
    { wch: 14 }, // GIUONG_HSCC
    { wch: 12 }, // TU_NGAY
    { wch: 12 }, // DEN_NGAY
    { wch: 12 }, // MA_CSKCB
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DM_BPCM_Loai70");
  XLSX.writeFile(wb, "Mau_01_DM_BoPhanChuyenMon_Loai70.xlsx");
}

/**
 * Gửi dữ liệu lên Cổng tiếp nhận BHXH Việt Nam (mô phỏng sandbox)
 * API thật: https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc01_BPCMKBCB
 */
export async function sendBpcmToBhxhGateway(
  items: DmBpcmItem[],
  maCskcb: string = "01929",
  maTinh: string = "01",
): Promise<GatewaySendResult> {
  return mockSendDanhMucToBhxhGateway(
    "DANHMUC01",
    items.length,
    "Danh mục BPCM (Loại 70)",
    maCskcb,
    maTinh,
  );
}
