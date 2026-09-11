import React from "react";
import { Upload } from "lucide-react";
import { useFileDropzone } from "../../../hooks";
import type { ThemeColor, ExcelSheetInfo } from "./ExcelUploadStatsBar";
import { ExcelUploadStatsBar, DanhMucActionToolbar } from "./index";

/**
 * Giao diện màu theo theme cho dropzone (bổ sung cho ThemeColor của StatsBar).
 */
const dropzoneThemeStyles: Record<
  ThemeColor,
  {
    border: string;
    dragging: string;
    iconText: string;
    iconBorder: string;
    btn: string;
    btnShadow: string;
  }
> = {
  blue: {
    border:
      "border-blue-300 hover:border-[#1677ff] bg-blue-50/50 hover:bg-blue-50",
    dragging:
      "border-[#1677ff] bg-blue-100/80 scale-[1.008] shadow-md shadow-blue-500/10",
    iconText: "text-[#1677ff]",
    iconBorder: "border-blue-100",
    btn: "bg-[#1677ff] hover:bg-blue-600",
    btnShadow: "shadow-blue-500/20",
  },
  indigo: {
    border:
      "border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50",
    dragging:
      "border-indigo-600 bg-indigo-100/80 scale-[1.008] shadow-md shadow-indigo-500/10",
    iconText: "text-indigo-600",
    iconBorder: "border-indigo-100",
    btn: "bg-indigo-600 hover:bg-indigo-700",
    btnShadow: "shadow-indigo-500/20",
  },
  emerald: {
    border:
      "border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50",
    dragging:
      "border-emerald-600 bg-emerald-100/80 scale-[1.008] shadow-md shadow-emerald-500/10",
    iconText: "text-emerald-600",
    iconBorder: "border-emerald-100",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    btnShadow: "shadow-emerald-500/20",
  },
  cyan: {
    border:
      "border-cyan-300 hover:border-cyan-500 bg-cyan-50/50 hover:bg-cyan-50",
    dragging:
      "border-cyan-600 bg-cyan-100/80 scale-[1.008] shadow-md shadow-cyan-500/10",
    iconText: "text-cyan-600",
    iconBorder: "border-cyan-100",
    btn: "bg-cyan-600 hover:bg-cyan-700",
    btnShadow: "shadow-cyan-500/20",
  },
  purple: {
    border:
      "border-purple-300 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50",
    dragging:
      "border-purple-600 bg-purple-100/80 scale-[1.008] shadow-md shadow-purple-500/10",
    iconText: "text-purple-600",
    iconBorder: "border-purple-100",
    btn: "bg-purple-600 hover:bg-purple-700",
    btnShadow: "shadow-purple-500/20",
  },
  amber: {
    border:
      "border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50",
    dragging:
      "border-amber-600 bg-amber-100/80 scale-[1.008] shadow-md shadow-amber-500/10",
    iconText: "text-amber-600",
    iconBorder: "border-amber-100",
    btn: "bg-amber-600 hover:bg-amber-700",
    btnShadow: "shadow-amber-500/20",
  },
};

export interface DanhMucDropzoneProps {
  /** Màu chủ đạo của tab danh mục */
  themeColor?: ThemeColor;
  /** Trạng thái đang đọc file Excel */
  isLoadingFile: boolean;
  /** Tiêu đề khi đang loading / khi bình thường */
  loadingTitle: string;
  /** Tiêu đề khi bình thường */
  title: string;
  /** Mô tả ngắn dưới tiêu đề (định dạng file, số trường chuẩn...) */
  description?: React.ReactNode;
  /** Thống kê file đã nạp (nếu có) */
  uploadStats?: {
    selectedSheet?: string;
    totalRows: number;
    rowUnitLabel?: string;
    matchedColumnsCount: number;
    totalColumnsCount: number;
    fileName?: string;
    availableSheets?: ExcelSheetInfo[];
    extraBadge?: React.ReactNode;
  };
  /** Số bản ghi hiện có (để toolbar hiện nút Xóa Hết) */
  itemsCount: number;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchSheet?: (sheetName: string) => void;
  onOpenSchemaModal?: () => void;
  onDownloadTemplate: () => void;
  onLoadSample: () => void;
  onClearData: () => void;
  onOpenXmlModal: () => void;
  onOpenApiTab?: () => void;
  onAddNew: () => void;
  // Nhãn toolbar
  templateLabel?: string;
  xmlLabel?: string;
  apiLabel?: string;
  addNewLabel: string;
}

