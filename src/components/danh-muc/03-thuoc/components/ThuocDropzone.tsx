import React, { useRef } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import type { ParseThuocExcelResult } from '../services/thuocService';
import { ExcelUploadStatsBar, DanhMucActionToolbar } from '../../common';

interface ThuocDropzoneProps {
  isLoadingFile: boolean;
  fileUploadStats: ParseThuocExcelResult | null;
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

export const ThuocDropzone: React.FC<ThuocDropzoneProps> = ({
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
          className="border-2 border-dashed border-blue-300 hover:border-[#1677ff] bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#1677ff] flex-shrink-0 border border-blue-100">
              <Upload size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                {isLoadingFile ? 'Đang đọc và phân tích file Excel Thuốc...' : 'Nạp Tệp Excel Danh Mục Thuốc BHYT Từ Máy Tính'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Kéo thả hoặc nhấp để chọn file <code className="bg-blue-100 text-[#1677ff] px-1.5 py-0.5 rounded font-mono text-[11px]">.xlsx</code>, <code className="bg-blue-100 text-[#1677ff] px-1.5 py-0.5 rounded font-mono text-[11px]">.xls</code>, <code className="bg-blue-100 text-[#1677ff] px-1.5 py-0.5 rounded font-mono text-[11px]">.csv</code>. Tự động đối soát 37 trường dữ liệu chuẩn QĐ 130/QĐ-BYT.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2.5 bg-[#1677ff] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-colors flex-shrink-0"
            disabled={isLoadingFile}
          >
            <Upload size={15} />
            <span>Chọn Tệp Excel Thuốc</span>
          </button>
        </div>

        {/* Upload stats feedback & Multi-sheet switcher (Shared Component) */}
        {fileUploadStats && (
          <ExcelUploadStatsBar
            selectedSheet={fileUploadStats.selectedSheet}
            totalRows={fileUploadStats.totalRows}
            rowUnitLabel="mặt hàng"
            matchedColumnsCount={fileUploadStats.matchedFields.length}
            totalColumnsCount={37}
            fileName={fileUploadStats.fileName}
            availableSheets={fileUploadStats.sheets}
            themeColor="blue"
            onOpenSchemaModal={onOpenSchemaModal}
            onSwitchSheet={onSwitchSheet}
            extraBadge={
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-[11px]">
                <CheckCircle2 size={13} />
                <span>Sẵn sàng sinh chuỗi XML Loại 10</span>
              </div>
            }
          />
        )}
      </div>

      {/* Quick Actions Toolbar (Shared Component) */}
      <DanhMucActionToolbar
        itemsCount={itemsCount}
        templateLabel="Tải File Mẫu Excel (03/DM)"
        xmlLabel="Xem & Xuất File XML (03/DM)"
        apiLabel="Gửi Cổng BHXH (GuiDanhMuc03)"
        addNewLabel="Thêm Thuốc Mới"
        themeColor="blue"
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
