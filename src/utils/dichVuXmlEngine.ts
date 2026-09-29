import type {
  DmDichVuItem,
  ParseDichVuExcelResult,
  SendDichVuGatewayResult,
} from "../types/dichVuTypes";
import {
  DICHVU_SCHEMA_FIELDS,
  DICHVU_FIELD_HEURISTICS,
  DICHVU_EXCEL_TEMPLATE_HEADERS,
  DICHVU_EXCEL_TEMPLATE_LABELS,
  DICHVU_EXCEL_TEMPLATE_COLS,
  DICHVU_EXCEL_TEMPLATE_SAMPLES,
} from "./constants/dichVuConstants";
import { parseDichVuRow, renderDichVuItemXml } from "./parsers/dichVuRowParser";
import {
  createDanhMucEngine,
  xmlToBase64,
  downloadXmlFile,
  DEFAULT_MA_CSKCB,
} from "./shared";

export { xmlToBase64, downloadXmlFile };

export const dichVuEngine = createDanhMucEngine<DmDichVuItem>({
  catalogCode: "DANHMUC05",
  catalogName: "Dịch vụ kỹ thuật KCB BHYT (Mẫu 05/DM - Loại HS 12)",
  containerTag: "DANHSACH_DMDICHVUKBCB",
  defaultFileNamePrefix: "DM05_DVKT_LoaiHS12",
  templateFileName: "Mau_05_DM_DichVuKyThuat_ChuanBHXH.xlsx",
  templateSheetName: "05_DM_DVKT",
  schemaFields: DICHVU_SCHEMA_FIELDS,
  fieldHeuristics: DICHVU_FIELD_HEURISTICS,
  hintKeywords: ["05", "DVKT", "DICHVU", "DICH_VU", "DV", "KBCB"],
  excelTemplate: {
    headers: DICHVU_EXCEL_TEMPLATE_HEADERS,
    labels: DICHVU_EXCEL_TEMPLATE_LABELS,
    cols: DICHVU_EXCEL_TEMPLATE_COLS,
    samples: DICHVU_EXCEL_TEMPLATE_SAMPLES,
  },
  parseRow: parseDichVuRow,
  renderItemXml: renderDichVuItemXml,
});

export const matchDichVuSchemaKey = dichVuEngine.matchSchemaKey;
export const findMatchingDichVuSchemaKey = dichVuEngine.findMatchingSchemaKey;

export const parseDichVuWorksheet = (
  worksheet: import("xlsx").WorkSheet,
  sheetName: string,
  availableSheets: string[],
  fileName: string,
  workbook?: import("xlsx").WorkBook,
  defaultMaCskcb?: string,
): ParseDichVuExcelResult => {
  return dichVuEngine.parseWorksheet(
    worksheet,
    sheetName,
    availableSheets,
    fileName,
    workbook,
    defaultMaCskcb,
  );
};

export const parseDichVuExcelFile = (
  file: File,
  selectedSheetName?: string,
  defaultMaCskcb?: string,
): Promise<ParseDichVuExcelResult> => {
  return dichVuEngine.parseExcelFile(file, defaultMaCskcb, selectedSheetName);
};

export const generateDichVuXml = dichVuEngine.generateXml;
export const generateDichVuBase64 = dichVuEngine.generateBase64;
export const downloadDichVuXmlFile = (
  xmlOrItems: string | DmDichVuItem[],
  fileName = `DM05_DVKT_LoaiHS12_${DEFAULT_MA_CSKCB}.xml`,
  maCskcb = DEFAULT_MA_CSKCB,
): void => {
  const xml =
    typeof xmlOrItems === "string"
      ? xmlOrItems
      : dichVuEngine.generateXml(xmlOrItems, maCskcb);
  downloadXmlFile(xml, fileName);
};
export const generateDichVuTemplate = dichVuEngine.downloadExcelTemplate;
export const sendDichVuToBhxhGateway = (
  items: DmDichVuItem[],
  maCskcb?: string,
  maTinh?: string,
): Promise<SendDichVuGatewayResult> => {
  return dichVuEngine.sendToBhxhGateway(items, maCskcb, maTinh);
};
