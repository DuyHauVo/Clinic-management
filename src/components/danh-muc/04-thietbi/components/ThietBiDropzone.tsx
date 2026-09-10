import React, { useRef } from "react";
import {
  Upload,
  Download,
  Sparkles,
  Trash2,
  FileCode,
  Send,
  Plus,
} from "lucide-react";
import type { ParseThietBiExcelResult } from "../services/thietBiService";
import { ExcelUploadStatsBar } from "../../common";

interface ThietBiDropzoneProps {
  isLoadingFile: boolean;
  fileUploadStats: ParseThietBiExcelResult | null;
  itemsCount: number;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchSheet: (sheetName: string) => void;
  onDownloadTemplate: () => void;
  onLoadSample: () => void;
  onClearData: () => void;
  onOpenXmlModal: () => void;
  onOpenApiTab: () => void;
  onOpenSchemaModal: () => void;
  onAddNew: () => void;
}

export const ThietBiDropzone: React.FC<ThietBiDropzoneProps> = ({
  isLoadingFile,
  fileUploadStats,
  itemsCount,
  onFileUpload,
  onSwitchSheet,
  onDownloadTemplate,
  onLoadSample,
  onClearData,
  onOpenXmlModal,
  onOpenApiTab,
  onOpenSchemaModal,
  onAddNew,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
      {/* Upload Dropzone */}
      <div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx,.xls"
          onChange={onFileUpload}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-cyan-300 hover:border-cyan-600 bg-cyan-50/40 hover:bg-cyan-50/70 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-cyan-600 flex-shrink-0 border border-cyan-100">
              <Upload size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                {isLoadingFile
                  ? "Đang đọc và bóc tách file Excel Thiết bị y tế..."
                  : "Nạp Tệp Excel Danh Mục Thiết Bị Y Tế (Mẫu 04/DM) Từ Máy Tính"}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Kéo thả hoặc nhấp để chọn file{" "}
                <code className="bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-mono text-[11px]">
                  .xlsx
                </code>
                ,{" "}
                <code className="bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-mono text-[11px]">
                  .xls
                </code>
                . Tự động đối soát 26 trường thông tin chuẩn BHXH Việt Nam.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 flex items-center gap-2 transition-colors flex-shrink-0"
            disabled={isLoadingFile}
          >
            <Upload size={15} />
            <span>Chọn Tệp TBYT</span>
          </button>
        </div>

        {/* Upload stats feedback & Multi-sheet switcher (Shared Component) */}
        {fileUploadStats && (
          <ExcelUploadStatsBar
            selectedSheet={fileUploadStats.selectedSheet}
            totalRows={fileUploadStats.totalRows}
            rowUnitLabel="vật tư / thiết bị"
            matchedColumnsCount={Object.keys(fileUploadStats.detectedHeaders).length}
            totalColumnsCount={26}
            fileName={fileUploadStats.fileName}
            availableSheets={fileUploadStats.availableSheets}
            themeColor="cyan"
            onOpenSchemaModal={onOpenSchemaModal}
            onSwitchSheet={onSwitchSheet}
          />
        )}
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onDownloadTemplate}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Tải tệp Excel mẫu chứa 26 cột chuẩn theo quy định Bộ Y tế & BHXH Việt Nam"
          >
            <Download size={14} className="text-slate-500" />
            <span>Tải Tệp Excel Mẫu Chuẩn</span>
          </button>

          <button
            type="button"
            onClick={onLoadSample}
            className="px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-cyan-200/60"
            title="Nạp dữ liệu mẫu gồm 5 thiết bị / vật tư y tế chuẩn"
          >
            <Sparkles size={14} className="text-cyan-600" />
            <span>Nạp Dữ Liệu Mẫu</span>
          </button>

          {itemsCount > 0 && (
            <button
              type="button"
              onClick={onClearData}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-rose-200/60"
              title="Xóa danh sách thiết bị hiện tại"
            >
              <Trash2 size={14} />
              <span>Xóa Hết ({itemsCount})</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenXmlModal}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            title="Xem mã XML hoặc chuỗi Base64 ký số theo cấu trúc quy định"
          >
            <FileCode size={14} className="text-cyan-400" />
            <span>Xem Cấu Trúc XML (Loại HS 11)</span>
          </button>

          <button
            type="button"
            onClick={onOpenApiTab}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            title="Gửi dữ liệu danh mục lên Cổng tiếp nhận Giám định BHYT (Sandbox)"
          >
            <Send size={14} />
            <span>Gửi Cổng BHXH (API)</span>
          </button>

          <button
            type="button"
            onClick={onAddNew}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Thêm Mới Thiết Bị</span>
          </button>
        </div>
      </div>
    </div>
  );
};
