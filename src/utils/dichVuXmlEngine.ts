import * as XLSX from 'xlsx';
import type {
  DmDichVuItem,
  ParseDichVuExcelResult,
  SendDichVuGatewayResult
} from './types/dichVuTypes';
import {
  DICHVU_SCHEMA_FIELDS,
  DICHVU_FIELD_HEURISTICS
} from './constants/dichVuConstants';
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
} from './shared/excelXmlShared';
import { validateDichVuData } from './validators';

export { xmlToBase64, downloadXmlFile };

export const matchDichVuSchemaKey = createSchemaKeyMatcher(
  DICHVU_SCHEMA_FIELDS,
  DICHVU_FIELD_HEURISTICS
);

export function findMatchingDichVuSchemaKey(colHeader: string): string | null {
  return matchDichVuSchemaKey(colHeader);
}

/**
 * Parse một sheet cụ thể thành danh sách DmDichVuItem
 */
export function parseDichVuWorksheet(
  worksheet: XLSX.WorkSheet,
  sheetName: string,
  availableSheets: string[],
  fileName: string,
  workbook?: XLSX.WorkBook,
  defaultMaCskcb = '01929'
): ParseDichVuExcelResult {
  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!rawRows || rawRows.length === 0) {
    return {
      items: [],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      detectedHeaders: {},
      missingRequiredFields: DICHVU_SCHEMA_FIELDS.filter(f => f.required).map(f => f.key),
      availableSheets,
      selectedSheet: sheetName,
      fileName,
      workbook
    };
  }

  const { headerRowIndex, colMapping } = detectHeaderRow(
    rawRows,
    matchDichVuSchemaKey,
    3,
    25,
    'best'
  );

  let effectiveHeaderRow = headerRowIndex;
  const effectiveColMapping: { [colIdx: number]: string } = { ...colMapping };

  if (effectiveHeaderRow === -1 && rawRows.length > 0) {
    effectiveHeaderRow = 0;
    const row0 = rawRows[0];
    if (Array.isArray(row0)) {
      row0.forEach((cell, idx) => {
        const key = matchDichVuSchemaKey(String(cell ?? '').trim());
        if (key && !Object.values(effectiveColMapping).includes(key)) {
          effectiveColMapping[idx] = key;
        }
      });
    }
  }

  const detectedHeaders = effectiveColMapping;
  const matchedFieldKeys = new Set(Object.values(effectiveColMapping));
  const missingRequiredFields = DICHVU_SCHEMA_FIELDS.filter(
    f => f.required && !matchedFieldKeys.has(f.key)
  ).map(f => f.key);

  const items: DmDichVuItem[] = [];
  let validRows = 0;
  let invalidRows = 0;

  for (let r = effectiveHeaderRow + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row) || row.every(c => c === '' || c === null || c === undefined)) {
      continue;
    }

    const rowObj: Record<string, unknown> = {};
    Object.entries(effectiveColMapping).forEach(([colIdx, key]) => {
      rowObj[key] = row[Number(colIdx)];
    });

    const maDichVu = String(rowObj['MA_DICH_VU'] ?? '').trim();
    const tenDichVu = String(rowObj['TEN_DICH_VU'] ?? '').trim();

    if (!maDichVu && !tenDichVu) {
      continue;
    }

    const stt = parseNumberCell(rowObj['STT'], items.length + 1);
    const tenDvktGia = String(rowObj['TEN_DVKT_GIA'] ?? '').trim() || tenDichVu;
    const donGia = parseNumberCell(rowObj['DON_GIA'], 0);
    const quyTrinh = String(rowObj['QUY_TRINH'] ?? '20240101_01/QĐ-BV').trim() || '20240101_01/QĐ-BV';
    const soLuongCgktRaw = rowObj['SO_LUONG_CGKT'];
    const soLuongCgkt = (soLuongCgktRaw !== undefined && soLuongCgktRaw !== '') ? parseNumberCell(soLuongCgktRaw, 0) : undefined;
    const cskcbCgkt = String(rowObj['CSKCB_CGKT'] ?? '').trim() || undefined;
    const cskcbCls = String(rowObj['CSKCB_CLS'] ?? '').trim() || undefined;
    const qdDvkt = String(rowObj['QD_DVKT'] ?? '20240101_01/QĐ-SYT').trim() || '20240101_01/QĐ-SYT';
    const qdPdGia = String(rowObj['QD_PD_GIA'] ?? '20240101_01/QĐ-UBND').trim() || '20240101_01/QĐ-UBND';
    const ghiChu = String(rowObj['GHI_CHU'] ?? '').trim() || undefined;
    
    const giaThanhToanRaw = rowObj['GIA_THANH_TOAN'];
    const giaThanhToan = (giaThanhToanRaw !== undefined && giaThanhToanRaw !== '') ? parseNumberCell(giaThanhToanRaw, donGia) : donGia;

    const rawTuNgay = rowObj['TU_NGAY'];
    const parsedTuNgay = parseYmdDate(rawTuNgay);
    const todayYmd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const tuNgay = parsedTuNgay || todayYmd;
    const denNgay = parseYmdDate(rowObj['DEN_NGAY']);

    const maCskcb = String(rowObj['MA_CSKCB'] ?? defaultMaCskcb).trim() || defaultMaCskcb;

    // Validation
    const errors = validateDichVuData({
      maDichVu,
      tenDichVu,
      donGia,
      parsedTuNgay
    });

    const isValid = errors.length === 0;
    if (isValid) validRows++;
    else invalidRows++;

    items.push({
      id: `dv-${generateUUID()}`,
      stt,
      maDichVu,
      tenDichVu,
      tenDvktGia,
      donGia,
      quyTrinh,
      soLuongCgkt,
      cskcbCgkt,
      cskcbCls,
      qdDvkt,
      qdPdGia,
      ghiChu,
      giaThanhToan,
      tuNgay,
      denNgay,
      maCskcb,
      dsThuocPx: [],
      isValid,
      errors
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
    workbook
  };
}

