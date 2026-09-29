import type { DanhMucParseResult } from '../utils/shared';
import type { DmNhanLucItem } from './index';

export interface NhanLucSchemaField {
  key: string;
  label: string;
  type: 'string' | 'number';
  required: boolean;
  desc: string;
  aliases: string[];
}

export interface NhanLucValidationInput {
  maKhoa?: string;
  tenKhoa?: string;
  hoTen?: string;
  soDinhDanh?: string;
  chucDanhNn?: string;
  tuNgay?: string;
}

export type ParseNhanLucExcelResult = DanhMucParseResult<DmNhanLucItem>;

export interface SendNhanLucGatewayResult {
  maKetQua: string;
  maGiaoDich: string;
  thongDiep: string;
  thoiGianTiepNhan: string;
  totalRecords: number;
}
