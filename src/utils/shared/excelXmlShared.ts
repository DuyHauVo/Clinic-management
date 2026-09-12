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
  const clean = String(val ?? "").replace(/[^0-9.-]/g, "");
  if (clean === "" || clean === "-" || clean === ".") return defaultVal;
  const num = Number(clean);
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
 * Kiểm tra chuỗi ngày YYYYMMDD hợp lệ (đúng 8 chữ số và ngày/tháng có thực).
 */
export function isValidYmdDate(str?: string | null): boolean {
  if (!str) return false;
  const clean = str.trim();
  if (!/^\d{8}$/.test(clean)) return false;
  const y = parseInt(clean.slice(0, 4), 10);
  const m = parseInt(clean.slice(4, 6), 10);
  const d = parseInt(clean.slice(6, 8), 10);
  if (y < 1900 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  const daysInMonth = new Date(y, m, 0).getDate();
  return d >= 1 && d <= daysInMonth;
}

/**
 * Kiểm tra chuỗi ngày giờ YYYYMMDDHHmm hợp lệ (đúng 12 chữ số, ngày tháng giờ phút có thực).
 */
export function isValidYmdHmDate(str?: string | null): boolean {
  if (!str) return false;
  const clean = str.trim();
  if (!/^\d{12}$/.test(clean)) return false;
  const y = parseInt(clean.slice(0, 4), 10);
  const m = parseInt(clean.slice(4, 6), 10);
  const d = parseInt(clean.slice(6, 8), 10);
  const h = parseInt(clean.slice(8, 10), 10);
  const mi = parseInt(clean.slice(10, 12), 10);
  if (y < 1900 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  const daysInMonth = new Date(y, m, 0).getDate();
  if (d < 1 || d > daysInMonth) return false;
  if (h < 0 || h > 23) return false;
  if (mi < 0 || mi > 59) return false;
  return true;
}

/**
 * Format ngày giờ thành chuỗi 12 ký tự YYYYMMDDHHmm cho hồ sơ KCB.
 * Hỗ trợ:
 * - Excel serial date (số thực)
 * - Chuỗi 12 số YYYYMMDDHHmm
 * - Chuỗi 8 số YYYYMMDD (chỉ ghép defaultHourMinute nếu caller chỉ định cụ thể, ví dụ '0000' cho ngày sinh)
 * - Chuỗi có dấu phân cách: dd/mm/yyyy hh:mm hoặc yyyy-mm-dd hh:mm
 */
export function parseYmdHmDate(
  val: unknown,
  defaultHourMinute?: string,
): string {
  if (val === null || val === undefined || val === "") return "";
  const str = String(val).trim();
  if (!str) return "";

  // Nếu là Excel serial date (vd: 45350.35)
  if (
    !isNaN(Number(str)) &&
    Number(str) > 20000 &&
    Number(str) < 60000 &&
    !str.includes("/") &&
    !str.includes("-")
  ) {
    const num = Number(str);
    const jsDate = new Date(Math.round((num - 25569) * 86400 * 1000));
    const y = jsDate.getFullYear();
    const m = String(jsDate.getMonth() + 1).padStart(2, "0");
    const d = String(jsDate.getDate()).padStart(2, "0");
    const h = String(jsDate.getHours()).padStart(2, "0");
    const mi = String(jsDate.getMinutes()).padStart(2, "0");
    return `${y}${m}${d}${h}${mi}`;
  }

  // Chuỗi số liền
  const digitsOnly = str.replace(/[^0-9]/g, "");
  if (digitsOnly.length === 12) {
    return digitsOnly;
  }
  if (digitsOnly.length === 8) {
    return defaultHourMinute !== undefined
      ? `${digitsOnly}${defaultHourMinute}`
      : digitsOnly;
  }

  // Chuỗi có phân cách: dd/mm/yyyy hh:mm hoặc yyyy-mm-dd hh:mm
  if (str.includes("/") || str.includes("-") || str.includes(".")) {
    const parts = str.split(/[\sT]+/);
    const datePart = parts[0] || "";
    const timePart = parts[1] || "";

    const dParts = datePart.split(/[\/\-.]/).map((p) => p.trim());
    let y = "",
      m = "",
      d = "";
    if (dParts.length === 3) {
      if (dParts[0].length === 4) {
        y = dParts[0];
        m = dParts[1].padStart(2, "0");
        d = dParts[2].padStart(2, "0");
      } else if (dParts[2].length === 4) {
        d = dParts[0].padStart(2, "0");
        m = dParts[1].padStart(2, "0");
        y = dParts[2];
      }
    }

    let h = "",
      mi = "";
    if (timePart) {
      const tParts = timePart.split(/[:.]/).map((p) => p.trim());
      if (tParts.length >= 2) {
        h = tParts[0].padStart(2, "0");
        mi = tParts[1].padStart(2, "0");
      }
    } else if (defaultHourMinute && defaultHourMinute.length === 4) {
      h = defaultHourMinute.slice(0, 2);
      mi = defaultHourMinute.slice(2, 4);
    }

    if (y && m && d) {
      if (h && mi) {
        return `${y}${m}${d}${h}${mi}`;
      }
      return `${y}${m}${d}`;
    }
  }

  return digitsOnly;
}

/**
 * Định dạng số tiền thành chuỗi số thập phân có 2 chữ số (.00) theo chuẩn BHXH XML
 */
export function formatCurrencyDecimals(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return "0.00";
  return val.toFixed(2);
}

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
        const msg =
          err instanceof Error ? err.message : "Định dạng tệp không hợp lệ";
        reject(new Error(msg));
      }
    };
    reader.onerror = () => reject(new Error("Không thể đọc file từ thiết bị!"));
    reader.readAsArrayBuffer(file);
  });
}

