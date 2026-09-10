import * as XLSX from 'xlsx';
import type { DmNhanLucItem } from '../../types';

export interface NhanLucSchemaField {
  key: string;
  label: string;
  type: 'string' | 'number';
  required: boolean;
  desc: string;
  aliases: string[];
}

export interface ParseNhanLucExcelResult {
  sheetName: string;
  fileName: string;
  availableSheets: string[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  items: DmNhanLucItem[];
  missingRequiredColumns: string[];
  recognizedColumns: { key: string; colName: string }[];
  isMultiSheet: boolean;
  workbook?: XLSX.WorkBook;
  sheets?: { name: string; rowCount: number; isBestMatch: boolean }[];
  selectedSheet?: string;
}

export interface SendNhanLucGatewayResult {
  maKetQua: string;
  maGiaoDich: string;
  thongDiep: string;
  thoiGianTiepNhan: string;
  totalRecords: number;
}
