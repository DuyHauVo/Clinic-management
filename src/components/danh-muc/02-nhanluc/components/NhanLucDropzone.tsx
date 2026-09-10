import React, { useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  Sparkles,
  Trash2,
  FileCode,
  Send,
  Plus,
  CheckCircle2,
  Check
} from 'lucide-react';
import type { ParseNhanLucExcelResult } from '../services/nhanLucService';

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
          className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4"
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

        {/* Upload stats feedback & Multi-sheet switcher */}
        {fileUploadStats && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-slate-500">Sheet đã nạp: <strong className="text-slate-900 font-bold">{fileUploadStats.sheetName}</strong></span>
                <span className="text-slate-500">Dòng trích xuất: <strong className="text-emerald-700 font-bold">{fileUploadStats.totalRows} nhân sự</strong></span>
                <button
                  type="button"
                  onClick={onOpenSchemaModal}
                  className="text-slate-600 hover:text-indigo-700 transition-all flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 font-medium cursor-pointer shadow-2xs group"
                  title="Bấm để xem chi tiết đối soát từng cột"
                >
                  <span>Cột khớp chuẩn:</span>
                  <strong className="text-indigo-700 font-bold group-hover:underline">
                    {fileUploadStats.recognizedColumns.length}/24 trường
                  </strong>
                  <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-md font-bold">
                    Chi tiết
                  </span>
                </button>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-[11px]">
                <CheckCircle2 size={13} />
                <span>Sẵn sàng sinh chuỗi XML & Base64 Loại 71</span>
              </div>
            </div>

            {/* Multi-Sheet Selector */}
            {fileUploadStats.sheets && fileUploadStats.sheets.length > 1 && (
              <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1">
                  <FileSpreadsheet size={14} className="text-indigo-600" />
                  Chọn Sheet đọc dữ liệu ({fileUploadStats.sheets.length} sheets):
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {fileUploadStats.sheets.map((sheet) => {
                    const isSelected = fileUploadStats.selectedSheet === sheet.name;
                    return (
                      <button
                        key={sheet.name}
                        type="button"
                        onClick={() => onSwitchSheet(sheet.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>{sheet.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {sheet.rowCount} dòng
                        </span>
                        {isSelected && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions Toolbar */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onDownloadTemplate}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} className="text-slate-500" />
            <span>Tải File Mẫu Excel (02/DM)</span>
          </button>

          <button
            type="button"
            onClick={onLoadSample}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles size={14} className="text-amber-600" />
            <span>Nạp Dữ Liệu Mẫu Thử Nghiệm</span>
          </button>

          {itemsCount > 0 && (
            <button
              type="button"
              onClick={onClearData}
              className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={14} className="text-rose-500" />
              <span>Làm Trống Bảng</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenXmlModal}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileCode size={15} />
            <span>Xem & Xuất File XML (02/DM)</span>
          </button>

          <button
            type="button"
            onClick={onOpenApiTab}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
          >
            <Send size={15} />
            <span>Gửi Cổng BHXH (GuiDanhMuc02)</span>
          </button>

          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-colors"
          >
            <Plus size={15} />
            <span>Thêm Nhân Lực Mới</span>
          </button>
        </div>
      </div>
    </div>
  );
};
