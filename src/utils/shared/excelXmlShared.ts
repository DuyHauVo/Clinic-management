import * as XLSX from "xlsx";

// ============================================================
// 1. CHUẨN HÓA & SO KHỚP TÊN CỘT EXCEL
// ============================================================

/**
 * Chuẩn hóa chuỗi/tên cột/từ khóa (bỏ dấu tiếng Việt, ký tự đặc biệt, chữ thường [a-z0-9])
 * dùng làm hàm chuẩn hóa cốt lõi trên toàn hệ thống.
 */
export function normalizeKey(str: string): string {
  if (!str) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Chuẩn hóa tên cột in hoa [A-Z0-9] (tương thích ngược) */
export function normalizeHeaderKey(str: string): string {
  return normalizeKey(str).toUpperCase();
}

/** @deprecated dùng normalizeKey */
export const normalizeKeyword = normalizeKey;

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
 * Tiền xử lý Map tra cứu O(1) và heuristic theo thứ tự ưu tiên.
 * Mỗi ô chỉ trả về đúng MỘT schema key (một cột = một trường).
 */
export function createSchemaKeyMatcher(
  fields: SharedSchemaField[],
  heuristics: Array<[RegExp | string, string]>,
): SchemaKeyMatcher {
  const exactMap = new Map<string, string>();

  for (const field of fields) {
    const keyNorm = normalizeHeaderKey(field.key);
    if (keyNorm) exactMap.set(keyNorm, field.key);

    const labelNorm = normalizeHeaderKey(field.label);
    if (labelNorm) exactMap.set(labelNorm, field.key);

    for (const alias of field.aliases) {
      const aliasNorm = normalizeHeaderKey(alias);
      if (aliasNorm) exactMap.set(aliasNorm, field.key);
    }
  }

  return function matchSchemaKey(colHeader: string): string | null {
    const norm = normalizeHeaderKey(colHeader);
    if (!norm) return null;

    const exact = exactMap.get(norm);
    if (exact) return exact;

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
 * Lấy giá trị ô Excel nguyên bản (giữ nguyên Date object, number, boolean, string)
 * từ Map các cột với danh sách bí danh (aliases). Tra cứu O(1) trên từng alias đã chuẩn hóa.
 */
export function getRowCell(map: Map<string, any>, aliases: string[]): unknown {
  const isValidValue = (val: unknown) =>
    val !== undefined && val !== null && String(val).trim() !== "";

  const normalized = aliases.map(normalizeKey);

  for (const na of normalized) {
    const v = map.get(na);
    if (isValidValue(v)) return v;
  }

  return undefined;
}

/**
 * Lấy giá trị ô Excel từ Map các cột với danh sách bí danh (aliases).
 * Nếu ô là Date object, chuyển đổi an toàn sang YYYYMMDD thay vì Date.toString().
 */
export function getRowVal(
  map: Map<string, any>,
  aliases: string[],
  fallback = "",
): string {
  const cell = getRowCell(map, aliases);
  if (cell === undefined || cell === null) return fallback;
  if (cell instanceof Date && !isNaN(cell.getTime())) {
    return parseYmdDate(cell);
  }
  const str = String(cell).trim();
  return str === "" ? fallback : str;
}

// ---------- Giới tính: một bảng tra dùng chung ----------
// Quy ước hệ thống: "0" = Nữ (chuẩn database/phần mềm phòng khám quy ước IsMale=0 hoặc bit 0)
const GENDER_MAP: Record<string, "1" | "2" | "3"> = {
  "2": "2",
  nu: "2",
  female: "2",
  f: "2",
  gai: "2",
  "0": "2",
  "1": "1",
  nam: "1",
  male: "1",
  m: "1",
  trai: "1",
  "3": "3",
  khac: "3",
  other: "3",
  unknown: "3",
  chuaxacdinh: "3",
};

function lookupGender(val: unknown): "1" | "2" | "3" | "" {
  if (val === null || val === undefined || String(val).trim() === "") return "";
  return GENDER_MAP[normalizeKey(String(val))] ?? "";
}

/**
 * Parse giới tính không bắt buộc (1: Nam, 2: Nữ, 3: Khác/Chưa xác định).
 * Ô trống hoặc không nhận ra -> "" (không tự gán mặc định).
 */
export const parseOptionalGender = (val: unknown): string => lookupGender(val);

/** Parse giới tính chuẩn BHYT/TT25, có giá trị mặc định khi trống/không nhận ra. */
export function parseGender(
  val: unknown,
  defaultVal: "1" | "2" | "3" = "1",
): "1" | "2" | "3" {
  return lookupGender(val) || defaultVal;
}

/** Giới tính dạng số (1, 2, 3) */
export const parseGioiTinh = (val: unknown): number =>
  parseInt(parseGender(val, "3"), 10);

/**
 * Xác định loại giấy tờ tùy thân theo chuẩn BHXH.
 * Nếu đã có mã hợp lệ (0..7) thì giữ nguyên, nếu có số CCCD thì mặc định "1".
 */
export function resolveLoaiGiayTo(
  rawLoaiGiayTo: string,
  soCccd: string,
): string {
  const trimmed = rawLoaiGiayTo ? rawLoaiGiayTo.trim() : "";
  if (["0", "1", "2", "3", "4", "5", "6", "7"].includes(trimmed)) {
    return trimmed;
  }
  return soCccd && soCccd.trim() !== "" ? "1" : "";
}

/**
 * Parse cờ nhị phân (0 hoặc 1).
 * Ô trống trả về "", 0/false/không trả về "0", 1/true/có/x/v trả về "1".
 */
export function parseExactBinaryFlag(raw: unknown): string {
  if (raw === undefined || raw === null) return "";
  const str = String(raw).trim();
  if (str === "") return "";
  const lower = str.toLowerCase();
  if (["1", "true", "co", "có", "x", "v"].includes(lower)) return "1";
  if (["0", "false", "khong", "không"].includes(lower)) return "0";
  return str;
}

/**
 * Parse số từ ô Excel ("8 bàn", "8,5", "1,000,000", "1.000.000,5"...)
 * Hỗ trợ chuẩn hóa dấu phẩy thập phân kiểu Việt Nam và phân cách hàng nghìn.
 */
export function parseNumberCell(val: unknown, defaultVal = 0): number {
  if (val === null || val === undefined || val === "") return defaultVal;
  if (typeof val === "number") return isNaN(val) ? defaultVal : val;

  let str = String(val).trim();
  if (!str) return defaultVal;

  const hasComma = str.includes(",");
  const hasDot = str.includes(".");

  if (hasComma && !hasDot) {
    // Có dấu phẩy, không có dấu chấm: nếu có đúng 1 dấu phẩy -> coi là thập phân ("8,5" -> "8.5")
    // Nếu có nhiều dấu phẩy -> dấu phân cách hàng nghìn ("1,000,000" -> "1000000")
    str = (str.match(/,/g) || []).length === 1 ? str.replace(",", ".") : str.replace(/,/g, "");
  } else if (hasComma && hasDot) {
    // Có cả hai dấu: dấu chấm là thập phân, bỏ dấu phẩy phân cách ("1,000,000.50" -> "1000000.50")
    str = str.replace(/,/g, "");
  }

  const clean = str.replace(/[^0-9.-]/g, "");
  if (clean === "" || clean === "-" || clean === ".") return defaultVal;
  const num = Number(clean);
  return isNaN(num) ? defaultVal : num;
}

// ============================================================
// 2b. NGÀY / NGÀY GIỜ
// ============================================================

const pad2 = (x: string | number) => String(x).padStart(2, "0");

/** Có phải serial date của Excel (số 20000..60000, không chứa / hoặc -) */
function isExcelSerial(v: unknown): boolean {
  if (typeof v === "number") return v > 20000 && v < 60000;
  const s = String(v ?? "").trim();
  const n = Number(s);
  return (
    s !== "" &&
    !isNaN(n) &&
    n > 20000 &&
    n < 60000 &&
    !s.includes("/") &&
    !s.includes("-")
  );
}

interface DateTimeParts {
  ymd: string; // YYYYMMDD
  h: string;
  mi: string;
  s: string;
  hasTime: boolean; // false nếu nguồn chỉ có ngày
}

/** Serial Excel -> các phần ngày giờ theo UTC (làm tròn đến giây) */
function excelSerialToParts(n: number): DateTimeParts {
  const d = new Date(Math.round((n - 25569) * 86400) * 1000);
  return {
    ymd: `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`,
    h: pad2(d.getUTCHours()),
    mi: pad2(d.getUTCMinutes()),
    s: pad2(d.getUTCSeconds()),
    hasTime: n % 1 !== 0,
  };
}

/**
 * Parse ngày tháng về chuỗi YYYYMMDD (8 ký tự). Hỗ trợ:
 * - Date object
 * - Excel serial date (số 20000..60000)
 * - Chuỗi có phân cách: dd/mm/yyyy, yyyy-mm-dd, dd.mm.yyyy, yyyy/mm/dd
 * - Chuỗi 8 chữ số liền (YYYYMMDD) hoặc 4 chữ số năm (YYYY -> YYYY0101)
 */
export function parseYmdDate(val: unknown, defaultVal = ""): string {
  if (val === null || val === undefined || val === "") return defaultVal;

  if (val instanceof Date && !isNaN(val.getTime())) {
    return `${val.getFullYear()}${pad2(val.getMonth() + 1)}${pad2(val.getDate())}`;
  }

  const str = String(val).trim();
  if (!str) return defaultVal;

  if (isExcelSerial(str)) return excelSerialToParts(Number(str)).ymd;

  // Chuỗi ISO hoặc Date.toString() có chứa chữ cái (vd: "Thu Oct 27 2022..." hoặc "2022-10-27T00:00:00.000Z")
  if (/[a-zA-Z]/.test(str)) {
    const parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime())) {
      return `${parsedDate.getFullYear()}${pad2(parsedDate.getMonth() + 1)}${pad2(parsedDate.getDate())}`;
    }
  }

  // Tách lấy phần ngày nếu chuỗi có kèm giờ (vd "27/10/2022 00:00:00" hoặc "2022-10-27 14:30")
  const dateToken = str.split(/[\sT]+/)[0];

  if (/[\/\-.]/.test(dateToken)) {
    const parts = dateToken.split(/[\/\-.]/).map((p) => p.trim());
    if (parts.length === 3) {
      const [a, b, c] = parts;
      const candidate = a.length === 4 ? `${a}${pad2(b)}${pad2(c)}` : c.length === 4 ? `${c}${pad2(b)}${pad2(a)}` : "";
      if (candidate && isValidYmdDate(candidate)) return candidate;
    }
  }

  if (/^\d{4}$/.test(str)) {
    const candidate = `${str}0101`;
    if (isValidYmdDate(candidate)) return candidate;
  }

  const cleaned = str.replace(/[^0-9]/g, "");
  if (cleaned.length === 8 && isValidYmdDate(cleaned)) {
    return cleaned;
  }

  return defaultVal;
}

/** @deprecated chỉ trả 8 ký tự. Dùng parseYmdDate / parseYmdHmDate / parseYmdHmsDate theo độ dài trường. */
export const parseExcelDate = parseYmdDate;

/** Tách ngày + giờ + phút + giây từ mọi kiểu đầu vào thường gặp */
function parseDateTimeParts(val: unknown): DateTimeParts | null {
  if (val === null || val === undefined || val === "") return null;

  if (val instanceof Date && !isNaN(val.getTime())) {
    return {
      ymd: parseYmdDate(val),
      h: pad2(val.getHours()),
      mi: pad2(val.getMinutes()),
      s: pad2(val.getSeconds()),
      hasTime: true,
    };
  }

  const str = String(val).trim();
  if (!str) return null;

  // Serial Excel: đọc giờ theo UTC, cùng cơ sở với parseYmdDate
  if (isExcelSerial(str)) return excelSerialToParts(Number(str));

  // Chuỗi ISO hoặc toString() có chứa chữ cái
  if (/[a-zA-Z]/.test(str)) {
    const parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime())) {
      return {
        ymd: parseYmdDate(parsedDate),
        h: pad2(parsedDate.getHours()),
        mi: pad2(parsedDate.getMinutes()),
        s: pad2(parsedDate.getSeconds()),
        hasTime: true,
      };
    }
  }

  // Chuỗi toàn chữ số: 8 / 12 / 14 ký tự
  if (/^\d+$/.test(str)) {
    if (str.length >= 12) {
      return {
        ymd: str.slice(0, 8),
        h: str.slice(8, 10),
        mi: str.slice(10, 12),
        s: str.length >= 14 ? str.slice(12, 14) : "00",
        hasTime: true,
      };
    }
    if (str.length === 8) {
      return { ymd: str, h: "00", mi: "00", s: "00", hasTime: false };
    }
  }

  // Chuỗi có phân cách: "dd/mm/yyyy hh:mm[:ss]" hoặc "yyyy-mm-ddThh:mm[:ss]"
  const [datePart, timePart] = str.split(/[\sT]+/);
  const ymd = parseYmdDate(datePart);
  if (ymd.length !== 8) return null;

  if (timePart) {
    const t = timePart.split(/[:.]/).map((x) => x.trim());
    if (t.length >= 2) {
      return {
        ymd,
        h: pad2(t[0]),
        mi: pad2(t[1]),
        s: pad2(t[2] ?? "00"),
        hasTime: true,
      };
    }
  }
  return { ymd, h: "00", mi: "00", s: "00", hasTime: false };
}

