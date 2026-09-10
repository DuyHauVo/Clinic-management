import * as XLSX from 'xlsx';
import type { DmNhanLucItem } from '../types';
import type {
  ParseNhanLucExcelResult,
  SendNhanLucGatewayResult
} from './types/nhanLucTypes';
import {
  NHANLUC_SCHEMA_FIELDS,
  NHANLUC_EXCEL_TEMPLATE_SAMPLES
} from './constants/nhanLucConstants';
import {
  createSchemaKeyMatcher,
  parseYmdDate,
  formatToYmdString,
  readExcelFile,
  detectHeaderRow,
  escapeXml,
  generateUUID,
  buildSignatureBlock,
  buildHsDanhMucDocument,
  xmlToBase64,
  downloadXmlFile,
  mockSendDanhMucToBhxhGateway
} from './shared';

// Re-export để giữ nguyên API công khai cũ
export { formatToYmdString, xmlToBase64 };

const matchNhanLucSchemaKey = createSchemaKeyMatcher(NHANLUC_SCHEMA_FIELDS, [
  [/HOTEN|BACSI|NHANSU/, 'HO_TEN'],
  [/CCCD|DINHDANH|CMND/, 'SO_DINH_DANH'],
  [/MAKHOA|MABANKHAM/, 'MA_KHOA'],
  [/TENKHOA|TENBANKHAM/, 'TEN_KHOA'],
  ['CHUCDANH', 'CHUCDANH_NN'],
  [/MACCHN|SOCCHN|GPHN/, 'MACCHN'],
  ['NGAYCAP', 'NGAYCAP_CCHN'],
  ['NOICAP', 'NOICAP_CCHN'],
  [/PHAMVI(?!.*BS)/, 'PHAMVI_CM'],
  [/TUNGAY|BATDAU/, 'TU_NGAY'],
  [/DENNGAY|KETTHUC/, 'DEN_NGAY'],
  [/MACSKCB|CSKCB/, 'MA_CSKCB']
]);

export function findMatchingSchemaKey(colHeader: string): string | null {
  return matchNhanLucSchemaKey(colHeader);
}