/**
 * Đọc file Excel DVKT và phân tích tự động (Chấm điểm toàn diện tất cả candidate sheet)
 */
export async function parseDichVuExcelFile(
  file: File,
  selectedSheetName?: string,
  defaultMaCskcb = DEFAULT_MA_CSKCB
): Promise<ParseDichVuExcelResult> {
  const workbook = await readExcelFile(file);
  const availableSheets = workbook.SheetNames;

  const hintKeywords = ['05', 'DVKT', 'DICHVU', 'DICH_VU', 'DV', 'KBCB'];

  const sheetName =
    selectedSheetName && availableSheets.includes(selectedSheetName)
      ? selectedSheetName
      : pickBestSheetName(workbook, matchDichVuSchemaKey, hintKeywords, 2);

  const worksheet = workbook.Sheets[sheetName];
  const result = parseDichVuWorksheet(worksheet, sheetName, availableSheets, file.name, workbook, defaultMaCskcb);

  // Fallback nếu 0 bản ghi
  if (result.items.length === 0 && availableSheets.length > 1 && !selectedSheetName) {
    const fallbackSheet = findBestSheetName(workbook, matchDichVuSchemaKey);
    if (fallbackSheet && fallbackSheet !== sheetName) {
      const fallbackWs = workbook.Sheets[fallbackSheet];
      const fallbackResult = parseDichVuWorksheet(fallbackWs, fallbackSheet, availableSheets, file.name, workbook, defaultMaCskcb);
      if (fallbackResult.items.length > 0) {
        return fallbackResult;
      }
    }
  }

  return result;
}

/**
 * Tạo XML Mẫu 05/DM: Danh mục dịch vụ KBCB áp dụng trong thanh toán BHYT (Loại HS 12)
 */
