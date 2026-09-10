import * as XLSX from 'xlsx';
import type { DmBpcmItem } from '../../types';

export interface BpcmSchemaField {
  key: string;
  label: string;
  type: 'string' | 'number';
  required: boolean;
  desc: string;
  aliases: string[];
}

export interface SheetInfo {
  name: string;
  rowCount: number;
  matchedColumnCount: number;
  isBestMatch?: boolean;
}

export interface ParseExcelResult {
  items: DmBpcmItem[];
  matchedFields: string[];
  missingFields: string[];
  matchedColumnsMap?: { [schemaKey: string]: string };
  totalRows: number;
  validRows: number;
  invalidRows: number;
  fileName: string;
  sheets: SheetInfo[];
  selectedSheet: string;
  workbook?: XLSX.WorkBook;
}