/**
 * Ngày giờ 12 ký tự YYYYMMDDHHmm: NGAY_VAO, NGAY_RA, NGAYGIO_VV, NGAY_TV,
 * NGAY_DINH_CHI_THAINGHEN...
 * Nguồn chỉ có ngày: nếu truyền defaultHourMinute (vd "0000") thì ghép vào,
 * không thì trả 8 ký tự.
 */
export function parseYmdHmDate(
  val: unknown,
  defaultHourMinute?: string,
): string {
  const t = parseDateTimeParts(val);
  if (!t) return "";
  if (t.hasTime) return `${t.ymd}${t.h}${t.mi}`;
  return defaultHourMinute !== undefined
    ? `${t.ymd}${defaultHourMinute}`
    : t.ymd;
}

/**
 * Ngày giờ 14 ký tự YYYYMMDDHHmmss: NGAY_SINH_CON của giấy chứng sinh.
 * Nguồn chỉ có ngày: nếu truyền defaultHms (vd "000000") thì ghép vào.
 */
export function parseYmdHmsDate(val: unknown, defaultHms?: string): string {
  const t = parseDateTimeParts(val);
  if (!t) return "";
  if (t.hasTime) return `${t.ymd}${t.h}${t.mi}${t.s}`;
  return defaultHms !== undefined ? `${t.ymd}${defaultHms}` : t.ymd;
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
  if (!isValidYmdDate(clean.slice(0, 8))) return false;
  const h = parseInt(clean.slice(8, 10), 10);
  const mi = parseInt(clean.slice(10, 12), 10);
  return h >= 0 && h <= 23 && mi >= 0 && mi <= 59;
}