export function generateDichVuXml(items: DmDichVuItem[], maCskcb = '01929'): string {
  const datasetId = `Id-${generateUUID()}`;
  const todayYmd = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const rowsXml = items
    .map((item, idx) => {
      const stt = item.stt || idx + 1;
      const cskcb = item.maCskcb || maCskcb;

      const tagOrEmpty = (tag: string, val: string | number | undefined | null) => {
        if (val === undefined || val === null || val === '') {
          return `      <${tag}/>`;
        }
        return `      <${tag}>${escapeXml(val)}</${tag}>`;
      };

      // Danh sách thuốc phóng xạ / chất đánh dấu (Lọc bỏ các dòng rỗng)
      const validThuocPx = (item.dsThuocPx || []).filter(
        px => px.maThuoc?.trim() || px.tenThuoc?.trim()
      );

      let dsThuocPxXml = '      <DS_THUOCPX/>';
      if (validThuocPx.length > 0) {
        const thuocPxItemsXml = validThuocPx
          .map((px, pIdx) => {
            const pxStt = px.stt || pIdx + 1;
            return `        <TT_THUOCPX>
          <STT>${pxStt}</STT>
          <MA_THUOC>${escapeXml(px.maThuoc.trim())}</MA_THUOC>
          <TEN_THUOC>${escapeXml(px.tenThuoc.trim())}</TEN_THUOC>
${tagOrEmpty('SO_DANG_KY', px.soDangKy)}
${tagOrEmpty('DON_VI_TINH', px.donViTinh)}
${tagOrEmpty('TT_THAU', px.ttThau)}
          <DON_GIA_THUOC>${px.donGiaThuoc || 0}</DON_GIA_THUOC>
${tagOrEmpty('DM_NSX_CDD', px.dmNsxCdD)}
${tagOrEmpty('DM_THUCTE_CDD', px.dmThucTeCdD)}
${tagOrEmpty('LIEU_BQ_PX', px.lieuBqPx)}
${tagOrEmpty('TL_THUCTE_BQ_PX', px.tlThucTeBqPx)}
          <THANH_TIEN_THUOC>${px.thanhTienThuoc || 0}</THANH_TIEN_THUOC>
        </TT_THUOCPX>`;
          })
          .join('\n');

        dsThuocPxXml = `      <DS_THUOCPX>\n${thuocPxItemsXml}\n      </DS_THUOCPX>`;
      }

      return `    <DMDICHVUKBCB>
      <STT>${stt}</STT>
      <MA_DICH_VU>${escapeXml(item.maDichVu)}</MA_DICH_VU>
      <TEN_DICH_VU>${escapeXml(item.tenDichVu)}</TEN_DICH_VU>
      <TEN_DVKT_GIA>${escapeXml(item.tenDvktGia || item.tenDichVu)}</TEN_DVKT_GIA>
      <DON_GIA>${item.donGia}</DON_GIA>
      <QUY_TRINH>${escapeXml(item.quyTrinh || '20240101_01/QĐ-BV')}</QUY_TRINH>
${tagOrEmpty('SO_LUONG_CGKT', item.soLuongCgkt)}
${tagOrEmpty('CSKCB_CGKT', item.cskcbCgkt)}
${tagOrEmpty('CSKCB_CLS', item.cskcbCls)}
      <QD_DVKT>${escapeXml(item.qdDvkt || '20240101_01/QĐ-SYT')}</QD_DVKT>
      <QD_PD_GIA>${escapeXml(item.qdPdGia || '20240101_01/QĐ-UBND')}</QD_PD_GIA>
${tagOrEmpty('GHI_CHU', item.ghiChu)}
      <TU_NGAY>${escapeXml(item.tuNgay || todayYmd)}</TU_NGAY>
${tagOrEmpty('DEN_NGAY', item.denNgay)}
      <MA_CSKCB>${escapeXml(cskcb)}</MA_CSKCB>
      <GIA_THANH_TOAN>${item.giaThanhToan || item.donGia}</GIA_THANH_TOAN>
${dsThuocPxXml}
    </DMDICHVUKBCB>`;
    })
    .join('\n');

  const datasetXml = `  <DANHSACH_DMDICHVUKBCB Id="${datasetId}">\n${rowsXml}\n  </DANHSACH_DMDICHVUKBCB>`;
  const signatureXml = buildSignatureBlock();

  return buildHsDanhMucDocument(datasetXml, signatureXml);
}

/**
 * Tạo Base64 từ danh sách DmDichVuItem
 */
export function generateDichVuBase64(items: DmDichVuItem[], maCskcb = '01929'): string {
  const xml = generateDichVuXml(items, maCskcb);
  return xmlToBase64(xml);
}

/**
 * Tải file XML Mẫu 05/DM
 */
