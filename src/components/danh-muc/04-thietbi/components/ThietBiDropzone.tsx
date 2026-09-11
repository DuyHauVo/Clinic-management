import React, { useRef } from "react";
import { Upload } from "lucide-react";
import type { ParseThietBiExcelResult } from "../services/thietBiService";
import { ExcelUploadStatsBar, DanhMucActionToolbar } from "../../common";

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
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoadingFile) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isLoadingFile) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0 && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(files[0]);
      fileInputRef.current.files = dt.files;
      const changeEvent = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(changeEvent);
    }
  };

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
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4 ${
            isDragging
              ? "border-cyan-600 bg-cyan-100/80 scale-[1.008] shadow-md shadow-cyan-600/10"
              : "border-2 border-dashed border-cyan-300 hover:border-cyan-600 bg-cyan-50/40 hover:bg-cyan-50/70"
          }`}
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

      {/* Action Toolbar (Shared Component) */}
      <DanhMucActionToolbar
        itemsCount={itemsCount}
        templateLabel="Tải Tệp Excel Mẫu Chuẩn"
        templateTooltip="Tải tệp Excel mẫu chứa 26 cột chuẩn theo quy định Bộ Y tế & BHXH Việt Nam"
        sampleTooltip="Nạp dữ liệu mẫu gồm 5 thiết bị / vật tư y tế chuẩn"
        xmlLabel="Xem Cấu Trúc XML (Loại HS 11)"
        xmlTooltip="Xem mã XML hoặc chuỗi Base64 ký số theo cấu trúc quy định"
        apiLabel="Gửi Cổng BHXH (API)"
        apiTooltip="Gửi dữ liệu danh mục lên Cổng tiếp nhận Giám định BHYT (Sandbox)"
        addNewLabel="Thêm Mới Thiết Bị"
        themeColor="cyan"
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
