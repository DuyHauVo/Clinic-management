import React, { useRef } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import type { ParseHs01ExcelResult } from '../services/hs01TongHopService';
import { ExcelUploadStatsBar, DanhMucActionToolbar } from '../../../danh-muc/common';
import { HS01_SCHEMA_FIELDS } from '../services/hs01TongHopService';

interface Hs01DropzoneProps {
  isLoadingFile: boolean;
  fileUploadStats: ParseHs01ExcelResult | null;
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

export const Hs01Dropzone: React.FC<Hs01DropzoneProps> = ({
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
  const totalSchemaFields = HS01_SCHEMA_FIELDS.length;

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
          accept=".xlsx,.xls,.csv"
          onChange={onFileUpload}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4 ${
            isDragging
              ? 'border-indigo-600 bg-indigo-100/80 scale-[1.008] shadow-md shadow-indigo-500/10'
              : 'border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50'
          }`}
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 flex-shrink-0 border border-indigo-100">
              <Upload size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                {isLoadingFile ? 'Đang đọc và phân tích file Excel Hồ sơ tổng hợp...' : 'Nạp Tệp Excel Hồ Sơ Tổng Hợp KBCB (Mẫu 01/BH)'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Kéo thả hoặc nhấp để chọn file <code className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-[11px]">.xlsx</code>, <code className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-[11px]">.xls</code>, <code className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-[11px]">.csv</code>. Tự động nhận diện & đối soát {totalSchemaFields} trường thông tin chuẩn BHXH.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-colors flex-shrink-0"
            disabled={isLoadingFile}
          >
            <Upload size={15} />
            <span>Chọn Tệp Excel 01/BH</span>
          </button>
        </div>

        {/* Upload stats feedback & Multi-sheet switcher */}
        {fileUploadStats && (
          <ExcelUploadStatsBar
            selectedSheet={fileUploadStats.selectedSheet}
            totalRows={fileUploadStats.totalRows}
            rowUnitLabel="hồ sơ tổng hợp"
            matchedColumnsCount={Object.keys(fileUploadStats.detectedHeaders).length}
            totalColumnsCount={totalSchemaFields}
            fileName={fileUploadStats.fileName}
            availableSheets={fileUploadStats.availableSheets}
            themeColor="indigo"
            onOpenSchemaModal={onOpenSchemaModal}
            onSwitchSheet={onSwitchSheet}
            extraBadge={
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-[11px]">
                <CheckCircle2 size={13} />
                <span>Sẵn sàng sinh XML & Base64 Loại HS 5</span>
              </div>
            }
          />
        )}
      </div>

      {/* Quick Actions Toolbar */}
      <DanhMucActionToolbar
        itemsCount={itemsCount}
        addNewLabel="Thêm Hồ Sơ Mới"
        templateLabel="Tải Mẫu Excel 01/BH"
        xmlLabel="Xem XML / Base64"
        apiLabel="Gửi Cổng BHXH (Loại 5)"
        themeColor="indigo"
        onAddNew={onAddNew}
        onDownloadTemplate={onDownloadTemplate}
        onOpenXmlModal={onOpenXmlModal}
        onOpenApiTab={onOpenApiTab}
        onLoadSample={onLoadSample}
        onClearData={onClearData}
      />
    </div>
  );
};