// Parse Worksheet
export function parseNhanLucWorksheet(
  ws: XLSX.WorkSheet,
  sheetName: string,
  allSheets: string[],
  fileName = '',
  wb?: XLSX.WorkBook
): ParseNhanLucExcelResult {
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (!rawData || rawData.length === 0) {
    return {
      sheetName,
      fileName,
      availableSheets: allSheets,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      items: [],
      missingRequiredColumns: NHANLUC_SCHEMA_FIELDS.filter(f => f.required).map(f => f.key),
      recognizedColumns: [],
      isMultiSheet: allSheets.length > 1,
      workbook: wb,
      selectedSheet: sheetName
    };
  }

  const { headerRowIndex: headerRowIdx, colMapping: bestColMapping } = detectHeaderRow(rawData, matchNhanLucSchemaKey, 1, 25, 'best');

  const recognizedColumns = Object.entries(bestColMapping).map(([cIdx, key]) => ({
    key,
    colName: String(rawData[headerRowIdx]?.[Number(cIdx)] || key)
  }));

  const requiredKeys = NHANLUC_SCHEMA_FIELDS.filter(f => f.required).map(f => f.key);
  const recognizedKeysSet = new Set(Object.values(bestColMapping));
  const missingRequired = requiredKeys.filter(k => !recognizedKeysSet.has(k));

  const items: DmNhanLucItem[] = [];
  let autoStt = 1;

  for (let r = headerRowIdx + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!row || row.every((c: unknown) => c === '' || c === null || c === undefined)) continue;

    const rowObj: Record<string, unknown> = {};
    for (const [colIdx, key] of Object.entries(bestColMapping)) {
      rowObj[key] = row[Number(colIdx)];
    }

    const rowErrors: string[] = [];

    // Parse Fields
    const stt = Number(rowObj['STT']) || autoStt;
    const maKhoa = String(rowObj['MA_KHOA'] ?? '').trim();
    const tenKhoa = String(rowObj['TEN_KHOA'] ?? '').trim();
    const hoTen = String(rowObj['HO_TEN'] ?? '').trim();

    // Gioi tinh
    let gioiTinh = Number(rowObj['GIOI_TINH']);
    if (isNaN(gioiTinh)) {
      const gtStr = String(rowObj['GIOI_TINH'] ?? '').toLowerCase();
      if (gtStr.includes('nam') || gtStr === '1' || gtStr === 'm') gioiTinh = 1;
      else if (gtStr.includes('nữ') || gtStr.includes('nu') || gtStr === '2' || gtStr === 'f') gioiTinh = 2;
      else gioiTinh = 3;
    }
    if (![1, 2, 3].includes(gioiTinh)) gioiTinh = 1;

    const soDinhDanh = String(rowObj['SO_DINH_DANH'] ?? '').trim();

    // Chuc danh
    const rawCd = String(rowObj['CHUCDANH_NN'] ?? '').trim();
    let chucDanhNn = '';
    if (/^[1-9]$/.test(rawCd)) {
      chucDanhNn = rawCd;
    } else if (rawCd) {
      const cdStr = rawCd.toLowerCase();
      if (cdStr.includes('bác') || cdStr.includes('bs') || cdStr.includes('doctor')) chucDanhNn = '1';
      else if (cdStr.includes('y sỹ') || cdStr.includes('y sĩ') || cdStr.includes('ys')) chucDanhNn = '2';
      else if (cdStr.includes('điều dưỡng') || cdStr.includes('dd') || cdStr.includes('nurse')) chucDanhNn = '3';
      else if (cdStr.includes('hộ sinh')) chucDanhNn = '4';
      else if (cdStr.includes('kỹ thuật') || cdStr.includes('kty') || cdStr.includes('ktv')) chucDanhNn = '5';
      else if (cdStr.includes('tâm lý')) chucDanhNn = '6';
      else if (cdStr.includes('lương y')) chucDanhNn = '7';
      else if (cdStr.includes('dược')) chucDanhNn = '8';
      else chucDanhNn = '9';
    }

    const viTri = rowObj['VI_TRI'] ? String(rowObj['VI_TRI']).trim() : undefined;
    const macchn = rowObj['MACCHN'] ? String(rowObj['MACCHN']).trim() : undefined;
    const ngaycapCchn = parseYmdDate(rowObj['NGAYCAP_CCHN']);
    const noicapCchn = rowObj['NOICAP_CCHN'] ? String(rowObj['NOICAP_CCHN']).trim() : undefined;
    const phamviCm = rowObj['PHAMVI_CM'] ? String(rowObj['PHAMVI_CM']).trim() : undefined;
    const phamviCmbs = rowObj['PHAMVI_CMBS'] ? String(rowObj['PHAMVI_CMBS']).trim() : undefined;
    const dvktKhac = rowObj['DVKT_KHAC'] ? String(rowObj['DVKT_KHAC']).trim() : undefined;
    const vbPhancong = rowObj['VB_PHANCONG'] ? String(rowObj['VB_PHANCONG']).trim() : undefined;

    let thoigianDk = Number(rowObj['THOIGIAN_DK']);
    if (isNaN(thoigianDk) || ![1, 2].includes(thoigianDk)) {
      const tgStr = String(rowObj['THOIGIAN_DK'] ?? '').toLowerCase();
      thoigianDk = tgStr.includes('bán') || tgStr.includes('part') ? 2 : 1;
    }

    const thoigianNgay = rowObj['THOIGIAN_NGAY'] ? String(rowObj['THOIGIAN_NGAY']).trim() : '0730-1630';
    const thoigianTuan = rowObj['THOIGIAN_TUAN'] ? String(rowObj['THOIGIAN_TUAN']).trim() : 'T2T3T4T5T6';
    const cskcbKhac = rowObj['CSKCB_KHAC'] ? String(rowObj['CSKCB_KHAC']).trim() : undefined;
    const cskcbCgkt = rowObj['CSKCB_CGKT'] ? String(rowObj['CSKCB_CGKT']).trim() : undefined;
    const qdCgkt = rowObj['QD_CGKT'] ? String(rowObj['QD_CGKT']).trim() : undefined;

    const tuNgay = parseYmdDate(rowObj['TU_NGAY']);
    const denNgay = parseYmdDate(rowObj['DEN_NGAY']);
    const maCskcb = String(rowObj['MA_CSKCB'] || '01929').trim();

    // Validation
    if (!maKhoa) rowErrors.push('Thiếu Mã khoa (MA_KHOA)');
    if (!tenKhoa) rowErrors.push('Thiếu Tên khoa (TEN_KHOA)');
    if (!hoTen) rowErrors.push('Thiếu Họ và tên (HO_TEN)');
    if (!soDinhDanh) rowErrors.push('Thiếu Số định danh / CCCD (SO_DINH_DANH)');
    if (!chucDanhNn) rowErrors.push('Thiếu Chức danh nghề nghiệp (CHUCDANH_NN)');
    if (!tuNgay || tuNgay.length !== 8) rowErrors.push('Từ ngày (TU_NGAY) phải đủ 8 ký tự YYYYMMDD');

    items.push({
      id: `nl_${stt}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      stt,
      maKhoa,
      tenKhoa,
      hoTen,
      gioiTinh,
      soDinhDanh,
      chucDanhNn,
      viTri,
      macchn,
      ngaycapCchn: ngaycapCchn || undefined,
      noicapCchn,
      phamviCm,
      phamviCmbs,
      dvktKhac,
      vbPhancong,
      thoigianDk,
      thoigianNgay,
      thoigianTuan,
      cskcbKhac,
      cskcbCgkt,
      qdCgkt,
      tuNgay,
      denNgay: denNgay || undefined,
      maCskcb,
      isValid: rowErrors.length === 0,
      errors: rowErrors
    });

    autoStt++;
  }

  const validRows = items.filter(i => i.isValid).length;
  const invalidRows = items.length - validRows;

  const sheetsMeta = wb ? allSheets.map(sName => {
    const s = wb.Sheets[sName];
    const sData: unknown[][] = s ? XLSX.utils.sheet_to_json(s, { header: 1, defval: '' }) : [];
    return {
      name: sName,
      rowCount: Math.max(0, sData.length - 1),
      isBestMatch: sName === sheetName
    };
  }) : undefined;

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
    selectedSheet: sheetName
  };
}

// Parse Excel File
export async function parseNhanLucExcelFile(
  file: File,
  selectedSheetName?: string
): Promise<ParseNhanLucExcelResult> {
  try {
    const workbook = await readExcelFile(file);
    const allSheets = workbook.SheetNames;

    const targetSheetName = selectedSheetName && allSheets.includes(selectedSheetName)
      ? selectedSheetName
      : allSheets[0];

    const ws = workbook.Sheets[targetSheetName];
    return parseNhanLucWorksheet(ws, targetSheetName, allSheets, file.name, workbook);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi định dạng';
    throw new Error(`Không thể đọc file Excel: ${msg}`);
  }
}

// Tạo chuỗi XML chuẩn 02/DM
export function generateNhanLucXml(items: DmNhanLucItem[]): string {
  const containerGuid = `Id-${generateUUID()}`;

  const xmlItems = items
    .map(
      (item) => `    <DMNHANLUCKBCB>
      <STT>${item.stt}</STT>
      <MA_KHOA>${escapeXml(item.maKhoa)}</MA_KHOA>
      <TEN_KHOA>${escapeXml(item.tenKhoa)}</TEN_KHOA>
      <HO_TEN>${escapeXml(item.hoTen)}</HO_TEN>
      <GIOI_TINH>${item.gioiTinh}</GIOI_TINH>
      <SO_DINH_DANH>${escapeXml(item.soDinhDanh)}</SO_DINH_DANH>
      <CHUCDANH_NN>${escapeXml(item.chucDanhNn)}</CHUCDANH_NN>
      <VI_TRI>${escapeXml(item.viTri || '')}</VI_TRI>
      <MACCHN>${escapeXml(item.macchn || '')}</MACCHN>
      <NGAYCAP_CCHN>${escapeXml(item.ngaycapCchn || '')}</NGAYCAP_CCHN>
      <NOICAP_CCHN>${escapeXml(item.noicapCchn || '')}</NOICAP_CCHN>
      <PHAMVI_CM>${escapeXml(item.phamviCm || '')}</PHAMVI_CM>
      <PHAMVI_CMBS>${escapeXml(item.phamviCmbs || '')}</PHAMVI_CMBS>
      <DVKT_KHAC>${escapeXml(item.dvktKhac || '')}</DVKT_KHAC>
      <VB_PHANCONG>${escapeXml(item.vbPhancong || '')}</VB_PHANCONG>
      <THOIGIAN_DK>${item.thoigianDk}</THOIGIAN_DK>
      <THOIGIAN_NGAY>${escapeXml(item.thoigianNgay || '')}</THOIGIAN_NGAY>
      <THOIGIAN_TUAN>${escapeXml(item.thoigianTuan || '')}</THOIGIAN_TUAN>
      <CSKCB_KHAC>${escapeXml(item.cskcbKhac || '')}</CSKCB_KHAC>
      <CSKCB_CGKT>${escapeXml(item.cskcbCgkt || '')}</CSKCB_CGKT>
      <QD_CGKT>${escapeXml(item.qdCgkt || '')}</QD_CGKT>
      <TU_NGAY>${escapeXml(item.tuNgay)}</TU_NGAY>
      <DEN_NGAY>${escapeXml(item.denNgay || '')}</DEN_NGAY>
      <MA_CSKCB>${escapeXml(item.maCskcb)}</MA_CSKCB>
    </DMNHANLUCKBCB>`
    )
    .join('\n');

  const containerXml = `  <DANHSACH_DMNHANLUCKBCB Id="${containerGuid}">
${xmlItems}
  </DANHSACH_DMNHANLUCKBCB>`;
  const signature = buildSignatureBlock();

  return buildHsDanhMucDocument(containerXml, signature);
}

// Tải file XML xuống
export function downloadNhanLucXmlFile(xmlContent: string, fileName = 'DanhMuc02_NLKCB_01929.xml'): void {
  downloadXmlFile(xmlContent, fileName);
}

// Tải file mẫu Excel chuẩn Mẫu 02/DM
export function downloadNhanLucExcelTemplate(): void {
  const headers = NHANLUC_SCHEMA_FIELDS.map(f => f.key);
  const headerLabels = NHANLUC_SCHEMA_FIELDS.map(f => f.label);

  const wsData = [headerLabels, headers, ...NHANLUC_EXCEL_TEMPLATE_SAMPLES];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 15 }, // MA_KHOA
    { wch: 30 }, // TEN_KHOA
    { wch: 25 }, // HO_TEN
    { wch: 10 }, // GIOI_TINH
    { wch: 18 }, // SO_DINH_DANH
    { wch: 14 }, // CHUCDANH_NN
    { wch: 10 }, // VI_TRI
    { wch: 20 }, // MACCHN
    { wch: 14 }, // NGAYCAP_CCHN
    { wch: 20 }, // NOICAP_CCHN
    { wch: 22 }, // PHAMVI_CM
    { wch: 15 }, // PHAMVI_CMBS
    { wch: 15 }, // DVKT_KHAC
    { wch: 15 }, // VB_PHANCONG
    { wch: 14 }, // THOIGIAN_DK
    { wch: 16 }, // THOIGIAN_NGAY
    { wch: 16 }, // THOIGIAN_TUAN
    { wch: 14 }, // CSKCB_KHAC
    { wch: 14 }, // CSKCB_CGKT
    { wch: 14 }, // QD_CGKT
    { wch: 12 }, // TU_NGAY
    { wch: 12 }, // DEN_NGAY
    { wch: 12 }  // MA_CSKCB
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '02_DM_NHANLUC');

  XLSX.writeFile(wb, 'Mau_02_DM_NhanLuc_KCB_BHYT.xlsx');
}

/**
 * Gửi dữ liệu Mẫu 02/DM lên Cổng tiếp nhận BHXH Việt Nam (mô phỏng sandbox)
 * API thật: https://egw.baohiemxahoi.gov.vn/api/DanhMucGW/GuiDanhMuc02_NLKCB
 */
export async function sendNhanLucToBhxhGateway(
  items: DmNhanLucItem[],
  maCskcb: string = '01929',
  maTinh: string = '01'
): Promise<SendNhanLucGatewayResult> {
  return mockSendDanhMucToBhxhGateway('DANHMUC02', items.length, 'Danh mục Nhân Lực KCB (Loại 71)', maCskcb, maTinh);
}
