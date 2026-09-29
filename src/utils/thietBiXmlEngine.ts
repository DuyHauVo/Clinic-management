import type {
  DmThietBiItem,
  ParseThietBiExcelResult,
  SendThietBiGatewayResult,
} from "../types/thietBiTypes";
import {
  THIETBI_SCHEMA_FIELDS,
  THIETBI_FIELD_HEURISTICS,
  THIETBI_EXCEL_TEMPLATE_HEADERS,
  THIETBI_EXCEL_TEMPLATE_LABELS,
  THIETBI_EXCEL_TEMPLATE_COLS,
  THIETBI_EXCEL_TEMPLATE_SAMPLES,
} from "./constants/thietBiConstants";
import { parseThietBiRow, renderThietBiItemXml } from "./parsers";
import {
  createDanhMucEngine,
  xmlToBase64,
  downloadXmlFile,
} from "./shared";

export { xmlToBase64, downloadXmlFile, parseThietBiRow, renderThietBiItemXml };

export const thietBiEngine = createDanhMucEngine<DmThietBiItem>({
  catalogCode: "11",
  catalogName: "Thiết bị y tế (Mẫu 04/DM)",
  containerTag: "DSACH_TBYT",
  defaultFileNamePrefix: "Mau_04_DM_ThietBiYTe",
  templateFileName: "Mau_04_DM_ThietBiYTe_Template.xlsx",
  templateSheetName: "04_DM_TBYT",
  schemaFields: THIETBI_SCHEMA_FIELDS,
  fieldHeuristics: THIETBI_FIELD_HEURISTICS,
  hintKeywords: [
    "MAU04",
    "MAU_04",
    "04_DM",
    "DM_TBYT",
    "TBYT",
    "VTYT",
    "THIETBI",
    "THIET_BI",
    "VATTU",
  ],
  sheetMinMatch: 2,
  excelTemplate: {
    headers: THIETBI_EXCEL_TEMPLATE_HEADERS,
    labels: THIETBI_EXCEL_TEMPLATE_LABELS,
    cols: THIETBI_EXCEL_TEMPLATE_COLS,
    samples: THIETBI_EXCEL_TEMPLATE_SAMPLES,
  },
  parseRow: parseThietBiRow,
  renderItemXml: renderThietBiItemXml,
});

export const matchThietBiSchemaKey = thietBiEngine.matchSchemaKey;
export const findMatchingThietBiSchemaKey = thietBiEngine.findMatchingSchemaKey;

export const parseThietBiWorksheet = (
  worksheet: import("xlsx").WorkSheet,
  sheetName: string,
  availableSheets: string[],
  fileName: string,
  workbook?: import("xlsx").WorkBook,
  defaultMaCskcb?: string,
): ParseThietBiExcelResult => {
  return thietBiEngine.parseWorksheet(
    worksheet,
    sheetName,
    availableSheets,
    fileName,
    workbook,
    defaultMaCskcb,
  );
};

export const parseThietBiExcelFile = (
  file: File,
  defaultMaCskcb?: string,
  selectedSheetName?: string,
): Promise<ParseThietBiExcelResult> => {
  return thietBiEngine.parseExcelFile(file, defaultMaCskcb, selectedSheetName);
};

export const generateThietBiXml = thietBiEngine.generateXml;
export const downloadThietBiXmlFile = thietBiEngine.downloadXmlFile;
export const downloadThietBiExcelTemplate = thietBiEngine.downloadExcelTemplate;
export const sendThietBiToBhxhGateway = (
  items: DmThietBiItem[],
  maCskcb?: string,
  maTinh?: string,
): Promise<SendThietBiGatewayResult> => {
  return thietBiEngine.sendToBhxhGateway(items, maCskcb, maTinh);
};
