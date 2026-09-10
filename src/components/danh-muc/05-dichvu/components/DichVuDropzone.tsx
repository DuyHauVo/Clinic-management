import React, { useRef } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import type { ParseDichVuExcelResult } from '../services/dichVuService';
import { ExcelUploadStatsBar, DanhMucActionToolbar } from '../../common';

import { DICHVU_SCHEMA_FIELDS } from '../services/dichVuService';

interface DichVuDropzoneProps {
  isLoadingFile: boolean;
  fileUploadStats: ParseDichVuExcelResult | null;
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

export const DichVuDropzone: React.FC<DichVuDropzoneProps> = ({
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
  const totalSchemaFields = DICHVU_SCHEMA_FIELDS.length;

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
          className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 flex-shrink-0 border border-emerald-100">
              <Upload size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                {isLoadingFile ? 'Đang đọc và phân tích file Excel DVKT...' : 'Nạp Tệp Excel Danh Mục Dịch Vụ KBCB (Mẫu 05/DM)'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Kéo thả hoặc nhấp để chọn file <code className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono text-[11px]">.xlsx</code>, <code className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono text-[11px]">.xls</code>, <code className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono text-[11px]">.csv</code>. Tự động nhận diện {totalSchemaFields} trường chuẩn QĐ 3176/QĐ-BYT.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-colors flex-shrink-0"
            disabled={isLoadingFile}
          >
            <Upload size={15} />
            <span>Chọn Tệp Excel DVKT</span>
          </button>
        </div>

        {/* Upload stats feedback & Multi-sheet switcher */}
        {fileUploadStats && (
          <ExcelUploadStatsBar
            selectedSheet={fileUploadStats.selectedSheet}
            totalRows={fileUploadStats.totalRows}
            rowUnitLabel="dịch vụ kỹ thuật"
            matchedColumnsCount={Object.keys(fileUploadStats.detectedHeaders).length}
            totalColumnsCount={totalSchemaFields}
            fileName={fileUploadStats.fileName}
            availableSheets={fileUploadStats.availableSheets}
            themeColor="emerald"
            onOpenSchemaModal={onOpenSchemaModal}
            onSwitchSheet={onSwitchSheet}
            extraBadge={
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-[11px]">
                <CheckCircle2 size={13} />
                <span>Sẵn sàng sinh chuỗi XML Loại 12</span>
              </div>
            }
          />
        )}
      </div>

      {/* Quick Actions Toolbar */}
      <DanhMucActionToolbar
        itemsCount={itemsCount}
        addNewLabel="Thêm DVKT Mới"
        templateLabel="Tải Mẫu Excel DVKT"
        xmlLabel="Xem XML / Base64"
        apiLabel="Gửi Cổng BHXH (Loại 12)"
        themeColor="emerald"
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
