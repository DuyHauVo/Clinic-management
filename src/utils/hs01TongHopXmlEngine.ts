import * as XLSX from "xlsx";
import type {
  Hs01TongHopItem,
  ParseHs01ExcelResult,
  SendHs01GatewayResult,
} from "./types/hs01TongHopTypes";
import {
  HS01_SCHEMA_FIELDS,
  HS01_FIELD_HEURISTICS,
} from "./constants/hs01TongHopConstants";
import {
  createSchemaKeyMatcher,
  parseNumberCell,
  parseYmdHmDate,
  isValidYmdHmDate,
  formatCurrencyDecimals,
  readExcelFile,
  findBestSheetName,
  detectHeaderRow,
  escapeXml,
  generateUUID,
  buildSignatureBlock,
  xmlToBase64,
  downloadXmlFile,
  getThoiGianTiepNhan,
} from "./shared/excelXmlShared";
import { validateHs01Data } from "./validators/hs01Validator";

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
  defaultMaCskcb = "01929",
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

  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

  for (let r = effectiveHeaderRow + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (
      !Array.isArray(row) ||
      row.every((c) => c === "" || c === null || c === undefined)
    ) {
      continue;
    }

    const rowObj: Record<string, any> = {};
    Object.entries(effectiveColMapping).forEach(([colIdx, key]) => {
      rowObj[key] = row[Number(colIdx)];
    });

    const hoTen = String(rowObj["HO_TEN"] ?? "").trim();
    const maTheBhyt = String(rowObj["MA_THE_BHYT"] ?? "").trim();

    if (!hoTen && !maTheBhyt) {
      continue;
    }

    const stt = parseNumberCell(rowObj["STT"], items.length + 1);
    const ngaySinh = parseYmdHmDate(rowObj["NGAY_SINH"], "0000");

    let gioiTinhRaw = String(rowObj["GIOI_TINH"] ?? "").trim();
    let gioiTinh = "";
    if (gioiTinhRaw === "Nam" || gioiTinhRaw === "1") gioiTinh = "1";
    else if (
      gioiTinhRaw === "Nữ" ||
      gioiTinhRaw === "Nu" ||
      gioiTinhRaw === "2"
    )
      gioiTinh = "2";
    else if (gioiTinhRaw === "3") gioiTinh = "3";
    else gioiTinh = gioiTinhRaw;

    const maBenhChinh = String(rowObj["MA_BENH_CHINH"] ?? "")
      .trim()
      .toUpperCase();
    const ngayVao = parseYmdHmDate(rowObj["NGAY_VAO"]);
    const ngayVaoNoiTru = rowObj["NGAY_VAO_NOI_TRU"]
      ? parseYmdHmDate(rowObj["NGAY_VAO_NOI_TRU"])
      : undefined;
    const ngayRa = parseYmdHmDate(rowObj["NGAY_RA"]);

    let soNgayDtri = parseNumberCell(rowObj["SO_NGAY_DTRI"], 0);
    if (
      soNgayDtri <= 0 &&
      isValidYmdHmDate(ngayVao) &&
      isValidYmdHmDate(ngayRa)
    ) {
      const dVao = new Date(
        Number(ngayVao.slice(0, 4)),
        Number(ngayVao.slice(4, 6)) - 1,
        Number(ngayVao.slice(6, 8)),
        Number(ngayVao.slice(8, 10)),
        Number(ngayVao.slice(10, 12)),
      );
      const dRa = new Date(
        Number(ngayRa.slice(0, 4)),
        Number(ngayRa.slice(4, 6)) - 1,
        Number(ngayRa.slice(6, 8)),
        Number(ngayRa.slice(8, 10)),
        Number(ngayRa.slice(10, 12)),
      );
      const diffTime = dRa.getTime() - dVao.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      soNgayDtri = Math.max(1, diffDays > 0 ? diffDays : 1);
    }

    let maLoaiKcb = String(rowObj["MA_LOAI_KCB"] ?? "").trim();
    if (maLoaiKcb.length === 1) maLoaiKcb = `0${maLoaiKcb}`;

    const tTongchiBv = parseNumberCell(rowObj["T_TONGCHI_BV"], 0);
    const tTongchiBh = parseNumberCell(rowObj["T_TONGCHI_BH"], 0);
    const tBhtt = parseNumberCell(rowObj["T_BHTT"], 0);
    const tBncct = parseNumberCell(rowObj["T_BNCCT"], 0);
    const tBntt = parseNumberCell(rowObj["T_BNTT"], 0);
    const tNguonkhac = parseNumberCell(rowObj["T_NGUONKHAC"], 0);

    const maCskcb =
      String(rowObj["MA_CSKCB"] ?? defaultMaCskcb).trim() || defaultMaCskcb;
    const namQt = parseNumberCell(rowObj["NAM_QT"], currentYear);
    let thangQt = String(rowObj["THANG_QT"] ?? currentMonth).trim();
    if (thangQt.length === 1) thangQt = `0${thangQt}`;

    // Validation nghiêm ngặt (Strict Medical Validation)
    const errors = validateHs01Data({
      hoTen,
      maTheBhyt,
      gioiTinh,
      maBenhChinh,
      maLoaiKcb,
      ngaySinh,
      ngayVao,
      ngayRa,
      ngayVaoNoiTru,
      tTongchiBv,
    });

    const isValid = errors.length === 0;
    if (isValid) validRows++;
    else invalidRows++;

    items.push({
      id: `hs01-${generateUUID()}`,
      stt,
      hoTen,
      ngaySinh,
      gioiTinh,
      maTheBhyt,
      maBenhChinh,
      ngayVao,
      ngayVaoNoiTru,
      ngayRa,
      soNgayDtri,
      maLoaiKcb,
      tTongchiBv,
      tTongchiBh,
      tBhtt,
      tBncct,
      tBntt,
      tNguonkhac,
      maCskcb,
      namQt,
      thangQt,
      trangThai: isValid ? "hop_le" : "canh_bao",
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
 * Đọc file Excel tải đúng sheet nếu trong file nhiều sheet
 */
export async function parseHs01ExcelFile(
  file: File,
  selectedSheetName?: string,
  defaultMaCskcb = "01929",
): Promise<ParseHs01ExcelResult> {
  const workbook = await readExcelFile(file);
  const availableSheets = workbook.SheetNames;

  let sheetName = selectedSheetName;
  if (!sheetName || !availableSheets.includes(sheetName)) {
    sheetName =
      findBestSheetName(workbook, matchHs01SchemaKey, 20, [
        "HSTH01",
        "01BH",
        "TongHop",
        "Mẫu 01",
        "Hồ sơ",
      ]) || availableSheets[0];
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
  maCskcb = "01929",
): string {
  const containerGuid = `Id-${generateUUID()}`;

  const rowsXml = items
    .map((item, index) => {
      return `    <CHITIET_HS01BH>
      <STT>${item.stt || index + 1}</STT>
      <HO_TEN>${escapeXml(item.hoTen)}</HO_TEN>
      <NGAY_SINH>${escapeXml(item.ngaySinh)}</NGAY_SINH>
      <GIOI_TINH>${escapeXml(item.gioiTinh)}</GIOI_TINH>
      <MA_THE_BHYT>${escapeXml(item.maTheBhyt)}</MA_THE_BHYT>
      <MA_BENH_CHINH>${escapeXml(item.maBenhChinh)}</MA_BENH_CHINH>
      <NGAY_VAO>${escapeXml(item.ngayVao)}</NGAY_VAO>
      <NGAY_VAO_NOI_TRU>${escapeXml(item.ngayVaoNoiTru || "")}</NGAY_VAO_NOI_TRU>
      <NGAY_RA>${escapeXml(item.ngayRa)}</NGAY_RA>
      <SO_NGAY_DTRI>${item.soNgayDtri}</SO_NGAY_DTRI>
      <MA_LOAI_KCB>${escapeXml(item.maLoaiKcb)}</MA_LOAI_KCB>
      <T_TONGCHI_BV>${formatCurrencyDecimals(item.tTongchiBv)}</T_TONGCHI_BV>
      <T_TONGCHI_BH>${formatCurrencyDecimals(item.tTongchiBh)}</T_TONGCHI_BH>
      <T_BHTT>${formatCurrencyDecimals(item.tBhtt)}</T_BHTT>
      <T_BNCCT>${formatCurrencyDecimals(item.tBncct)}</T_BNCCT>
      <T_BNTT>${formatCurrencyDecimals(item.tBntt)}</T_BNTT>
      <T_NGUONKHAC>${formatCurrencyDecimals(item.tNguonkhac || 0)}</T_NGUONKHAC>
      <MA_CSKCB>${escapeXml(item.maCskcb || maCskcb)}</MA_CSKCB>
      <NAM_QT>${item.namQt}</NAM_QT>
      <THANG_QT>${escapeXml(item.thangQt)}</THANG_QT>
    </CHITIET_HS01BH>`;
    })
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
  maCskcb = "01929",
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
  const headers = [
    "STT",
    "HO_TEN",
    "NGAY_SINH",
    "GIOI_TINH",
    "MA_THE_BHYT",
    "MA_BENH_CHINH",
    "NGAY_VAO",
    "NGAY_VAO_NOI_TRU",
    "NGAY_RA",
    "SO_NGAY_DTRI",
    "MA_LOAI_KCB",
    "T_TONGCHI_BV",
    "T_TONGCHI_BH",
    "T_BHTT",
    "T_BNCCT",
    "T_BNTT",
    "T_NGUONKHAC",
    "MA_CSKCB",
    "NAM_QT",
    "THANG_QT",
  ];

  const sampleRows = [
    [
      1,
      "Nguyễn Văn An",
      "198505140000",
      "1",
      "DN4791234567890",
      "I10",
      "202602050815",
      "",
      "202602051045",
      1,
      "01",
      845000.0,
      845000.0,
      676000.0,
      169000.0,
      0.0,
      0.0,
      "01929",
      2026,
      "02",
    ],
    [
      2,
      "Trần Thị Mai",
      "199209200000",
      "2",
      "GD4799876543210",
      "K29.0",
      "202602060900",
      "",
      "202602061130",
      1,
      "01",
      620000.0,
      620000.0,
      496000.0,
      124000.0,
      0.0,
      0.0,
      "01929",
      2026,
      "02",
    ],
    [
      3,
      "Lê Hoàng Long",
      "197003150000",
      "1",
      "HT2791122334455",
      "E11.9",
      "202602070800",
      "",
      "202602071000",
      1,
      "07",
      1250000.0,
      1200000.0,
      1200000.0,
      0.0,
      50000.0,
      0.0,
      "01929",
      2026,
      "02",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "HSTH01BH");
  XLSX.writeFile(wb, "Mau_01BH_HoSoTongHop_Chuan_20Cot.xlsx");
}

/**
 * Gửi hồ sơ tổng hợp Mẫu 01/BH lên Cổng tiếp nhận Giám định BHYT (Sandbox)
 * Endpoint: https://egw.baohiemxahoi.gov.vn/api/HoSoTongHop7980/GuiHoSoTongHop01BH
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
