import * as XLSX from "xlsx";

// ============================================================
// 1. CHUẨN HÓA & SO KHỚP TÊN CỘT EXCEL
// ============================================================

/**
 * Chuẩn hóa tên cột/alias để so khớp fuzzy:
 * bỏ dấu tiếng Việt, bỏ ký tự phân cách, in hoa, chỉ giữ [A-Z0-9].
 * (Gộp 2 bản normalizeHeaderKey / normalizeColumnHeader trước đây)
 */
export function normalizeHeaderKey(str: string): string {
  if (!str) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ""); // chỉ giữ chữ & số
}

export interface SharedSchemaField {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  desc?: string;
  aliases: string[];
}

export type SchemaKeyMatcher = (colHeader: string) => string | null;

/**
 * Tạo hàm so khớp tên cột -> schema key dùng cho mọi danh mục.
 * Ưu tiên: (1) khớp chuẩn key/label/alias sau normalize (không includes),
 * (2) heuristic theo danh sách từ khóa có thứ tự ưu tiên.
 * Mỗi ô chỉ trả về đúng MỘT schema key (một cột = một trường).
 */
export function createSchemaKeyMatcher(
  fields: SharedSchemaField[],
  heuristics: Array<[RegExp | string, string]>,
): SchemaKeyMatcher {
  return function matchSchemaKey(colHeader: string): string | null {
    const norm = normalizeHeaderKey(colHeader);
    if (!norm) return null;

    // 1. Exact match sau chuẩn hóa
    for (const field of fields) {
      if (
        normalizeHeaderKey(field.key) === norm ||
        normalizeHeaderKey(field.label) === norm
      ) {
        return field.key;
      }
      for (const alias of field.aliases) {
        if (normalizeHeaderKey(alias) === norm) {
          return field.key;
        }
      }
    }

    // 2. Heuristic theo thứ tự ưu tiên
    for (const [pattern, key] of heuristics) {
      if (
        typeof pattern === "string"
          ? norm.includes(pattern)
          : pattern.test(norm)
      ) {
        return key;
      }
    }

    return null;
  };
}

// ============================================================
// 2. PARSE GIÁ TRỊ Ô EXCEL
// ============================================================

/**
 * Parse số nguyên từ ô Excel ("8 bàn", "8,5"...) - bỏ ký tự không phải số.
 */