/**
 * Kiểm tra chuỗi ngày giờ YYYYMMDDHHmmss hợp lệ (đúng 14 chữ số).
 */
export function isValidYmdHmsDate(str?: string | null): boolean {
  if (!str) return false;
  const clean = str.trim();
  if (!/^\d{14}$/.test(clean)) return false;
  if (!isValidYmdHmDate(clean.slice(0, 12))) return false;
  const s = parseInt(clean.slice(12, 14), 10);
  return s >= 0 && s <= 59;
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

export const DEFAULT_MA_CSKCB = "48939";
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

  if (bestCandidate) return bestCandidate;

  if (hintKeywords && hintKeywords.length > 0) {
    for (const s of availableSheets) {
      const norm = normalizeHeaderKey(s);
      if (hintKeywords.some((k) => norm.includes(normalizeHeaderKey(k)))) {
        return s;
      }
    }
  }

  return availableSheets[0];
}

/** @deprecated dùng pickBestSheetName */
export const findBestSheetName = pickBestSheetName;

export const HEADER_SCAN_ROWS = 25;

/**
 * Tìm dòng header (chứa nhiều cột khớp schema nhất) và map cột -> schema key.
 * Trả về -1 nếu không tìm thấy dòng nào đạt ngưỡng.
 */
export function detectHeaderRow(
  rows: unknown[][],
  matchSchemaKey: SchemaKeyMatcher,
  minMatchCount = 3,
  maxScanRows = HEADER_SCAN_ROWS,
  strategy: "first" | "best" = "best",
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
        headerRowIndex = r;
        bestColMapping = currentMapping;
        break;
      }
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
 * Sinh chuỗi UUID v4 (ưu tiên crypto.randomUUID chuẩn bảo mật, fallback Math.random).
 */