export function downloadDichVuXmlFile(
  xmlOrItems: string | DmDichVuItem[],
  fileName = 'DM05_DVKT_LoaiHS12.xml',
  maCskcb = '01929'
): void {
  const xml = typeof xmlOrItems === 'string' ? xmlOrItems : generateDichVuXml(xmlOrItems, maCskcb);
  downloadXmlFile(xml, fileName);
}

/**
 * Xuất file Excel mẫu chuẩn 16 cột Mẫu 05/DM
 */
export function generateDichVuTemplate(): void {
  const vnLabels = [
    'STT (*)',
    'Mã dịch vụ (*)',
    'Tên dịch vụ theo DM dùng chung (*)',
    'Tên DV phê duyệt giá (*)',
    'Đơn giá DV (*)',
    'Quy trình CMKT (*)',
    'Số lượng CGKT',
    'Mã CSKCB CGKT',
    'Mã CSKCB CLS',
    'QĐ phê duyệt DVKT (*)',
    'QĐ phê duyệt giá (*)',
    'Ghi chú giá',
    'Giá thanh toán BHYT (*)',
    'Từ ngày (*)',
    'Đến ngày',
    'Mã CSKCB (*)'
  ];

  const headers = [
    'STT',
    'MA_DICH_VU',
    'TEN_DICH_VU',
    'TEN_DVKT_GIA',
    'DON_GIA',
    'QUY_TRINH',
    'SO_LUONG_CGKT',
    'CSKCB_CGKT',
    'CSKCB_CLS',
    'QD_DVKT',
    'QD_PD_GIA',
    'GHI_CHU',
    'GIA_THANH_TOAN',
    'TU_NGAY',
    'DEN_NGAY',
    'MA_CSKCB'
  ];

  const sampleRows = [
    [
      1,
      '01.0001.0001',
      'Khám bệnh chuyên khoa Nội',
      'Khám bệnh chuyên khoa Nội',
      42100,
      '20240101_01/QĐ-BV',
      '',
      '',
      '',
      '20240101_01/QĐ-SYT',
      '20240101_01/QĐ-UBND',
      '',
      42100,
      '20260101',
      '',
      '01929'
    ],
    [
      2,
      '03.2383.0314',
      'Xạ hình tưới máu cơ tim bằng SPECT (gồm thuốc phóng xạ)',
      'Xạ hình tưới máu cơ tim bằng SPECT (chưa gồm thuốc PX)',
      345600,
      '20171128_5344/QĐ-BYT',
      '',
      '',
      '',
      '20240819_902/QĐ-SYT',
      '20260731_96/NQ-HĐND',
      'Gồm Technetium-99m MIBI',
      785600,
      '20260810',
      '',
      '01929'
    ]
  ];

  const wsData = [vnLabels, headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 16 }, // MA_DICH_VU
    { wch: 35 }, // TEN_DICH_VU
    { wch: 35 }, // TEN_DVKT_GIA
    { wch: 14 }, // DON_GIA
    { wch: 22 }, // QUY_TRINH
    { wch: 16 }, // SO_LUONG_CGKT
    { wch: 14 }, // CSKCB_CGKT
    { wch: 14 }, // CSKCB_CLS
    { wch: 22 }, // QD_DVKT
    { wch: 22 }, // QD_PD_GIA
    { wch: 30 }, // GHI_CHU
    { wch: 16 }, // GIA_THANH_TOAN
    { wch: 12 }, // TU_NGAY
    { wch: 12 }, // DEN_NGAY
    { wch: 12 }  // MA_CSKCB
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '05_DM_DVKT');
  XLSX.writeFile(wb, 'Mau_05_DM_DichVuKyThuat_ChuanBHXH.xlsx');
}

/**
 * Gửi dữ liệu Danh mục 05 (Loại HS 12) lên Cổng tiếp nhận Giám định BHYT (Sandbox Mock)
 */
export async function sendDichVuToBhxhGateway(
  items: DmDichVuItem[],
  maCskcb = '01929',
  maTinh = '01'
): Promise<SendDichVuGatewayResult> {
  return mockSendDanhMucToBhxhGateway(
    'DANHMUC05',
    items.length,
    'Dịch vụ kỹ thuật KCB BHYT (Mẫu 05/DM - Loại HS 12)',
    maCskcb,
    maTinh
  );
}