export function parseNumberCell(val: unknown, defaultVal = 0): number {
  const num = Number(String(val ?? "").replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? defaultVal : num;
}

/**
 * Parse ngày tháng về chuỗi YYYYMMDD. Hỗ trợ:
 * - Excel serial date (số 20000..60000)
 * - Chuỗi có phân cách: dd/mm/yyyy, yyyy-mm-dd, dd.mm.yyyy, yyyy/mm/dd
 * - Chuỗi 8 chữ số liền (YYYYMMDD hoặc ddmmyyyy -> giữ nguyên theo digits)
 * Trả về '' nếu không parse được (caller tự validate).
 */
export function parseYmdDate(val: unknown): string {
  if (val === null || val === undefined || val === "") return "";
  const str = String(val).trim();
  if (!str) return "";

  // Excel serial date
  if (
    !isNaN(Number(str)) &&
    Number(str) > 20000 &&
    Number(str) < 60000 &&
    !str.includes("/") &&
    !str.includes("-")
  ) {
    const jsDate = new Date(Math.round((Number(str) - 25569) * 86400 * 1000));
    const y = jsDate.getFullYear();
    const m = String(jsDate.getMonth() + 1).padStart(2, "0");
    const d = String(jsDate.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
  }

  // Chuỗi có phân cách
  if (str.includes("/") || str.includes("-") || str.includes(".")) {
    const parts = str.split(/[\/\-.]/).map((p) => p.trim());
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}${parts[1].padStart(2, "0")}${parts[2].padStart(2, "0")}`;
      }
      if (parts[2].length === 4) {
        return `${parts[2]}${parts[1].padStart(2, "0")}${parts[0].padStart(2, "0")}`;
      }
    }
  }

  const clean = str.replace(/[^0-9]/g, "");
  return clean;
}

/**
 * Tương thích ngược: tên cũ đang được export từ nhanlucXmlEngine.
 */
export const formatToYmdString = parseYmdDate;

// ============================================================
// 3. ĐỌC WORKBOOK EXCEL
// ============================================================

/**
 * Đọc File Excel/CSV thành Workbook (dùng FileReader).
 */
export function readExcelFile(file: File): Promise<XLSX.WorkBook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error("Tệp Excel không chứa bất kỳ sheet nào!");
        }
        resolve(workbook);
      } catch (err: unknown) {
        // Reject với thông báo thô - caller tự bọc theo ngữ cảnh của từng danh mục
        const msg =
          err instanceof Error ? err.message : "Định dạng tệp không hợp lệ";
        reject(new Error(msg));
      }
    };
    reader.onerror = () => reject(new Error("Không thể đọc file từ thiết bị!"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Chọn sheet khớp schema nhiều nhất: với mỗi dòng (tối đa maxScanRows),
 * đếm số schema key DUY NHẬT được nhận diện (dùng Set để một ô không đếm đè).
 */
/**
 * Chọn sheet khớp schema nhiều nhất: với mỗi dòng (tối đa maxScanRows),
 * đếm số schema key DUY NHẤT được nhận diện (dùng Set để một ô không đếm đè)
 * kết hợp điểm thưởng nếu tên sheet chứa từ khóa đặc thù của danh mục.
 */
export function findBestSheetName(
  workbook: XLSX.WorkBook,
  matchSchemaKey: SchemaKeyMatcher,
  maxScanRows = 15,
  sheetNameKeywords?: string[],
): string {
  let highestScore = -1;
  let bestSheet = workbook.SheetNames[0];

  for (const sName of workbook.SheetNames) {
    const ws = workbook.Sheets[sName];
    const normSheetName = normalizeHeaderKey(sName);

    let nameBonus = 0;
    if (sheetNameKeywords) {
      for (const kw of sheetNameKeywords) {
        if (normSheetName.includes(normalizeHeaderKey(kw))) {
          nameBonus += 5;
          break;
        }
      }
    }

    const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: "",
    });

    if (!rows || rows.length === 0) {
      continue;
    }

    for (let r = 0; r < Math.min(rows.length, maxScanRows); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;
      const matchedKeysInRow = new Set<string>();
      row.forEach((cell) => {
        const matched = matchSchemaKey(String(cell ?? ""));
        if (matched) matchedKeysInRow.add(matched);
      });
      const totalScore = matchedKeysInRow.size + nameBonus;
      if (totalScore > highestScore) {
        highestScore = totalScore;
        bestSheet = sName;
      }
    }
  }

  return bestSheet;
}

/**
 * Tìm dòng header (chứa nhiều cột khớp schema nhất) và map cột -> schema key.
 * Trả về -1 nếu không tìm thấy dòng nào đạt ngưỡng.
 */
export function detectHeaderRow(
  rows: unknown[][],
  matchSchemaKey: SchemaKeyMatcher,
  minMatchCount = 3,
  maxScanRows = 25,
  strategy: "first" | "best" = "first",
): { headerRowIndex: number; colMapping: { [colIdx: number]: string } } {
  let headerRowIndex = -1;
  let maxMatches = 0;
  let bestColMapping: { [colIdx: number]: string } = {};

  for (let r = 0; r < Math.min(rows.length, maxScanRows); r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;

    let matches = 0;
    const currentMapping: { [colIdx: number]: string } = {};
    const mappedKeys = new Set<string>();

    for (let c = 0; c < row.length; c++) {
      const matchedKey = matchSchemaKey(String(row[c] ?? "").trim());
      if (matchedKey && !mappedKeys.has(matchedKey)) {
        currentMapping[c] = matchedKey;
        mappedKeys.add(matchedKey);
        matches++;
      }
    }

    if (matches >= minMatchCount) {
      if (strategy === "first") {
        // Dòng đầu tiên đạt ngưỡng wins (hành vi BPCM)
        headerRowIndex = r;
        bestColMapping = currentMapping;
        break;
      }
      // 'best': dòng khớp nhiều nhất wins (hành vi NhanLuc)
      if (matches > maxMatches) {
        maxMatches = matches;
        headerRowIndex = r;
        bestColMapping = currentMapping;
      }
    }
  }

  return { headerRowIndex, colMapping: bestColMapping };
}

// ============================================================
// 4. XML & CHỮ SỐ
// ============================================================

/**
 * Escape ký tự đặc biệt XML.
 */
export function escapeXml(value: string | number | null | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * UUID v4 giả lập (dùng Math.random) cho Id của dataset/chữ ký.
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Tên cũ của generateUUID ở nhanlucXmlEngine - giữ để tương thích.
 */
export const generatePseudoGuid = generateUUID;

/**
 * Thời điểm ký chuẩn ISO 8601 (bỏ mili giây & hậu tố Z).
 */
export function getSigningTimeIso(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, "");
}

/**
 * Sinh block chữ ký CHUKYDONVI (XMLDSig) chuẩn HSDANHMUC.
 * Giá trị digest/cert là placeholder cho môi trường sandbox -
 * thay bằng ký số thật (HSM/USB token) khi tích hợp cổng chính thức.
 */
export function buildSignatureBlock(): string {
  return `<CHUKYDONVI>
  </CHUKYDONVI>`;
}

/**
 * Bọc danh sách bản ghi + chữ ký thành tài liệu HSDANHMUC hoàn chỉnh.
 */
export function buildHsDanhMucDocument(
  datasetContainerXml: string,
  signatureBlock: string,
): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<HSDANHMUC xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
${datasetContainerXml}
  ${signatureBlock}
</HSDANHMUC>`;
}

/**
 * Chuyển chuỗi XML thành Base64 UTF-8 an toàn.
 */
export function xmlToBase64(xmlString: string): string {
  try {
    const utf8Bytes = new TextEncoder().encode(xmlString);
    let binary = "";
    const len = utf8Bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return window.btoa(binary);
  } catch (e) {
    return window.btoa(unescape(encodeURIComponent(xmlString)));
  }
}

// ============================================================
// 9. TIỆN ÍCH CLIPBOARD DÙNG CHUNG
// ============================================================

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
}

/**
 * Tải file XML xuống máy người dùng.
 */
export function downloadXmlFile(xmlContent: string, fileName: string): void {
  const blob = new Blob([xmlContent], {
    type: "application/xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface GatewaySendResult {
  maKetQua: string;
  maGiaoDich: string;
  thongDiep: string;
  thoiGianTiepNhan: string;
  totalRecords: number;
}

/**
 * Thời gian tiếp nhận dạng YYYYMMDDHHmmss.
 */
export function getThoiGianTiepNhan(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${y}${m}${d}${h}${mi}${s}`;
}

/**
 * Mock gửi danh mục lên Cổng EGW BHXH (sandbox).
 * Khi tích hợp thật: POST fileHsBase64 tới
 * https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMucXX_...
 * với accessToken / tokenId / passwordHash từ cấu hình bảo mật.
 */
export async function mockSendDanhMucToBhxhGateway(
  loaiHs: string,
  recordCount: number,
  recordLabel: string,
  maCskcb: string = "01929",
  maTinh: string = "01",
  delayMs = 800,
): Promise<GatewaySendResult> {
  await new Promise((r) => setTimeout(r, delayMs));

  const maGiaoDich = `${loaiHs}_T${maTinh}_${maCskcb}_${Date.now().toString().slice(-6)}`;

  return {
    maKetQua: "200",
    maGiaoDich,
    thongDiep: `[Mô phỏng Sandbox] Tiếp nhận thành công ${recordCount} bản ghi ${recordLabel} vào Hệ thống Giám định BHYT`,
    thoiGianTiepNhan: getThoiGianTiepNhan(),
    totalRecords: recordCount,
  };
}