export const DEFAULT_MA_CSKCB = "48001";
export const DEFAULT_MA_TINH = "48";

/**
 * Tự động tìm sheet phù hợp nhất dựa trên heuristic:
 * - So khớp tên sheet với hintKeywords
 * - So khớp số lượng cột detectHeaderRow >= minMatchCount
 * - Ưu tiên sheet có dữ liệu và số cột nhận diện cao nhất
 */
export function pickBestSheetName(
  workbook: XLSX.WorkBook,
  matchSchemaKey: SchemaKeyMatcher,
  hintKeywords: string[] = [],
  minMatchCount = 2,
): string {
  const availableSheets = workbook.SheetNames;
  if (!availableSheets || availableSheets.length === 0) return "";
  if (availableSheets.length === 1) return availableSheets[0];

  let bestCandidate = "";
  let maxCandidateScore = -1;

  for (const s of availableSheets) {
    const ws = workbook.Sheets[s];
    if (!ws) continue;

    const rawRows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: "",
    });
    if (!rawRows || rawRows.length <= 1) continue;

    const { headerRowIndex, colMapping } = detectHeaderRow(
      rawRows,
      matchSchemaKey,
      minMatchCount,
      25,
      "best",
    );

    const matchedCount = Object.keys(colMapping).length;
    if (headerRowIndex !== -1 && matchedCount >= minMatchCount) {
      const norm = normalizeHeaderKey(s);
      const isHintMatch = hintKeywords.some((k) =>
        norm.includes(normalizeHeaderKey(k)),
      );
      const dataRowsCount = Math.max(0, rawRows.length - (headerRowIndex + 1));
      const score =
        matchedCount * 100 +
        (isHintMatch ? 50 : 0) +
        Math.min(dataRowsCount, 100);

      if (score > maxCandidateScore) {
        maxCandidateScore = score;
        bestCandidate = s;
      }
    }
  }

  return (
    bestCandidate ||
    findBestSheetName(workbook, matchSchemaKey, 15, hintKeywords) ||
    availableSheets[0]
  );
}

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
 * Lấy ngày hôm nay theo giờ địa phương (local time / VN UTC+7) định dạng YYYYMMDD (8 ký tự).
 */
export function getTodayYmd(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export const todayYmd = getTodayYmd;

/**
 * Lấy ngày hôm nay theo giờ địa phương (local time / VN UTC+7) định dạng YYYY-MM-DD (10 ký tự).
 */
export function getTodayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Lấy ngày đầu năm hiện tại theo giờ địa phương định dạng YYYYMMDD (vd: 20260101).
 */
export function getCurrentYearStartYmd(): string {
  return `${new Date().getFullYear()}0101`;
}

/**
 * Thời điểm ký chuẩn ISO 8601 theo giờ địa phương (bỏ mili giây & hậu tố Z).
 */
export function getSigningTimeIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
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
// 5. TIỆN ÍCH CLIPBOARD DÙNG CHUNG
// ============================================================

/**
 * Fallback sao chép qua phần tử textarea ẩn cho môi trường HTTP / mạng nội bộ bệnh viện.
 */
function fallbackCopyTextToClipboard(text: string): boolean {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error("Fallback clipboard copy failed: ", err);
    return false;
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return fallbackCopyTextToClipboard(text);
  } catch {
    return fallbackCopyTextToClipboard(text);
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

// ============================================================
// 6. CỔNG EGW BHXH & ĐỊNH DẠNG HIỂN THỊ UI
// ============================================================

export interface GatewaySendResult {
  maKetQua: string;
  maGiaoDich: string;
  thongDiep: string;
  thoiGianTiepNhan: string;
  totalRecords: number;
}

/**
 * Định dạng tiền tệ hiển thị tiếng Việt (vd: 1.500.000 đ)
 */
export function formatCurrencyVnd(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return "0 đ";
  return `${Math.round(val).toLocaleString("vi-VN")} đ`;
}

/**
 * Định dạng chuỗi ngày giờ YYYYMMDDHHmm hoặc YYYYMMDD thành dạng dễ đọc DD/MM/YYYY HH:mm
 */
export function formatYmdHmDisplay(str?: string): string {
  if (!str) return "-";
  const clean = String(str).replace(/[^0-9]/g, "");
  if (clean.length === 12) {
    const y = clean.slice(0, 4);
    const m = clean.slice(4, 6);
    const d = clean.slice(6, 8);
    const h = clean.slice(8, 10);
    const mi = clean.slice(10, 12);
    return `${d}/${m}/${y} ${h}:${mi}`;
  }
  if (clean.length === 8) {
    const y = clean.slice(0, 4);
    const m = clean.slice(4, 6);
    const d = clean.slice(6, 8);
    return `${d}/${m}/${y}`;
  }
  return str;
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
 */
export async function mockSendDanhMucToBhxhGateway(
  loaiHs: string,
  recordCount: number,
  recordLabel: string,
  maCskcb: string = DEFAULT_MA_CSKCB,
  maTinh: string = DEFAULT_MA_TINH,
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