export function generateUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Lấy chuỗi timestamp ngày giờ địa phương YYYYMMDDHHmmss (14 ký tự).
 */
export function getTimestampYmdHms(date: Date = new Date()): string {
  return (
    `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}` +
    `${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`
  );
}

/**
 * Lấy ngày hôm nay theo giờ địa phương định dạng YYYYMMDD (8 ký tự).
 */
export function getTodayYmd(date: Date = new Date()): string {
  return getTimestampYmdHms(date).slice(0, 8);
}

/** @deprecated dùng getTodayYmd */
export const todayYmd = getTodayYmd;

/**
 * Lấy ngày hôm nay theo giờ địa phương định dạng YYYY-MM-DD (10 ký tự).
 */
export function getTodayIsoDate(date: Date = new Date()): string {
  const ymd = getTodayYmd(date);
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

/**
 * Lấy ngày đầu năm hiện tại theo giờ địa phương định dạng YYYYMMDD (vd: 20260101).
 */
export function getCurrentYearStartYmd(): string {
  return `${new Date().getFullYear()}0101`;
}

/**
 * Định dạng thời điểm ký chuẩn XML ISO: YYYY-MM-DDTHH:mm:ss (bỏ mili giây & hậu tố Z).
 */
export function formatXmlSigningTime(date: Date = new Date()): string {
  const ts = getTimestampYmdHms(date);
  return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}T${ts.slice(8, 10)}:${ts.slice(10, 12)}:${ts.slice(12, 14)}`;
}

/** @deprecated dùng formatXmlSigningTime */
export const getSigningTimeIso = formatXmlSigningTime;

/**
 * Sinh block chữ ký CHUKYDONVI (W3C XMLDSig) chuẩn BHYT / Quyết định 130.
 * Nếu có innerSignatureXml (<Signature>...</Signature>) thì bọc vào bên trong,
 * nếu chưa ký thì để placeholder tự đóng <CHUKYDONVI /> đồng nhất.
 */
export function buildSignatureBlock(
  innerSignatureXml?: string,
  indent = "  ",
): string {
  if (innerSignatureXml && innerSignatureXml.trim()) {
    return `${indent}<CHUKYDONVI>\n${innerSignatureXml}\n${indent}</CHUKYDONVI>`;
  }
  return `${indent}<CHUKYDONVI />`;
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

/** @deprecated dùng getTimestampYmdHms */
export const getThoiGianTiepNhan = getTimestampYmdHms;

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
    thoiGianTiepNhan: getTimestampYmdHms(),
    totalRecords: recordCount,
  };
}
