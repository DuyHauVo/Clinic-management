import type { DmNhanLucItem } from "../types";
import type {
  ParseNhanLucExcelResult,
  SendNhanLucGatewayResult,
} from "../types/nhanLucTypes";
import {
  NHANLUC_SCHEMA_FIELDS,
  NHANLUC_EXCEL_TEMPLATE_HEADERS,
  NHANLUC_EXCEL_TEMPLATE_LABELS,
  NHANLUC_EXCEL_TEMPLATE_COLS,
  NHANLUC_EXCEL_TEMPLATE_SAMPLES,
  NHANLUC_FIELD_HEURISTICS,
} from "./constants/nhanLucConstants";
import { parseNhanLucRow, renderNhanLucItemXml } from "./parsers";
import {
  createDanhMucEngine,
  xmlToBase64,
  downloadXmlFile,
} from "./shared";

// Re-export để giữ nguyên API công khai cũ
export { xmlToBase64, downloadXmlFile, parseNhanLucRow, renderNhanLucItemXml };

export const nhanLucEngine = createDanhMucEngine<DmNhanLucItem>({
  catalogCode: "DANHMUC02",
  catalogName: "Danh mục Nhân Lực KCB (Loại 71)",
  containerTag: "DANHSACH_DMNHANLUCKBCB",
  defaultFileNamePrefix: "DanhMuc02_NHANLUCKBCB",
  templateFileName: "Mau_02_DM_NhanLuc_KCB_BHYT.xlsx",
  templateSheetName: "02_DM_NHANLUC",
  schemaFields: NHANLUC_SCHEMA_FIELDS,
  fieldHeuristics: NHANLUC_FIELD_HEURISTICS,
  hintKeywords: ["02NHANLUC", "NHANLUC", "NHANSU", "BACSI", "DUOCSI", "YBACSI"],
  headerMinMatch: 1,
  excelTemplate: {
    headers: NHANLUC_EXCEL_TEMPLATE_HEADERS,
    labels: NHANLUC_EXCEL_TEMPLATE_LABELS,
    cols: NHANLUC_EXCEL_TEMPLATE_COLS,
    samples: NHANLUC_EXCEL_TEMPLATE_SAMPLES,
  },
  parseRow: parseNhanLucRow,
  renderItemXml: renderNhanLucItemXml,
});

export const matchNhanLucSchemaKey = nhanLucEngine.matchSchemaKey;
export const findMatchingSchemaKey = nhanLucEngine.findMatchingSchemaKey;

export const parseNhanLucWorksheet = (
  ws: import("xlsx").WorkSheet,
  sheetName: string,
  allSheets: string[],
  fileName?: string,
  wb?: import("xlsx").WorkBook,
  defaultMaCskcb?: string,
): ParseNhanLucExcelResult => {
  return nhanLucEngine.parseWorksheet(
    ws,
    sheetName,
    allSheets,
    fileName,
    wb,
    defaultMaCskcb,
  );
};

export const parseNhanLucExcelFile = (
  file: File,
  defaultMaCskcb?: string,
  preferredSheet?: string,
): Promise<ParseNhanLucExcelResult> => {
  return nhanLucEngine.parseExcelFile(file, defaultMaCskcb, preferredSheet);
};

export const generateNhanLucXml = nhanLucEngine.generateXml;
export const downloadNhanLucXmlFile = nhanLucEngine.downloadXmlFile;
export const downloadNhanLucExcelTemplate = nhanLucEngine.downloadExcelTemplate;
export const sendNhanLucToBhxhGateway = (
  items: DmNhanLucItem[],
  maCskcb?: string,
  maTinh?: string,
): Promise<SendNhanLucGatewayResult> => {
  return nhanLucEngine.sendToBhxhGateway(items, maCskcb, maTinh);
};
