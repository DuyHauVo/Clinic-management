import React, { useRef } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import type { ParseNhanLucExcelResult } from '../services/nhanLucService';
import { ExcelUploadStatsBar, DanhMucActionToolbar } from '../../common';

interface NhanLucDropzoneProps {
  isLoadingFile: boolean;
  fileUploadStats: ParseNhanLucExcelResult | null;
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

export const NhanLucDropzone: React.FC<NhanLucDropzoneProps> = ({
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
  onAddNew
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
              ? 'border-indigo-600 bg-indigo-100/80 scale-[1.008] shadow-md shadow-indigo-600/10'
              : 'border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 hover:bg-indigo-50/70'
          }`}
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-700 flex-shrink-0 border border-indigo-100">
              <Upload size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                {isLoadingFile ? 'Đang đọc và bóc tách file Excel Nhân lực...' : 'Nạp Tệp Excel Danh Mục Nhân Lực (Mẫu 02/DM) Từ Máy Tính'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Kéo thả hoặc nhấp để chọn file <code className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-[11px]">.xlsx</code>, <code className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-[11px]">.xls</code>. Tự động đối soát 24 trường thông tin chuẩn BHXH Việt Nam.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-colors flex-shrink-0"
            disabled={isLoadingFile}
          >
            <Upload size={15} />
            <span>Chọn Tệp Nhân Lực</span>
          </button>
        </div>

        {/* Upload stats feedback & Multi-sheet switcher (Shared Component) */}
        {fileUploadStats && (
          <ExcelUploadStatsBar
            selectedSheet={fileUploadStats.sheetName || fileUploadStats.selectedSheet || ''}
            totalRows={fileUploadStats.totalRows}
            rowUnitLabel="nhân sự"
            matchedColumnsCount={fileUploadStats.recognizedColumns.length}
            totalColumnsCount={24}
            fileName={fileUploadStats.fileName}
            availableSheets={fileUploadStats.sheets}
            themeColor="indigo"
            onOpenSchemaModal={onOpenSchemaModal}
            onSwitchSheet={onSwitchSheet}
            extraBadge={
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-[11px]">
                <CheckCircle2 size={13} />
                <span>Sẵn sàng sinh chuỗi XML & Base64 Loại 71</span>
              </div>
            }
          />
        )}
      </div>

      {/* Quick Actions Toolbar (Shared Component) */}
      <DanhMucActionToolbar
        itemsCount={itemsCount}
        templateLabel="Tải File Mẫu Excel (02/DM)"
        xmlLabel="Xem & Xuất File XML (02/DM)"
        apiLabel="Gửi Cổng BHXH (GuiDanhMuc02)"
        addNewLabel="Thêm Nhân Lực Mới"
        themeColor="indigo"
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