/**
 * Dropzone dùng chung cho mọi tab Danh mục / Hồ sơ:
 * input file ẩn + kéo-thả + stats bar + action toolbar.
 * Mỗi tab chỉ truyền theme, label và handlers — không còn copy logic drag-drop.
 */
export const DanhMucDropzone: React.FC<DanhMucDropzoneProps> = ({
  themeColor = "blue",
  isLoadingFile,
  loadingTitle,
  title,
  description,
  uploadStats,
  itemsCount,
  onFileUpload,
  onSwitchSheet,
  onOpenSchemaModal,
  onDownloadTemplate,
  onLoadSample,
  onClearData,
  onOpenXmlModal,
  onOpenApiTab,
  onAddNew,
  templateLabel,
  xmlLabel,
  apiLabel,
  addNewLabel,
}) => {
  const {
    fileInputRef,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openFilePicker,
  } = useFileDropzone(isLoadingFile);

  const theme = dropzoneThemeStyles[themeColor] || dropzoneThemeStyles.blue;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
      {/* Upload Dropzone */}
      <div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx,.xls,.csv"
          disabled={isLoadingFile}
          onChange={onFileUpload}
        />
        <div
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4 ${
            isLoadingFile
              ? "pointer-events-none opacity-60 cursor-not-allowed"
              : ""
          } ${isDragging ? theme.dragging : theme.border}`}
        >
          <div className="flex items-center gap-4 text-left">
            <div
              className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border ${theme.iconText} ${theme.iconBorder}`}
            >
              <Upload size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                {isLoadingFile ? loadingTitle : title}
              </h4>
              {description && (
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isLoadingFile}
            onClick={(e) => {
              e.stopPropagation();
              openFilePicker();
            }}
            className={`px-5 py-2.5 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap self-stretch md:self-auto flex items-center gap-2 ${theme.btn} ${theme.btnShadow}`}
          >
            <Upload size={15} />
            <span>{isLoadingFile ? "Đang Xử Lý..." : "Chọn Tệp Excel"}</span>
          </button>
        </div>

        {/* Thống kê file đã nạp & chuyển sheet */}
        {uploadStats && (
          <ExcelUploadStatsBar
            selectedSheet={uploadStats.selectedSheet || ""}
            totalRows={uploadStats.totalRows}
            rowUnitLabel={uploadStats.rowUnitLabel}
            matchedColumnsCount={uploadStats.matchedColumnsCount}
            totalColumnsCount={uploadStats.totalColumnsCount}
            fileName={uploadStats.fileName}
            availableSheets={uploadStats.availableSheets}
            themeColor={themeColor}
            onOpenSchemaModal={onOpenSchemaModal}
            onSwitchSheet={onSwitchSheet}
            extraBadge={uploadStats.extraBadge}
          />
        )}
      </div>

      {/* Action Toolbar */}
      <DanhMucActionToolbar
        itemsCount={itemsCount}
        templateLabel={templateLabel}
        xmlLabel={xmlLabel}
        apiLabel={apiLabel}
        addNewLabel={addNewLabel}
        themeColor={themeColor}
        onDownloadTemplate={onDownloadTemplate}
        onLoadSample={onLoadSample}
        onClearData={onClearData}
        onOpenXmlModal={onOpenXmlModal}
        onOpenApiTab={onOpenApiTab}
        onAddNew={onAddNew}
      />
    </div>
  );
};
