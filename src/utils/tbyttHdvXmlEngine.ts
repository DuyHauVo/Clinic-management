import type {
  DmTbytThdvItem,
  ParseTbytThdvExcelResult,
  SendTbytThdvGatewayResult,
} from "../types/tbyttHdvTypes";
import {
  TBYTTHDV_SCHEMA_FIELDS,
  TBYTTHDV_FIELD_HEURISTICS,
  TBYTTHDV_EXCEL_TEMPLATE_HEADERS,
  TBYTTHDV_EXCEL_TEMPLATE_LABELS,
  TBYTTHDV_EXCEL_TEMPLATE_COLS,
  TBYTTHDV_EXCEL_TEMPLATE_SAMPLES,
} from "./constants/tbyttHdvConstants";
import { parseTbytThdvRow, renderTbytThdvItemXml } from "./parsers";
import {
  createDanhMucEngine,
  xmlToBase64,
  downloadXmlFile,
  DEFAULT_MA_CSKCB,
} from "./shared";

export {
  xmlToBase64,
  downloadXmlFile,
  parseTbytThdvRow,
  renderTbytThdvItemXml,
};

export const tbytThdvEngine = createDanhMucEngine<DmTbytThdvItem>({
  catalogCode: "DANHMUC06",
  catalogName: "TBYT thực hiện DVKT (Mẫu 06/DM - Loại HS 72)",
  containerTag: "DSACH_TBYTTHDV",
  defaultFileNamePrefix: "DM06_TBYTTHDV_LoaiHS72",
  templateFileName: "Mau_06_DM_ThietBiYTeThucHienDVKT_ChuanBHXH.xlsx",
  templateSheetName: "06_DM_TBYTTHDV",
  schemaFields: TBYTTHDV_SCHEMA_FIELDS,
  fieldHeuristics: TBYTTHDV_FIELD_HEURISTICS,
  hintKeywords: [
    "06",
    "TBYT",
    "THIETBI",
    "THIET_BI",
    "MAY",
    "DVKT",
    "TBYTTHDV",
  ],
  sheetMinMatch: 3,
  excelTemplate: {
    headers: TBYTTHDV_EXCEL_TEMPLATE_HEADERS,
    labels: TBYTTHDV_EXCEL_TEMPLATE_LABELS,
    cols: TBYTTHDV_EXCEL_TEMPLATE_COLS,
    samples: TBYTTHDV_EXCEL_TEMPLATE_SAMPLES,
  },
  parseRow: parseTbytThdvRow,
  renderItemXml: renderTbytThdvItemXml,
});

export const matchTbytThdvSchemaKey = tbytThdvEngine.matchSchemaKey;
export const findMatchingTbytThdvSchemaKey = tbytThdvEngine.findMatchingSchemaKey;

export const parseTbytThdvWorksheet = (
  worksheet: import("xlsx").WorkSheet,
  sheetName: string,
  availableSheets: string[],
  fileName: string,
  workbook?: import("xlsx").WorkBook,
  defaultMaCskcb?: string,
): ParseTbytThdvExcelResult => {
  return tbytThdvEngine.parseWorksheet(
    worksheet,
    sheetName,
    availableSheets,
    fileName,
    workbook,
    defaultMaCskcb,
  );
};

export const parseTbytThdvExcelFile = (
  file: File,
  defaultMaCskcb?: string,
  selectedSheetName?: string,
): Promise<ParseTbytThdvExcelResult> => {
  return tbytThdvEngine.parseExcelFile(file, defaultMaCskcb, selectedSheetName);
};

export const generateTbytThdvXml = tbytThdvEngine.generateXml;
export const generateTbytThdvBase64 = tbytThdvEngine.generateBase64;
export const downloadTbytThdvXmlFile = (
  xmlOrItems: string | DmTbytThdvItem[],
  fileName = `DM06_TBYTTHDV_LoaiHS72_${DEFAULT_MA_CSKCB}.xml`,
  maCskcb = DEFAULT_MA_CSKCB,
): void => {
  const xml =
    typeof xmlOrItems === "string"
      ? xmlOrItems
      : tbytThdvEngine.generateXml(xmlOrItems, maCskcb);
  downloadXmlFile(xml, fileName);
};
export const generateTbytThdvTemplate = tbytThdvEngine.downloadExcelTemplate;
export const downloadTbytThdvExcelTemplate = generateTbytThdvTemplate;
export const sendTbytThdvToBhxhGateway = (
  items: DmTbytThdvItem[],
  maCskcb?: string,
  maTinh?: string,
): Promise<SendTbytThdvGatewayResult> => {
  return tbytThdvEngine.sendToBhxhGateway(items, maCskcb, maTinh);
};
